# Análisis Individual — Actividad 4 · Comisión S42 (Mañana)

**Fecha**: 08/06/2026
**Grupos**: 7 · **Alumnos**: 31 · **Forks con Act4**: 7/7 (100%)

---

## Metodología de Análisis

### Indicadores

| Indicador | Fuente | Interpretación |
|-----------|--------|----------------|
| **Commits totales** | GitHub Contributors API | Volumen de trabajo en el repositorio |
| **% Participación** | Commits del alumno / Total del grupo | Distribución de carga |
| **Act4 commits** | Análisis manual de mensajes | Contribución específica a la actividad |
| **Conventional Commits** | Presencia de `feat:`, `fix:`, `docs:`, etc. | Calidad de mensajes |
| **Feature Branches** | Uso de ramas por funcionalidad | Organización del trabajo |
| **Pull Requests** | Merges explícitos vía PR | Revisión de código |
| **Último commit** | API GitHub | Fecha de última actividad |

### Niveles de Engagement

- 🟢 **Alto**: >25% de commits del grupo + commits de implementación técnica
- 🟡 **Medio**: 10-25% de commits o principalmente documentación
- 🔴 **Bajo**: <10% de commits o participación mínima visible

---

## Grupo 1 — Amado Lautaro

**Repo**: Lauti-Amado/alentapp  
**Miembros**: AMADO Lautaro, FIGUEIRA Julian, LA GIOIOSA Bernardita, TUNDIS Yamil, BUCCHINO Ulises  
**Total commits grupo**: 398 (excluyendo RodrigoJacznik)

### Métricas Individuales

| Alumno | GitHub | Commits | % Grupo | Act4 | Engagement | Calidad |
|--------|--------|:-------:|:-------:|:----:|:----------:|:-------:|
| AMADO Lautaro | Lauti-Amado | 102 | 25.6% | ✅ Alta | 🟢 Alto | Buenas prácticas |
| TUNDIS Yamil | yamiltundis | 90 | 22.6% | ✅ Alta | 🟢 Alto | Conventional commits |
| FIGUEIRA Julian | JulianFigueira | 75 | 18.8% | ✅ Media | 🟡 Medio | Principalmente docs/fixes |
| BUCCHINO Ulises | ulisesutnfrlp7 | 67 | 16.8% | ✅ Media | 🟡 Medio | Docs de verificación |
| LA GIOIOSA Bernardita | bernilagio | 45+19 | 16.1% | ✅ Media | 🟡 Medio | Docs de instrumentación |

### Indicadores del Grupo

| Indicador | Valor |
|-----------|-------|
| **Commit distribution** | Balanceada (16-26% cada uno) |
| **Conventional commits** | ✅ Presentes en todos |
| **Feature branches** | No detectadas en commits recientes |
| **Pull Requests** | No detectados explícitamente |
| **Act4 entregada** | 08/06 (fecha límite) |
| **Fortaleza** | Buena distribución del trabajo, todos contribuyeron |
| **Debilidad** | Poco uso de PRs/feature branches |

### Observaciones
- Usaron hook global onResponse para instrumentación — mismo approach que el reference
- Tuvieron que corregir scrap de puerto 3000 (conflicto fastify-metrics vs OTel)
- Bernardita aparece con dos cuentas (bernilagio + berni-lagio) — posible confusión

---

## Grupo 2 — Matias Dieguez

**Repo**: naimguar/alentapp  
**Miembros**: DIEGUEZ Matias, GUARINO Naim, BENITEZ Ignacio, MANRIQUE Agustin  
**Total commits grupo**: 211 (excluyendo RodrigoJacznik)

### Métricas Individuales

| Alumno | GitHub | Commits | % Grupo | Act4 | Engagement | Calidad |
|--------|--------|:-------:|:-------:|:----:|:----------:|:-------:|
| MANRIQUE Agustin | AgustinManrique | 61 | 28.9% | ✅ Alta (técnico) | 🟢 Alto | Excelente calidad técnica |
| DIEGUEZ Matias | DieguezMatias | 56 | 26.5% | ✅ Alta | 🟢 Alto | Conventional commits |
| GUARINO Naim | naimguar | 52 | 24.6% | ✅ Alta | 🟢 Alto | Merges vía PR |
| BENITEZ Ignacio | Ignacio-dev0 | 42 | 19.9% | ✅ Alta | 🟢 Alto | OTel + optimización |

### Indicadores del Grupo

| Indicador | Valor |
|-----------|-------|
| **Commit distribution** | Excelente (20-29% cada uno) |
| **Conventional commits** | ✅ Buenos mensajes |
| **Feature branches** | ✅ Detectadas: `feature/dockerfiles-multistage` |
| **Pull Requests** | ✅ Merges con PR (#50) |
| **Act4 entregada** | 08/06 |
| **Fortaleza** | Implementación técnica completa, equipo balanceado |
| **Debilidad** | — |

### Observaciones
- **Mejor grupo técnicamente de S42**: implementaron multi-stage, OTel, Grafana provisioning, nginx hardening, healthchecks, capabilities
- Agustin Manrique lideró la implementación técnica (más commits y más sustancia)
- Ignacio Benitez trabajó en OTel y optimización de imagen
- Correcciones de nginx capabilities (SETUID/SETGID) — mismo issue que el reference

---

## Grupo 3 — Franco Arce

**Repo**: nicodiezz/alentapp  
**Miembros**: ARCE Franco, BARBE LORENZO Dante, ANDRADA Santiago, DIEZ Nicolas, GIL Ramiro  
**Total commits grupo**: 417 (excluyendo RodrigoJacznik)

### Métricas Individuales

| Alumno | GitHub | Commits | % Grupo | Act4 | Engagement | Calidad |
|--------|--------|:-------:|:-------:|:----:|:----------:|:-------:|
| DIEZ Nicolas | nicodiezz | 165 | 39.6% | ✅ Alta | 🟢 Alto | Líder técnico |
| BARBE LORENZO Dante | DanteBarbe | 98 | 23.5% | ✅ Alta | 🟢 Alto | Docs + fixes |
| ARCE Franco | FrancoArcee | 72 | 17.3% | ✅ Media | 🟡 Medio | Feature/grafana |
| GIL Ramiro | ramirogil4 | 71 | 17.0% | ✅ Media | 🟡 Medio | Docs OTel |
| ANDRADA Santiago | andradasantiago1 | 11 | 2.6% | ✅ Baja | 🔴 Bajo | Solo 11 commits |

### Indicadores del Grupo

| Indicador | Valor |
|-----------|-------|
| **Commit distribution** | Sesgada (Nicolas 40%, Santiago 2.6%) |
| **Conventional commits** | ✅ Buenos |
| **Feature branches** | ✅ feature/grafana, feature/prometheus |
| **Pull Requests** | ✅ Merges con PR (#83, #84, #87) |
| **Act4 entregada** | 07/06 (un día antes) |
| **Fortaleza** | Buenos PRs, feature branches, debugging documentado |
| **Debilidad** | Santiago Andrada con participación muy baja (2.6%) |

### Observaciones
- Nicolas Diez es el líder claro (casi 40% de los commits)
- Documentaron problemas reales con OTel y métricas RED — muestra debugging genuino
- Tienen script de verificación de paneles Grafana — muy buena práctica
- Santiago Andrada con solo 11 commits merece atención en el coloquio

---

## Grupo 4 — Valentina Pertile

**Repo**: ValentinaPertile/alentapp  
**Miembros**: PERTILE Valentina, SUAREZ Maria Luana, ROMERO Macarena  
**Total commits grupo**: 380 (excluyendo RodrigoJacznik)

### Métricas Individuales

| Alumno | GitHub | Commits | % Grupo | Act4 | Engagement | Calidad |
|--------|--------|:-------:|:-------:|:----:|:----------:|:-------:|
| PERTILE Valentina | ValentinaPertile | 167 | 43.9% | ✅ Alta | 🟢 Alto | Líder técnica |
| SUAREZ Maria Luana | Luana-suarez | 120 | 31.6% | ✅ Alta | 🟢 Alto | Buena participación |
| ROMERO Macarena | Macarena-1973 | 93 | 24.5% | ✅ Media | 🟡 Medio | Docs + fixes |

### Indicadores del Grupo

| Indicador | Valor |
|-----------|-------|
| **Commit distribution** | Moderadamente balanceada (24-44%) |
| **Conventional commits** | ✅ Presentes |
| **Feature branches** | ✅ Detectadas |
| **Pull Requests** | ✅ Merges con PR (#78) |
| **Act4 entregada** | 07/06 |
| **Fortaleza** | Grupo chico pero completaron todo, buena distribución |
| **Debilidad** | Valentina concentra mucha carga (44%) |

### Observaciones
- Valentina claramente lideró el proyecto (44% de commits)
- Grupo de 3 personas que completó Docker, OTel, Grafana e informe
- Tuvieron que arreglar puerto de métricas de Grafana (debugging real)
- Luana Suarez con buena participación técnica (31.6%)

---

## Grupo 5 — Paula Zacarias

**Repo**: MatiasCortes2211/alentapp  
**Miembros**: ZACARIAS Paula, CEMINO Conrado, CASTAÑO Rodrigo, SCHNEEBERGER Angeles, CORTES Matias  
**Total commits grupo**: 677 (excluyendo RodrigoJacznik)

### Métricas Individuales

| Alumno | GitHub | Commits | % Grupo | Act4 | Engagement | Calidad |
|--------|--------|:-------:|:-------:|:----:|:----------:|:-------:|
| ZACARIAS Paula | paulazf | 166 | 24.5% | ✅ Alta | 🟢 Alto | Commits constantes |
| CORTES Matias | MatiasCortes2211 | 161 | 23.8% | ✅ Alta | 🟢 Alto | Líder técnico |
| SCHNEEBERGER Angeles | angeles131 | 152 | 22.5% | ✅ Alta | 🟢 Alto | Muy activa |
| CASTAÑO Rodrigo | rodricastanio | 131 | 19.4% | ✅ Alta | 🟢 Alto | Activo |
| CEMINO Conrado | Conraaa | 67 | 9.9% | ✅ Media | 🟡 Medio | Menos commits, pero de calidad |

### Indicadores del Grupo

| Indicador | Valor |
|-----------|-------|
| **Commit distribution** | Excelente (10-25% cada uno) |
| **Conventional commits** | ✅ Buenos |
| **Feature branches** | No detectadas explícitamente |
| **Pull Requests** | ✅ Merges con PR (#99) |
| **Act4 entregada** | 08/06 |
| **Fortaleza** | Grupo más activo en commits (677), excelente distribución |
| **Debilidad** | Conrado con menor % (9.9%) — verificar en coloquio |

### Observaciones
- **Grupo con más commits de S42** (677) y de los más balanceados
- Documentaron decisiones técnicas (healthcheck, separación compose)
- Angeles Schneeberger con 152 commits — muy activa
- Conrado Cemino con 67 commits (9.9%) — el de menor participación del grupo, pero aún significativo

---

## Grupo 6 — Mateo Lafalce

**Repo**: TassiMarcelo/alentapp  
**Miembros**: LAFALCE Mateo, TASSI Marcelo, DELOZANO Matias, DI BELLA Abel, LLONTOP Hebert  
**Total commits grupo**: 361 (excluyendo RodrigoJacznik)

### Métricas Individuales

| Alumno | GitHub | Commits | % Grupo | Act4 | Engagement | Calidad |
|--------|--------|:-------:|:-------:|:----:|:----------:|:-------:|
| LAFALCE Mateo | mateolafalce | 126 | 34.9% | ✅ Alta | 🟢 Alto | Líder técnico |
| TASSI Marcelo | TassiMarcelo | 110 | 30.5% | ✅ Alta | 🟢 Alto | Merges + organización |
| LLONTOP Hebert | AleLlontop | 48 | 13.3% | ✅ Media | 🟡 Medio | Prometheus config |
| DELOZANO Matias | MatiDelozano | 46 | 12.7% | ✅ Media | 🟡 Medio | Dashboard RED |
| DI BELLA Abel | abelrdb | 31 | 8.6% | ✅ Media | 🟡 Medio | OTel scraping |

### Indicadores del Grupo

| Indicador | Valor |
|-----------|-------|
| **Commit distribution** | Sesgada (Mateo 35%, Abel 8.6%) |
| **Conventional commits** | ✅ Buenos |
| **Feature branches** | ✅ Excelente: #151 a #156 numeradas |
| **Pull Requests** | ✅ Merges con PR numerados |
| **Act4 entregada** | 07/06 |
| **Fortaleza** | PRs numerados, comandos de reproducción, debugging real |
| **Debilidad** | Abel con menor participación (8.6%) |

### Observaciones
- **Mejor organización de PRs**: branches numerados (#151 a #156)
- Comandos de reproducción documentados en GitHub — excelente práctica
- Debugging real: alineación de queries PromQL con métricas custom
- Abel Di Bella con 8.6% — verificar en coloquio

---

## Grupo 7 — Francina Ruaro

**Repo**: francianuro/alentapp  
**Miembros**: RUARO Francina, PIERRARD Facundo, ARDENGHI Ernesto, HUARI Cesar  
**Total commits grupo**: 153 (excluyendo RodrigoJacznik)

### Métricas Individuales

| Alumno | GitHub | Commits | % Grupo | Act4 | Engagement | Calidad |
|--------|--------|:-------:|:-------:|:----:|:----------:|:-------:|
| ARDENGHI Ernesto | blauerwolf | 68 | 44.4% | ✅ Alta | 🟢 Alto | Líder técnico |
| PIERRARD Facundo | PierrardFacundo | 38 | 24.8% | ✅ Alta | 🟢 Alto | OTel + Grafana |
| RUARO Francina | francianuro | 26 | 17.0% | ✅ Media | 🟡 Medio | Coordinación |
| HUARI Cesar | CesarAntoniohuari | 21 | 13.7% | ✅ Media | 🟡 Medio | Merges + PRs |

### Indicadores del Grupo

| Indicador | Valor |
|-----------|-------|
| **Commit distribution** | Sesgada (Ernesto 44%, Cesar 14%) |
| **Conventional commits** | ✅ Buenos |
| **Feature branches** | ✅ feature/observability, feature/grafana-red-dashboard |
| **Pull Requests** | ✅ Merges con PR (#48-#52) |
| **Act4 entregada** | 08/06 |
| **Fortaleza** | Feature branches, PRs, debugging documentado |
| **Debilidad** | Concentración en Ernesto (44%), grupo con menos commits totales (153) |

### Observaciones
- Grupo con menos commits totales (153) pero buena calidad
- Ernesto Ardenghi es el líder técnico claro (44%)
- Feature branches para observabilidad y Grafana
- Bug fix en paneles de Grafana (FASE-3) — debugging real
- Cesar Huari con 14% — verificar participación

---

## Resumen S42

### Ranking de Engagement por Alumno

| Alumno | Grupo | Commits | % Grupo | Engagement |
|--------|-------|:-------:|:-------:|:----------:|
| CORTES Matias | 5 | 161 | 23.8% | 🟢 Alto |
| ZACARIAS Paula | 5 | 166 | 24.5% | 🟢 Alto |
| SCHNEEBERGER Angeles | 5 | 152 | 22.5% | 🟢 Alto |
| PERTILE Valentina | 4 | 167 | 43.9% | 🟢 Alto |
| DIEZ Nicolas | 3 | 165 | 39.6% | 🟢 Alto |
| LAFALCE Mateo | 6 | 126 | 34.9% | 🟢 Alto |
| TASSI Marcelo | 6 | 110 | 30.5% | 🟢 Alto |
| MANRIQUE Agustin | 2 | 61 | 28.9% | 🟢 Alto |
| AMADO Lautaro | 1 | 102 | 25.6% | 🟢 Alto |
| PIERRARD Facundo | 7 | 38 | 24.8% | 🟢 Alto |

### Alumnos con Engagement Bajo (requieren atención)

| Alumno | Grupo | Commits | % Grupo | Observación |
|--------|-------|:-------:|:-------:|-------------|
| ANDRADA Santiago | 3 | 11 | 2.6% | 🔴 Muy baja participación |
| DI BELLA Abel | 6 | 31 | 8.6% | 🟡 Baja, pero significativa |
| CEMINO Conrado | 5 | 67 | 9.9% | 🟡 Límite, verificar |
| HUARI Cesar | 7 | 21 | 13.7% | 🟡 Baja pero activo en PRs |

### Estadísticas por Grupo

| Grupo | Total Commits | Balance | PRs | Features Branches | Act4 |
|-------|:------------:|:-------:|:---:|:-----------------:|:----:|
| 1. Amado | 398 | 🟢 Buena | ❌ No | ❌ No | ✅ |
| 2. Dieguez | 211 | 🟢 Excelente | ✅ Sí | ✅ Sí | ✅ |
| 3. Arce | 417 | 🟡 Sesgada | ✅ Sí | ✅ Sí | ✅ |
| 4. Pertile | 380 | 🟡 Moderada | ✅ Sí | ✅ Sí | ✅ |
| 5. Zacarias | 677 | 🟢 Excelente | ✅ Sí | ❌ No | ✅ |
| 6. Lafalce | 361 | 🟡 Sesgada | ✅ Sí | ✅ Excelente | ✅ |
| 7. Ruaro | 153 | 🟡 Sesgada | ✅ Sí | ✅ Sí | ✅ |

### Alertas para Coloquio S42

| Alumno | Alerta | Acción sugerida |
|--------|--------|-----------------|
| ANDRADA Santiago | 2.6% de commits | Preguntar qué hizo y por qué tan poca actividad |
| DI BELLA Abel | 8.6% de commits | Verificar si trabajó en rama no mergeada |
| CEMINO Conrado | 9.9% de commits | Preguntar sobre su aporte específico (documentó separación compose) |
| HUARI Cesar | 13.7% de commits | Verificar participación en implementación técnica |
