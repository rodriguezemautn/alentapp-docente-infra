---
marp: true
theme: uncover
class:
  - lead
  - invert
---

# 🔍 Observabilidad
## Prometheus & Grafana

Introducción al monitoreo de aplicaciones con métricas

---

## ¿Qué es Observabilidad?

> **"La observabilidad es la capacidad de hacer preguntas al sistema sobre lo que está pasando, sin importar si anticipaste esas preguntas."**
>
> — Charity Majors (Honeycomb)

---

## Monitoreo ≠ Observabilidad

| Monitoreo | Observabilidad |
|-----------|---------------|
| ¿El sistema está caído? | ¿Por qué está lento? |
| Dashboards fijos | Consultas ad-hoc |
| Reacciona a lo conocido | Descubre lo desconocido |
| "Sabemos qué esperar" | "No sabemos qué no sabemos" |

---

## Los 3 Pilares

```
┌──────────────────────────────────────────┐
│           OBSERVABILIDAD                  │
├──────────┬─────────────┬──────────────────┤
│ Métricas │    Logs     │      Trazas      │
│ Prom.    │    Loki     │      Jaeger      │
│ ¿Qué?    │  ¿Qué pasó? │  ¿Por qué pasó?  │
│ Números  │    Texto    │      Flujo       │
└──────────┴─────────────┴──────────────────┘
```

Hoy: **Métricas con Prometheus + Grafana** 🎯

---

## ¿Por qué Prometheus?

- 📊 Modelo de datos dimensional (labels)
- 🔄 Pull-based (scrapea métricas)
- ⚡ Rápido, simple, un solo binario
- 🐳 Estándar en el mundo Cloud Native (CNCF)

> "Prometheus es el estándar de facto para métricas en Kubernetes y más allá."

---

## Modelo de Datos de Prometheus

```promql
http_requests_total{
    method="GET",
    route="/api/v1/sports",
    status="200"
} 42
```

| Componente | Ejemplo |
|-----------|---------|
| **Metric name** | `http_requests_total` |
| **Labels** | `method`, `route`, `status` |
| **Value** | `42` |

---

## Tipos de Métricas

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **Counter** | Solo aumenta | Requests, errores |
| **Gauge** | Sube y baja | Memoria, conexiones |
| **Histogram** | Distribución | Latencia de requests |
| **Summary** | Percentiles | Latencia p99 |

---

## PromQL — Consultas

```promql
# Todos los requests (contador total)
http_requests_total

# Tasa por segundo (último minuto)
rate(http_requests_total[1m])

# Agrupado por código HTTP
rate(http_requests_total[5m]) by (status)

# Percentil 99 de latencia
histogram_quantile(0.99,
  rate(http_request_duration_seconds_bucket[5m]))
```

---

## Arquitectura del Lab

```
┌──────────┐    scrape     ┌───────────┐
│  API     │◄─────────────│ Prometheus │
│ /metrics │   cada 15s    │  :9090    │
└──────────┘               └─────┬─────┘
                                 │ query
                                 ▼
                          ┌───────────┐
                          │  Grafana  │
                          │  :3000    │
                          └───────────┘
```

---

## Paso 1: Agregar métricas a la API

```bash
# Instalar plugin
npm -w packages/api install fastify-metrics

# En app.ts
import metrics from 'fastify-metrics';
server.register(metrics, { endpoint: '/metrics' });

# Verificar
curl http://localhost:3000/metrics | head
```

**Resultado:** endpoint `/metrics` con datos de requests, latencia, memoria.

---

## Paso 2: Configurar Prometheus

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'alentapp-api'
    static_configs:
      - targets: ['host.docker.internal:3000']
```

```bash
docker compose -f observability/docker-compose.obs.yml up -d
```

---

## Paso 3: Verificar Targets

Abrí: **http://localhost:9090/targets**

```
alentapp-api  → UP ✅
prometheus    → UP ✅
```

> Si un target está DOWN, revisá que la API esté corriendo y que Prometheus pueda alcanzarla.

---

## Paso 4: Consultar en Prometheus

Abrí: **http://localhost:9090/graph**

Probá estas queries:

```
rate(http_requests_total[1m])
process_resident_memory_bytes / 1024 / 1024
rate(http_requests_total[5m]) by (status)
```

---

## Paso 5: Grafana — Configuración

```
http://localhost:3001
User: admin
Pass: admin
```

✅ Datasource Prometheus precargado
✅ Dashboard precargado

**O crealo desde cero** → Prometheus URL: `http://prometheus:9090`

---

## Paso 6: Dashboard — Requests x Segundo

```
Query: rate(http_requests_total[1m])
Legend: {{method}} {{route}}
Type: Graph
```

📈 Muestra el throughput de la API en tiempo real.

---

## Paso 7: Dashboard — Latencia p99

```
Query: histogram_quantile(0.99,
  rate(http_request_duration_seconds_bucket[5m]))
Legend: p99 {{method}} {{route}}
Unit: seconds
```

⏱️ El percentil 99 ignora el 1% más lento.

---

## Paso 8: Dashboard — Códigos HTTP

```
Query A: rate(http_requests_total{status=~"2.."}[5m])
Query B: rate(http_requests_total{status=~"4.."}[5m])
Query C: rate(http_requests_total{status=~"5.."}[5m])
```

🔴 5xx = errores de servidor (urgen atención)
🟡 4xx = errores de cliente (pueden esperar)
🟢 2xx = éxito

---

## Paso 9: Dashboard — Memoria

```
Query: process_resident_memory_bytes / 1024 / 1024
Legend: RSS (MB)
```

> Si la memoria crece sin parar → memory leak 🚨

---

## Paso 10: Generar tráfico

```bash
for i in {1..50}; do
  curl -s http://localhost:3000/api/v1/sports > /dev/null
  curl -s http://localhost:3000/api/v1/socios > /dev/null
  sleep 0.1
done
```

Mirá cómo reaccionan los gráficos en Grafana en tiempo real ⚡

---

## Interpretación de Métricas

| Métrica | Valor Bueno | Atención | Crítico |
|---------|-------------|----------|---------|
| Requests/s | 100-1000 | < 10 | 0 |
| Latencia p99 | < 100ms | 200-500ms | > 1s |
| Error 5xx | 0% | < 1% | > 5% |
| Memoria | < 200MB | 200-400MB | > 500MB |

---

## Alertas en Grafana

```
WHEN max() OF query(A, 5m, now) IS ABOVE 1
→ "API lenta — latencia p99 > 1s"
```

- 📧 Puede notificar por email, Slack, Discord
- 🔄 Evalúa cada 30s
- 🚨 Si se dispara → investigar

---

## Bonus: Métricas de Negocio

```promql
# Socios creados por día
rate(http_requests_total{
  method="POST",
  route="/api/v1/socios"
}[24h])

# Ingresos (requiere métrica personalizada)
```

> Las métricas de negocio responden preguntas como:
> "¿cuántos socios se registraron hoy?"

---

## ¿Qué sigue?

| Tema | Herramienta |
|------|------------|
| 📝 Logs | Loki + Promtail + Grafana |
| 🔍 Trazas | Jaeger / Tempo |
| 📊 Más dashboards | Grafana Advanced |
| 🚨 Alertas | Alertmanager |
| ☸️ Kubernetes | kube-prometheus-stack |

---

## Referencias

- [Prometheus Docs](https://prometheus.io/docs/)
- [Grafana Docs](https://grafana.com/docs/)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [USE Method (Brendan Gregg)](https://www.brendangregg.com/usemethod.html)
- [Fastify Metrics](https://github.com/Sanshain/fastify-metrics)

---

## ¡Manos a la obra! 🚀

```bash
# 1. Ir al repo
cd alentapp-docente-infra

# 2. Ir a la rama del lab
git checkout feat/observability-lab

# 3. Seguir la guía
# docs/observability/lab-guide.md
```

**Ejercicios:**
1. Dashboard de salud
2. Alerta de latencia
3. Dashboard de errores
4. Métricas de negocio
