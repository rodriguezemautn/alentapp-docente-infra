# Laboratorio de Observabilidad — Prometheus + Grafana

> **Actividad 5** — Introducción a la observabilidad con monitoreo de métricas
>
> **Duración**: 3 horas (1 teórica + 2 práctica)
> **Tema**: Observabilidad, Prometheus, Grafana, métricas en Node.js

---

## Índice

1. [Objetivos](#1-objetivos)
2. [Conceptos Clave](#2-conceptos-clave)
3. [Requisitos](#3-requisitos)
4. [Paso 1: Agregar métricas a la API](#4-paso-1-agregar-métricas-a-la-api)
5. [Paso 2: Levantar Prometheus](#5-paso-2-levantar-prometheus)
6. [Paso 3: Consultar métricas en Prometheus](#6-paso-3-consultar-métricas-en-prometheus)
7. [Paso 4: Configurar Grafana](#7-paso-4-configurar-grafana)
8. [Paso 5: Crear dashboard](#8-paso-5-crear-dashboard)
9. [Paso 6: Generar tráfico y observar](#9-paso-6-generar-tráfico-y-observervar)
10. [Ejercicios](#10-ejercicios)

---

## 1. Objetivos

Al finalizar este laboratorio, los alumnos serán capaces de:

- ✅ Explicar la diferencia entre monitoreo, observabilidad y telemetría
- ✅ Agregar un endpoint `/metrics` a una aplicación Node.js/Fastify
- ✅ Configurar Prometheus para recolectar métricas
- ✅ Construir un dashboard en Grafana con gráficos en tiempo real
- ✅ Interpretar métricas de rendimiento (requests por segundo, latencia p99, errores)
- ✅ Identificar un cuello de botella usando los datos del dashboard

---

## 2. Conceptos Clave

### 2.1. Observabilidad vs. Monitoreo

| Concepto | Definición |
|----------|------------|
| **Monitoreo** | Saber si algo anda mal. Dashboards, alerts, uptime. |
| **Observabilidad** | Poder preguntarle al sistema QUÉ anda mal y POR QUÉ, incluso para problemas que no anticipaste. |
| **Telemetría** | Los datos que el sistema emite: logs, métricas, traces. |

### 2.2. Los 3 Pilares de la Observabilidad

```
┌──────────────────────────────────────────────┐
│              OBSERVABILIDAD                   │
├─────────────────┬──────────────┬──────────────┤
│    📊 Métricas  │  📝 Logs     │  🔍 Trazas   │
│  (Prometheus)   │  (Loki/ELK)  │  (Jaeger)    │
│  ¿Qué está      │  ¿Qué pasó?  │  ¿Por qué    │
│  pasando?       │              │  pasó?       │
│  Cuantitativo   │  Textual     │  Flujo       │
└─────────────────┴──────────────┴──────────────┘
```

En este laboratorio nos enfocamos en **métricas**.

### 2.3. Prometheus

Prometheus es un sistema de monitoreo y alerta de código abierto. Su modelo de datos es **métricas etiquetadas**:

```
http_requests_total{method="GET", route="/api/v1/sports", status="200"} 42
```

Cada métrica tiene:
- **Nombre**: `http_requests_total`
- **Etiquetas (labels)**: `method`, `route`, `status`
- **Valor**: `42` (un contador)

### 2.4. Tipos de Métricas

| Tipo | Descripción | Ejemplo |
|------|-------------|---------|
| **Counter** | Solo aumenta (requests, errores) | `http_requests_total` |
| **Gauge** | Sube y baja (memoria, conexiones) | `process_memory_bytes` |
| **Histogram** | Distribución de valores (latencias) | `http_request_duration_seconds` |
| **Summary** | Similar a histograma, con percentiles | `http_request_duration_seconds_summary` |

### 2.5. Grafana

Grafana es una plataforma de visualización y dashboards. Se conecta a Prometheus (y otras fuentes) y permite construir gráficos, tablas, y alertas.

---

## 3. Requisitos

- Docker y Docker Compose instalados
- Proyecto Alentapp Docente funcionando (`make dev`)
- Git
- Navegador web

---

## 4. Paso 1: Agregar métricas a la API

### 4.1. Instalar la dependencia

```bash
npm -w packages/api install fastify-metrics
```

Este plugin agrega automáticamente un endpoint `/metrics` con métricas de HTTP requests, duración, y memory de Node.js.

### 4.2. Registrar el plugin en `app.ts`

```typescript
// Import al inicio del archivo
import metrics from 'fastify-metrics';

// Dentro de buildApp(), antes de return server:
server.register(metrics, { endpoint: '/metrics' });
```

### 4.3. Verificar que funciona

```bash
# Reconstruir y levantar
make dev-rebuild

# Consultar métricas
curl http://localhost:3000/metrics | head -30
```

Deberías ver algo como:

```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",route="/api/v1/sports",status="200"} 5
http_requests_total{method="POST",route="/api/v1/socios",status="201"} 3
```

**❌ Si no funciona**: Verificá que `make dev-rebuild` se ejecutó correctamente y que el contenedor de la API se reinició.

---

## 5. Paso 2: Levantar Prometheus

### 5.1. Crear configuración

Archivo `observability/prometheus/prometheus.yml`:

```yaml
global:
  scrape_interval: 15s      # Recolecta métricas cada 15 segundos

scrape_configs:
  - job_name: 'alentapp-api'
    static_configs:
      - targets: ['host.docker.internal:3000']
        labels:
          app: 'alentapp'
          service: 'api'
```

> **Nota**: `host.docker.internal` es un DNS especial que Docker provee para que los contenedores accedan al host. En Linux, puede que necesites usar `172.17.0.1` en su lugar.

### 5.2. Levantar Prometheus

```bash
docker compose -f observability/docker-compose.obs.yml up prometheus -d
```

### 5.3. Verificar

Abrí `http://localhost:9090/targets` en el navegador. Deberías ver:

- `alentapp-api`: **UP** (está recolectando métricas de la API)
- `prometheus`: **UP** (Prometheus se monitorea a sí mismo)

---

## 6. Paso 3: Consultar métricas en Prometheus

### 6.1. Interfaz de consultas

Abrí `http://localhost:9090/graph` y probá estas consultas:

```promql
# Todos los requests HTTP
http_requests_total

# Requests por segundo (rate)
rate(http_requests_total[1m])

# Requests por segundo, agrupados por código HTTP
rate(http_requests_total[5m]) by (status)

# Memoria del proceso en MB
process_resident_memory_bytes / 1024 / 1024

# Latencia p99 de requests
histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))
```

### 6.2. ¿Qué significan estas consultas?

| Consulta | Explicación |
|----------|-------------|
| `http_requests_total` | Contador total de requests desde que arrancó la API |
| `rate(...[1m])` | Promedio de requests por segundo en el último minuto |
| `by (status)` | Agrupa el resultado por el label `status` |
| `histogram_quantile(0.99, ...)` | Calcula el percentil 99 de latencia |
| `/ 1024 / 1024` | Convierte bytes a megabytes |

**❌ Si no hay datos**: Asegurate de haber hecho al menos un request a la API (`curl http://localhost:3000/api/v1/sports`). Prometheus solo muestra métricas de lo que ocurre después de que arranca.

---

## 7. Paso 4: Configurar Grafana

### 7.1. Iniciar Grafana

```bash
docker compose -f observability/docker-compose.obs.yml up grafana -d
```

### 7.2. Acceder

1. Abrí `http://localhost:3001`
2. Usuario: `admin`
3. Contraseña: `admin`
4. (Te va a pedir cambiar la contraseña — podés saltear con "Skip")

### 7.3. Verificar datasource

Grafana ya viene con un datasource de Prometheus preconfigurado (el archivo `datasource.yml` se copia automáticamente).

1. Andá a **Connections → Data Sources**
2. Deberías ver **Prometheus** con status "OK"

**❌ Si no aparece**: Crealo manualmente:
- Type: Prometheus
- URL: `http://prometheus:9090`
- Save & Test

---

## 8. Paso 5: Crear dashboard

### 8.1. Dashboard precargado

El repositorio incluye un dashboard JSON en `observability/grafana/dashboards/alentapp-api.json`. Grafana lo importa automáticamente si el provisioner está configurado.

Para cargarlo manualmente:

1. En Grafana, andá a **Dashboards → New → Import**
2. Cargá el archivo `observability/grafana/dashboards/alentapp-api.json`
3. Seleccioná el datasource Prometheus
4. Click en **Import**

### 8.2. O construílo vos mismo

Si preferís crearlo desde cero:

1. **Create Dashboard → Add Panel**
2. Panel 1 — **Requests por segundo**:
   - Query: `rate(http_requests_total[1m])`
   - Legend: `{{method}} {{route}}`
3. Panel 2 — **Latencia p99**:
   - Query: `histogram_quantile(0.99, rate(http_request_duration_seconds_bucket[5m]))`
   - Unit: `seconds`
4. Panel 3 — **Códigos HTTP**:
   - Query A: `rate(http_requests_total{status=~"2.."}[5m])` (legend: 2xx)
   - Query B: `rate(http_requests_total{status=~"4.."}[5m])` (legend: 4xx)
   - Query C: `rate(http_requests_total{status=~"5.."}[5m])` (legend: 5xx)
5. Panel 4 — **Memoria**:
   - Query: `process_resident_memory_bytes / 1024 / 1024`
   - Unit: `MB`

---

## 9. Paso 6: Generar tráfico y observar

### 9.1. Script de carga

```bash
# Hacer algunos requests a la API
for i in {1..50}; do
  curl -s http://localhost:3000/api/v1/sports > /dev/null
  curl -s http://localhost:3000/api/v1/socios > /dev/null
  curl -s http://localhost:3000/api/v1/disciplinas > /dev/null
  sleep 0.1
done
echo "✅ Tráfico generado"
```

### 9.2. Observar en Grafana

1. Andá al dashboard creado
2. Cambiá el rango de tiempo a **Last 5 minutes**
3. Hacé refresh automático (esquinasuperior derecha → 5s)
4. Ejecutá el script de carga y mirá cómo los gráficos reaccionan en tiempo real

### 9.3. Preguntas para responder

Mirando el dashboard:

- ¿Cuántos requests por segundo está manejando la API?
- ¿Cuál es la latencia p99? ¿Es aceptable?
- ¿Hay errores 5xx? ¿Cuándo ocurren?
- ¿Cuánta memoria consume el proceso?
- ¿Qué endpoints son los más lentos?

---

## 10. Ejercicios

### Ejercicio 1: Dashboard de salud (30 min)

Crear un panel que muestre simultáneamente:
- Requests por segundo (rate)
- Tasa de error (5xx / total)
- Latencia promedio
- Uptime del proceso

**Pista**: Usar `up{job="alentapp-api"}` para uptime.

### Ejercicio 2: Alerta de latencia (45 min)

Configurar una alerta en Grafana que se dispare si la latencia p99 supera 1 segundo por más de 5 minutos.

**Pasos**:
1. En el panel de latencia, andá a **Alert → New Alert Rule**
2. Condición: `WHEN max() OF query(A, 5m, now) IS ABOVE 1`
3. Nombre: "API lenta"
4. Notificar: elegí "None" por ahora (sin canal de notificaciones)

### Ejercicio 3: Dashboard de errores (30 min)

Crear un panel que muestre los endpoints con más errores 4xx y 5xx en la última hora.

**Pista**:
```promql
topk(5, sum by (route) (rate(http_requests_total{status=~"5.."}[1h])))
```

### Ejercicio 4: Bonus — Métricas de negocio (45 min)

Agregar una métrica personalizada que cuente:

- Cantidad de socios creados por día
- Cantidad de pagos procesados
- Monto total facturado

**Pista**: Podés usar el contador `http_requests_total` con filtros:
```promql
rate(http_requests_total{method="POST", route="/api/v1/socios"}[24h])
```

### Ejercicio 5: Investigación (30 min)

Investigar y responder:

1. ¿Qué diferencia hay entre un Counter y un Gauge?
2. ¿Para qué sirve el percentil 99 (p99) vs el promedio?
3. ¿Qué es el "USE method" (Utilization, Saturation, Errors)?
4. ¿Cómo se relaciona la observabilidad con los 12 Factor App?

---

## Criterios de evaluación

| Criterio | Puntos |
|----------|--------|
| Prometheus recolecta métricas de la API | 20 |
| Grafana conectado a Prometheus | 10 |
| Dashboard con 4+ paneles | 25 |
| Script de carga genera tráfico visible | 15 |
| Ejercicio 1 (dashboard de salud) | 10 |
| Ejercicio 2 (alerta de latencia) | 10 |
| Ejercicio 3 (dashboard de errores) | 10 |
| Total | 100 |

---

## Referencias

- [Prometheus Docs](https://prometheus.io/docs/introduction/overview/)
- [Grafana Docs](https://grafana.com/docs/grafana/latest/)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Fastify Metrics Plugin](https://github.com/Sanshain/fastify-metrics)
- [USE Method (Brendan Gregg)](https://www.brendangregg.com/usemethod.html)
- [12 Factor App — Logs](https://12factor.net/logs)
