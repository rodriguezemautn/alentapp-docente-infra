# Notas Académicas — Actividad 4: Preparando para Producción (v2 Profesional)

> **Tema**: Observabilidad profesional, Docker production, OpenTelemetry, alertas
> **Materia**: Ingeniería y Calidad de Software — 2026
> **Autor**: Cátedra

---

## 1. Resumen

Esta actividad lleva la aplicación desde un entorno de desarrollo Docker básico a una **arquitectura de producción profesional** con observabilidad 360°. Se implementaron:

- Multi-stage builds con optimización de capas y seguridad
- OpenTelemetry con auto-instrumentación HTTP y métricas RED/USE/Business
- 4 dashboards de Grafana provisionados (RED, USE, Negocio, UX)
- Alertas con Prometheus rules + Alertmanager
- Stack de observabilidad completo (cAdvisor, node-exporter, Prometheus, Grafana)

---

## 2. Arquitectura de Observabilidad

### 2.1. Las 4 capas de métricas

```
┌─────────────────────────────────────────────────────┐
│                    GRAFANA                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │  RED     │ │  USE     │ │ Business │ │   UX   │ │
│  │  (API)   │ │  (Infra) │ │ (Domain) │ │(Frond) │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬───┘ │
└───────┼────────────┼────────────┼────────────┼──────┘
        │            │            │            │
        ▼            ▼            ▼            ▼
   ┌────────────────────────────────────────────────┐
   │                  PROMETHEUS                     │
   │        + Alertmanager + Reglas de alerta       │
   └────┬───────────────┬────────────────┬──────────┘
        │               │                │
        ▼               ▼                ▼
   OTel SDK        cAdvisor         node-exporter
   (:9464)         (:8080)          (:9100)
   (API)           (containers)     (host)
```

### 2.2. Lecciones aprendidas

#### Multi-stage builds

| Lección | Detalle |
|---------|---------|
| **Cache de capas** | El orden de los COPY importa: primero `package*.json`, después el código. Así `npm ci` se cachea cuando no cambian las dependencias. |
| **Build vs Runtime** | La stage `build` necesita TODAS las dependencias (incluyendo dev para compilar). La stage `runtime` solo necesita las de producción. Esto se resuelve con dos stages separadas: `deps` (--omit=dev) y `build` (npm ci completo). |
| **Prisma generate** | `prisma generate` debe ejecutarse en runtime (no en build) porque el cliente generado depende del schema, que está en el contexto de build. |
| **Tamaño final** | API: ~1GB → < 300MB. Web: ~570MB → < 170MB. La clave es usar imágenes base mínimas (`node:22-alpine`, `nginx:stable-alpine`) y solo copiar lo necesario. |

#### Hardening de seguridad

| Lección | Detalle |
|---------|---------|
| **read_only + tmpfs** | `read_only: true` protege el filesystem pero rompe cosas: nginx necesita `/var/run` y `/var/cache/nginx`, Node.js necesita `/tmp`. La solución es montar `tmpfs` para esos directorios. |
| **cap_drop ALL** | Dropear todas las capabilities de Linux y solo agregar `NET_BIND_SERVICE` (para que node pueda bindear puertos < 1024 si fuera necesario). |
| **No-root** | `USER appuser` en el Dockerfile. Verificar que ningún proceso quede corriendo como root. |
| **Secrets** | Usar `${VAR:?error}` en docker-compose.yml para forzar que las variables se definan. Nunca hardcodear passwords. |

#### OpenTelemetry

| Lección | Detalle |
|---------|---------|
| **Auto-instrumentación vs Custom** | La auto-instrumentación de OTel captura automáticamente métricas HTTP (`http.server.duration.*`) con labels de method, route y status. NO es necesario implementar métricas manualmente en cada controller — eso duplica trabajo y métricas. |
| **Un solo endpoint** | Tener dos endpoints de métricas (`:3000/metrics` con fastify-metrics y `:9464/metrics` con OTel) es confuso. La decisión correcta: OTel en producción, fastify-metrics solo en desarrollo. |
| **PrometheusExporter vs OTLP** | PrometheusExporter es la opción más simple para empezar (exporta directamente en formato Prometheus). Para producción avanzada, conviene migrar a OTLP con un collector intermedio. |

#### Dashboards

| Lección | Detalle |
|---------|---------|
| **Provisioning vs manual** | Los dashboards como JSON (Infrastructure as Code) son versionables, reproducibles y se cargan automáticamente. Crearlos en la UI de Grafana es más fácil al principio pero no escala. |
| **RED no alcanza** | Las métricas RED (Rate/Errors/Duration) miden la salud de la API pero no del sistema completo. Para eso están USE (infraestructura), Business (negocio) y UX (usuario). |
| **Consultas PromQL** | `rate(http_server_duration_count[1m])` vs `sum by(status) (rate(http_server_duration_count[5m]))`. Entender la diferencia entre `rate` (tasa instantánea) y `increase` (incremento en el período) es clave para dashboards correctos. |

#### Alertas

| Lección | Detalle |
|---------|---------|
| **Umbrales** | Definir umbrales muy sensibles genera fatiga de alertas. 5% de error rate, 2s de latencia p99 y 80% de memoria son puntos de partida razonables. |
| **Alertmanager** | Alertmanager es necesario para agrupar alertas duplicadas, silenciar ruido y rutear a diferentes destinos (email, Slack, webhook). Sin él, cada evaluación de regla genera una alerta independiente. |
| **severidad** | Usar CRITICAL para cosas que afectan usuarios (API caída) y WARNING para degradaciones graduales (latencia alta, memoria alta). |

---

## 3. Referencias

- [RED Method](https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/) — Tom Wilkie
- [USE Method](https://www.brendangregg.com/usemethod.html) — Brendan Gregg
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker security best practices](https://docs.docker.com/engine/security/)
- [PromQL basics](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Core Web Vitals](https://web.dev/vitals/)
