# 🔍 Observabilidad — Alentapp Docente

Stack de monitoreo para la API de Alentapp, compuesto por **Prometheus** (recolección de métricas) y **Grafana** (visualización y dashboards).

---

## Stack

```
┌──────────┐    scrape     ┌───────────┐     query     ┌───────────┐
│  API     │◄─────────────│ Prometheus │◄─────────────│  Grafana  │
│ /metrics │   cada 15s    │  :9090    │               │  :3001    │
└──────────┘               └───────────┘               └───────────┘
```

| Servicio | Puerto | Acceso | Credenciales |
|----------|--------|--------|-------------|
| **API** (métricas) | `:3000/metrics` | http://localhost:3000/metrics | — |
| **Prometheus** | `:9090` | http://localhost:9090 | — |
| **Grafana** | `:3001` | http://localhost:3001 | `admin / admin` |

---

## Requisitos

- Docker y Docker Compose
- API de Alentapp corriendo (`make dev` o `docker compose up -d`)

---

## Inicio rápido

```bash
# 1. Asegurate que la API esté corriendo con métricas
make dev-rebuild
curl http://localhost:3000/metrics | head -5

# 2. Levantar Prometheus + Grafana
docker compose -f observability/docker-compose.obs.yml up -d

# 3. Verificar targets en Prometheus
open http://localhost:9090/targets

# 4. Abrir Grafana
open http://localhost:3001  # admin / admin
```

---

## Archivos

```
observability/
├── README.md                         ← Este archivo
├── docker-compose.obs.yml            ← Stack completo (Prometheus + Grafana)
├── prometheus/
│   └── prometheus.yml                ← Config de scraping (targets, intervalos)
└── grafana/
    ├── datasources/
    │   └── datasource.yml            ← Datasource Prometheus precargado
    └── dashboards/
        └── alentapp-api.json         ← Dashboard con 4 paneles
```

---

## Dashboard precargado

El dashboard `alentapp-api.json` incluye:

| Panel | Métrica | Descripción |
|-------|---------|-------------|
| 📈 Requests por segundo | `rate(http_requests_total[1m])` | Throughput agrupado por ruta |
| ⏱️ Latencia p99 | `histogram_quantile(0.99, ...)` | Percentil 99 de duración |
| 🔴 Códigos HTTP | `rate(...{status=~"..."}[5m])` | 2xx / 4xx / 5xx |
| 💾 Memoria RSS | `process_resident_memory_bytes` | RAM del proceso Node.js |

Consultas PromQL de ejemplo:

```promql
# Requests totales
http_requests_total

# Tasa por segundo (último minuto)
rate(http_requests_total[1m])

# Errores 5xx agrupados por ruta
topk(5, sum by (route) (rate(http_requests_total{status=~"5.."}[1h])))

# Memoria en MB
process_resident_memory_bytes / 1024 / 1024
```

---

## Para alumnos

Ver la guía completa del laboratorio en:

➡️ [`docs/observability/lab-guide.md`](../docs/observability/lab-guide.md)

Y la presentación en formato Marp:

➡️ [`docs/observability/slides.md`](../docs/observability/slides.md)

---

## Referencias

- [Prometheus Docs](https://prometheus.io/docs/introduction/overview/)
- [Grafana Docs](https://grafana.com/docs/grafana/latest/)
- [PromQL Basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Fastify Metrics Plugin](https://github.com/Sanshain/fastify-metrics)
- [USE Method (Brendan Gregg)](https://www.brendangregg.com/usemethod.html)
