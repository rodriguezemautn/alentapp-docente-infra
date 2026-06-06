# Alerting Specification

## Purpose

Define reglas de alerta en Prometheus y configuración de notificaciones en Grafana para detectar anomalías en el sistema.

## Requirements

### Requirement: Reglas de alerta Prometheus

El sistema MUST tener reglas de alerta definidas en `observability/prometheus/rules/` para: API caída, error rate > 5% en 5m, latencia p99 > 2s en 5m, memoria > 80% en 5m, CPU > 80% en 5m.

#### Scenario: Alerta por API caída

- GIVEN Prometheus evaluando reglas
- WHEN la API deja de responder por > 1m
- THEN la alerta "API Down" se dispara con severity CRITICAL

#### Scenario: Alerta por alta latencia

- GIVEN Prometheus evaluando reglas
- WHEN la latencia p99 supera 2s por 5m consecutivos
- THEN la alerta "High Latency" se dispara con severity WARNING

### Requirement: Contact points Grafana

El sistema SHOULD tener un contact point configurado en Grafana para notificaciones (email, webhook o slack según disponibilidad).

#### Scenario: Notificación de alerta

- GIVEN una alerta disparada en Prometheus
- WHEN Grafana recibe la notificación
- THEN se envía al contact point configurado
- AND la alerta aparece en el dashboard de alertas de Grafana

### Requirement: Alertmanager integrado

El sistema SHOULD incluir Alertmanager en el stack de observabilidad para manejar deduplicación, silenciamiento y ruteo de alertas.

#### Scenario: Alerta notificada una sola vez

- GIVEN múltiples evaluaciones de Prometheus con la misma condición
- WHEN Alertmanager recibe múltiples alertas idénticas
- THEN agrupa en una única notificación
