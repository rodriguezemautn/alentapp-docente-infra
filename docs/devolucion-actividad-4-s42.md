# Devolución Actividad 4 — Comisión S42 (Mañana)

**Fecha**: 09/06/2026
**Propósito**: Feedback constructivo post-entrega y coloquio

---

## Consideraciones Generales

- **7/7 grupos** completaron la Actividad 4 ✅
- **31 alumnos** evaluados
- **Mejora generalizada** respecto al Checkpoint 01 en organización y uso de Git
- **Área de mejora común**: la mayoría priorizó documentación sobre implementación técnica

---

## Grupo 1 — Amado Lautaro

**Repo**: Lauti-Amado/alentapp  
**Integrantes**: AMADO Lautaro, FIGUEIRA Julian, LA GIOIOSA Bernardita, TUNDIS Yamil, BUCCHINO Ulises

### ✅ Logros
- Implementaron hook global `onResponse` para instrumentación — buen approach
- Documentación de diseño con correcciones de instrumentación
- Todos los integrantes contribuyeron (distribución balanceada 16-26%)

### ⚠️ A Mejorar
- No se detectaron Pull Requests ni feature branches explícitos
- Tuvieron que corregir scrap de puerto 3000 (conflicto fastify-metrics vs OTel) — esto debería haberse resuelto en diseño, no en verificación
- La documentación de instrumentación tuvo que corregirse — revisar proceso de revisión interna

### 📝 Recomendaciones
- Usar PRs para distribuir la revisión de código
- Definir en la Fase 2 qué métricas se exponen y en qué puerto, para evitar conflictos en Fase 4

---

## Grupo 2 — Matias Dieguez

**Repo**: naimguar/alentapp  
**Integrantes**: DIEGUEZ Matias, GUARINO Naim, BENITEZ Ignacio, MANRIQUE Agustin

### ✅ Logros
- **Mejor implementación técnica de S42**: multi-stage, OTel, Grafana provisioning, nginx hardening, healthchecks, capabilities
- Commit distribution excelente (20-29% cada uno) — equipo muy balanceado
- Correcciones de nginx capabilities (SETUID/SETGID) — debugging real y bien resuelto
- Feature branches y PRs presentes

### ⚠️ A Mejorar
- Podrían haber documentado más decisiones técnicas (por qué eligieron ciertos parámetros de hardening)
- La optimización de imagen podría haber ido más allá (ver reference ~250MB)

### 📝 Recomendaciones
- Sostener la calidad técnica. Este grupo está listo para actividades más complejas
- Compartir el approach de nginx capabilities con otros grupos que tuvieron el mismo problema

---

## Grupo 3 — Franco Arce

**Repo**: nicodiezz/alentapp  
**Integrantes**: ARCE Franco, BARBE LORENZO Dante, ANDRADA Santiago, DIEZ Nicolas, GIL Ramiro

### ✅ Logros
- Feature branches (feature/grafana, feature/prometheus) y PRs numerados
- Documentación de problemas reales con OTel y métricas RED — debugging genuino
- Script de verificación de paneles Grafana — excelente práctica de calidad
- Entregaron un día antes del plazo (07/06)

### ⚠️ A Mejorar
- **Santiago Andrada**: solo 11 commits (2.6% del grupo). Participación muy baja, requiere justificación
- Nicolas Diez concentra casi el 40% de los commits — distribución muy sesgada
- El script de verificación está buenísimo pero debería estar acompañado de más automation

### 📝 Recomendaciones
- Balancear mejor la carga de trabajo entre integrantes
- Santiago Andrada debe demostrar conocimiento del dominio en el coloquio, aunque haya tenido baja participación en commits

---

## Grupo 4 — Valentina Pertile

**Repo**: ValentinaPertile/alentapp  
**Integrantes**: PERTILE Valentina, SUAREZ Maria Luana, ROMERO Macarena

### ✅ Logros
- Grupo de 3 personas que completó Docker, OTel, Grafana e informe completo
- Feature branches y PRs (#78) presentes
- Tuvieron que arreglar puerto de métricas de Grafana — debugging real

### ⚠️ A Mejorar
- Valentina concentra el 44% de los commits — distribución muy sesgada para un grupo chico
- Podrían haber profundizado más en las configuraciones de seguridad (no se ve tmpfs, read-only, capabilities en detalle)

### 📝 Recomendaciones
- Grupos chicos: rotar liderazgo técnico para que todos aprendan todas las áreas
- Revisar la checklist de seguridad completa antes de entregar

---

## Grupo 5 — Paula Zacarias

**Repo**: MatiasCortes2211/alentapp  
**Integrantes**: ZACARIAS Paula, CEMINO Conrado, CASTAÑO Rodrigo, SCHNEEBERGER Angeles, CORTES Matias

### ✅ Logros
- **Grupo con más commits de S42** (677) — muy activos
- Commit distribution excelente (10-25% cada uno)
- Documentación de decisiones técnicas (healthcheck, separación compose)
- CEMINO Conrado: ✅ **APROBADO en coloquio** — demostró conocimiento del dominio

### ⚠️ A Mejorar
- **SCHNEEBERGER Angeles**: a pesar de 152 commits, baja performance en coloquio. Revisar comprensión del dominio
- **CORTES Matias**: inasistente al coloquio. Regularizar situación
- No se detectaron feature branches explícitos — trabajaron directamente sobre main o sin ramas

### 📝 Recomendaciones
- Angeles: repasar conceptos de OTel, métricas RED y Docker multi-stage para el próximo coloquio
- Matias Cortés: justificar inasistencia y recuperar coloquio
- Incorporar feature branches para mejor organización del trabajo paralelo

---

## Grupo 6 — Mateo Lafalce

**Repo**: TassiMarcelo/alentapp  
**Integrantes**: LAFALCE Mateo, TASSI Marcelo, DELOZANO Matias, DI BELLA Abel, LLONTOP Hebert

### ✅ Logros
- **Mejor organización de PRs de S42**: branches numerados (#151 a #156)
- Comandos de reproducción documentados en GitHub — excelente práctica de replicabilidad
- Debugging real: alineación de queries PromQL con métricas custom
- Entregaron un día antes (07/06)

### ⚠️ A Mejorar
- **LLONTOP Hebert**: bajo conocimiento del dominio y baja defensa en coloquio. Debe reforzar conceptos
- Abel Di Bella con 8.6% de commits — verificar aporte
- Mateo y Marcelo concentran el 65% de los commits — distribución muy sesgada

### 📝 Recomendaciones
- Llontop: estudiar el stack completo (OTel → Prometheus → Grafana) y el propósito de cada componente
- Distribuir mejor las tareas técnicas para que todos los integrantes participen de la implementación

---

## Grupo 7 — Francina Ruaro

**Repo**: francianuro/alentapp  
**Integrantes**: RUARO Francina, PIERRARD Facundo, ARDENGHI Ernesto, HUARI Cesar

### ✅ Logros
- Feature branches (feature/observability, feature/grafana-red-dashboard) y PRs (#48-#52)
- Bug fix documentado en paneles de Grafana (FASE-3) — debugging real
- Ernesto Ardenghi demostró liderazgo técnico sólido

### ⚠️ A Mejorar
- **Francina Ruaro**: inasistente al coloquio. Regularizar situación
- Grupo con menos commits totales (153) — aunque la calidad es buena
- Distribución muy sesgada: Ernesto concentra el 44% de los commits
- Cesar Huari con 14% — participación baja, requiere seguimiento

### 📝 Recomendaciones
- Francina: justificar inasistencia y recuperar coloquio
- Distribuir mejor las tareas para evitar dependencia excesiva en un solo integrante

---

## Resumen de Resultados

### Por Grupo

| Grupo | Estado | Nota |
|-------|--------|------|
| 1. Amado | ✅ Aprobado | Buena distribución, mejorar uso de PRs |
| 2. Dieguez | ✅ Aprobado | Mejor implementación técnica de S42 |
| 3. Arce | ✅ Aprobado | Buenos PRs, Santiago debe recuperar |
| 4. Pertile | ✅ Aprobado | Grupo chico pero completo, distribuir carga |
| 5. Zacarias | ✅ Aprobado | Muy activos, CEMINO aprobado, SCHNEEBERGER y CORTES en alerta |
| 6. Lafalce | ✅ Aprobado | Mejores PRs, LLONTOP en alerta |
| 7. Ruaro | ✅ Aprobado | Buena calidad, Francina debe recuperar coloquio |

### Alumnos en Situación de Alerta

| Alumno | Situación | Acción Requerida |
|--------|-----------|------------------|
| CORTES Matias | Inasistencia al coloquio | Recuperar |
| RUARO Francina | Inasistencia al coloquio | Recuperar |
| SCHNEEBERGER Angeles | Baja performance en coloquio | Recuperar conceptos |
| LLONTOP Hebert | Bajo conocimiento del dominio | Estudiar stack completo |
| ANDRADA Santiago | Muy baja participación (2.6% commits) | Justificar y demostrar conocimiento |
| DI BELLA Abel | Baja participación (8.6% commits) | Justificar |
| HUARI Cesar | Baja participación (14%) | Demostrar conocimiento en coloquio |

---

## Patrones Detectados (todas las comisiones)

### Lo que salió bien
- ✅ Todos implementaron Docker multi-stage (o lo intentaron)
- ✅ Todos integraron métricas (OTel o fastify-metrics)
- ✅ Todos documentaron con informes técnicos
- ✅ La mayoría usó Conventional Commits

### Lo que hay que mejorar
- ⚠️ **host.docker.internal**: muchos grupos lo usaron en lugar de nombres de servicio Docker (no funciona en Linux)
- ⚠️ **fastify-metrics vs OTel**: varios grupos mantuvieron ambos, causando conflictos de puerto
- ⚠️ **Dashboard provisioning**: algunos crearon dashboards manualmente en lugar de JSON provisionado
- ⚠️ **Variables de entorno**: varios grupos hardcodearon credenciales en docker-compose.prod.yml
- ⚠️ **Distribución de carga**: la mayoría de los grupos tiene 1-2 integrantes que concentran >40% de los commits
