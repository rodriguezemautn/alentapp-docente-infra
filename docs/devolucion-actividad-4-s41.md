# Devolución Actividad 4 — Comisión S41 (Noche)

**Fecha**: 09/06/2026
**Propósito**: Feedback constructivo post-entrega

---

## Consideraciones Generales

- **15/16 grupos** completaron la Actividad 4 ✅ (1 grupo sin evidencia en main)
- **~72 alumnos** evaluados
- **Mejora significativa** respecto al Checkpoint 01 en commits convencionales y trabajo en equipo
- **Área de mejora**: solo 2 de 16 grupos (13%) usaron Pull Requests y feature branches, vs 86% en S42

---

## Grupo 1 — Joaquin Rodriguez

**Repo**: Joacorodriguezz/alentapp  
**Integrantes**: RODRIGUEZ Joaquin, LEGORBURU Lucas, BELLIZZI Tomas, GIORDANI Luca, DEVIDA Facundo, PIQUET Leonel

### ✅ Logros
- Reducción de imagen API en 70% — muy buen resultado
- Reemplazo de auto-instrumentaciones OTel por versiones optimizadas (buena decisión técnica)
- Informe Fase 4 completo con documentación
- Distribución de commits equilibrada (10-21% cada uno)

### ⚠️ A Mejorar
- La imagen prod API quedó en 563MB — aún lejos del reference de 250MB. Revisar qué dependencias sobran
- No se detectaron Pull Requests ni feature branches
- Leonel Piquet con 10.4% de commits — verificar participación

### 📝 Recomendaciones
- Investigar qué ocupa espacio en la imagen (`docker history` y `dive` son tus amigos)
- Incorporar PRs para distribuir la revisión de código

---

## Grupo 2 — Felipe Pianelli

**Repo**: Tiaguito-dev/alentapp  
**Integrantes**: PIANELLI Felipe, SERENO Santiago, ALVAREZ PIERONI Federico, SOLIS Tiago, GOMEZ Facundo

### ✅ Logros
- OpenTelemetry con métricas RED funcionales
- Prometheus scraping configurado correctamente
- Dockerfile Web productivo implementado
- Informe final en .md y .pdf — buena práctica de documentación
- OTel SDK con error handling y shutdown — detalle de calidad

### ⚠️ A Mejorar
- Felipe Pianelli concentra el 28% de los commits — equipo grande (5), debería estar más distribuido
- No se detectaron PRs ni feature branches
- Verificar que GOMEZ Facundo aparece en la planilla de grupos (no estaba en el checkpoint)

### 📝 Recomendaciones
- Distribuir más el liderazgo técnico
- Verificar la lista de integrantes del grupo contra la planilla oficial

---

## Grupo 3 — Juan Ignacio Wilt

**Repo**: Juaniip/alentapp  
**Integrantes**: WILT Juan Ignacio, CHIAPPINI Valentino, MALDONADO Sergio, MARINI Alvaro

### ✅ Logros
- Docker producción implementado
- Documentación de análisis individual y diseño grupal
- Grupo chico (4) con commits balanceados (16-32%)

### ⚠️ A Mejorar
- **Pocos commits de Act4 visibles en `main`**: puede que el trabajo esté en ramas no mergeadas
- No se ve evidencia de OpenTelemetry ni métricas RED analizando solo `main`
- Valentino Chiappini con 15.8% — el de menor participación

### 📝 Recomendaciones
- Asegurar que todo el trabajo esté mergeado a `main` antes de la entrega
- Si hay ramas con trabajo de Act4, mergearlas y actualizar el repo

---

## Grupo 4 — Felipe Andreau

**Repo**: FelipeAndreau/alentapp  
**Integrantes**: ANDREAU Felipe, FIUZA Pedro, VERGARA Jesus, CARPIGNANO Maximo

### ✅ Logros
- **Excelente organización**: feature branches por entidad (lockers, enrollments) — mejor práctica del curso
- Multi-stage builds y security hardening implementados
- OTel core + custom RED metrics + dashboard consolidado
- Feature branches por entidad (enrollments-observabilidad, lockers-observabilidad)
- Reporte técnico final completo

### ⚠️ A Mejorar
- Felipe Andreau concentra el 33% de los commits — distribución sesgada
- Jesús Vergara con 14% — verificar aporte en coloquio
- Podrían haber documentado más las decisiones técnicas (por qué OTel y no fastify-metrics, etc.)

### 📝 Recomendaciones
- Este grupo es referencia en organización (feature branches). Compartir la práctica con otros grupos
- Jesús: prepararse para explicar tu aporte específico en el coloquio

---

## Grupo 5 — Ivo Balduzzi

**Repo**: Ivo4774/alentapp  
**Integrantes**: BALDUZZI Ivo, PIERONI Maria Belen, MOLINA Jeronimo, CAYO CONDORI Linber

### ✅ Logros
- Docker multi-stage + docker-compose producción implementados
- Dashboard RED en JSON (provisionado, no manual)
- Informe final con capturas

### ⚠️ A Mejorar
- Maria Belen Pieroni es la que más commits tiene (37%), por encima del líder nominal
- Linber Cayo Condori con 11.3% — verificar aporte
- No se detectaron PRs ni feature branches
- El dashboard RED en JSON está bueno, pero verificar que los paneles muestren datos reales

### 📝 Recomendaciones
- Linber: prepararse para explicar el trabajo en Docker multi-stage
- Balancear mejor la distribución de commits

---

## Grupo 6 — Melissa Braunstein

**Repo**: santigonzalezdangelo/alentapp  
**Integrantes**: BRAUNSTEIN Melissa, WAGNER Pilar, GONZALEZ DANGELO Santiago, PORZIO Maria Pia, NOVAL Leandro

### ✅ Logros
- Dashboard RED implementado con capturas
- Secciones 4.1 a 4.5 del informe completas
- Verificación de seguridad y observabilidad documentada
- Grupo grande (5) con buena distribución (13-29%)

### ⚠️ A Mejorar
- No se detectaron PRs ni feature branches
- Leandro Noval con 13.4% — verificar participación
- El dashboard está documentado con capturas, pero verificar que esté provisionado como JSON

### 📝 Recomendaciones
- Provisionar los dashboards como JSON en lugar de capturas manuales
- Leandro: prepararse para el coloquio

---

## Grupo 7 — Valentin Coloma

**Repo**: colosoler/alentapp  
**Integrantes**: COLOMA Julian, SOLER Tomas, SHIROMA Hajime, MODERNELL Lucas, ROSATO Tomas, SALAS TRIANA Mariano

### ✅ Logros
- docker-compose.prod.yml con .env para secrets
- Presentación PDF y PPTX (4.5) — adicional valioso
- Dashboard RED con targets corregidos (debugging real)
- nginx.conf y metricas RED arregladas tras identificar problemas
- Grupo grande (6) bien distribuido

### ⚠️ A Mejorar
- **Tomas Soler aparece con 2 cuentas GitHub** (tomasr15 + colosoler = 159 commits). Unificar para evitar confusión en métricas
- Julian Coloma con 10.2% — el de menor participación del grupo, verificar
- Documentaron problemas de ruteo de la API — ¿cómo los resolvieron?

### 📝 Recomendaciones
- Unificar cuenta de GitHub (no usar múltiples cuentas)
- Julián: prepararse para explicar tu aporte en fixes de nginx y OTel

---

## Grupo 8 — Lautaro Flores

**Repo**: francooyhenart/alentapp  
**Integrantes**: OYHENART Franco, TRILLO MOYANO Esteban, CONTI Brenda, FLORES Lautaro

### ✅ Logros
- Informe de producción completo con evidencias de tamaño y startup
- Secciones 4.1 (métricas) y 4.2 documentadas
- Distribución balanceada (18-31%)
- Todos los integrantes contribuyeron

### ⚠️ A Mejorar
- Mucho foco en documentación, poca evidencia de implementación técnica en commits recientes
- "fix/api-prod-image-size" — ¿lograron reducir el tamaño? ¿A cuánto?
- No se detectaron PRs ni feature branches

### 📝 Recomendaciones
- Para la próxima actividad, balancear documentación con implementación técnica
- Documentar los resultados numéricos de las optimizaciones (tamaño final, tiempo de startup)

---

## Grupo 9 — Nahuel Fredes

**Repo**: alfredoecheverria/alentapp  
**Integrantes**: FREDES Nahuel, PIAZZA Juan, WILLIAMS Ignacio, LUGO Avril, ECHEVERRIA Alfredo

### ✅ Logros
- **Mejor uso de PRs del curso**: PRs numerados (#103, #104, #105) con descripciones claras
- OpenTelemetry con métricas RED en rutas de deportes
- Prometheus configurado para OTel scraping
- docker-compose.prod.yml con healthchecks
- Excelente distribución del equipo (14-31%)

### ⚠️ A Mejorar
- Ignacio Williams con 14.1% — el de menor participación
- Las métricas RED están en rutas de deportes — ¿cubren TODOS los controllers o solo Sports?

### 📝 Recomendaciones
- Extender las métricas RED a todos los controllers, no solo Sports
- Sostener el uso de PRs — es la mejor práctica del curso en S41

---

## Grupo 10 — Yanina Martinez

**Repo**: natashacadabon/alentapp  
**Integrantes**: MARTINEZ Yanina, CADABON Dana, LINDON Sofia, PILAR LUQUE Yael

### ✅ Logros
- **Grupo más balanceado de S41** (todos entre 19-29%)
- OpenTelemetry + Grafana implementados
- Datos sensibles movidos a .env (buena práctica de seguridad)
- 563 commits totales — grupo muy activo

### ⚠️ A Mejorar
- Documentaron flujo OTLP y Collector pero implementaron PrometheusExporter directo — inconsistencia entre documentación e implementación
- No se detectaron PRs ni feature branches

### 📝 Recomendaciones
- Alinear la documentación con la implementación real (o justificar la diferencia)
- Explicar en el coloquio por qué eligieron PrometheusExporter directo vs OTLP + Collector

---

## Grupo 11 — Juan Caceres

**Repo**: Mauricitoxx/alentapp  
**Integrantes**: LISTA MARIN Mauro, CACERES Juan, PEREZ Thiago, ACOSTA Oriana, REARTE Iara

### ✅ Logros
- Dashboard Grafana implementado
- Prometheus configurado
- Presentación Fase 4.5

### ⚠️ A Mejorar
- **Iara Rearte**: solo 5 commits (1.6% del grupo). Participación crítica. Requiere justificación
- **Oriana Acosta**: solo 24 commits (7.8%). Baja participación
- No se ve evidencia de OpenTelemetry ni Docker multi-stage en commits de `main`
- Distribución muy sesgada: Juan Caceres (34%) y Thiago Perez (29%) concentran el 63%

### 📝 Recomendaciones
- Iara y Oriana: justificar participación en el coloquio
- Verificar que el trabajo de Act4 esté completo y mergeado a `main`

---

## Grupo 12 — Agostina Pascucci

**Repo**: SantiTalavera/alentapp  
**Integrantes**: PASCUCCI Agostina, EGÜEN Agustina, MONTES Joaquin, TALAVERA Santiago, PEREZ Nicolas, SMITH Justina

### ✅ Logros
- Optimización de imagen productiva API (840MB → 494MB) — buena reducción
- Separación de runtime API y servicio migrate — excelente práctica
- Dashboard RED en Grafana
- Reemplazo de auto-instrumentations-node por versión optimizada

### ⚠️ A Mejorar
- Joaquin Montes con 8.8% de commits — verificar participación
- La imagen aún está en 494MB, se puede llevar a ~250MB con más optimización
- No se detectaron PRs ni feature branches

### 📝 Recomendaciones
- Joaquin: prepararse para explicar tu aporte en el coloquio
- Investigar `npm ls --prod --all` para identificar dependencias no utilizadas en producción

---

## Grupo 13 — Mateo Geffroy

**Repo**: BrionesBenjamin22/alentapp  
**Integrantes**: GEFFROY Mateo, MARTINO Luciana, ALTAMIRANO German, BRIONES Benjamin

### ✅ Logros
- docker-compose productivo con Prometheus
- Dockerfile.prod para API implementado
- Documentación progresiva por fases (1 a 4)
- Distribución: German (36%) y Mateo (34%) lideraron

### ⚠️ A Mejorar
- Benjamin Briones con 15% de commits — dueño del fork pero no el más activo
- Luciana Martino con 15.5% — participación baja
- No se detectaron PRs ni feature branches

### 📝 Recomendaciones
- Benjamín y Luciana: prepararse para el coloquio y explicar su aporte específico
- Para la próxima, usar feature branches para trabajo paralelo

---

## Grupo 14 — Pedro Moyano

**Repo**: Calvo-Bautista/alentapp  
**Integrantes**: MOYANO Pedro, REALE Milagros, JIMENEZ Franco, PORTILLO Franco, CALVO Bautista

### ⚠️⚠️ ATENCIÓN: Actividad 4 no detectada en `main`

Este grupo tiene **388 commits** pero **ninguno de Actividad 4 en la rama `main`**. Todos los commits recientes son de testing (test-orchestration, test/web, test/api, test/e2e).

**Posibles escenarios**:
1. La Act4 está en una rama sin mergear → mergear a `main` y actualizar
2. No completaron la actividad → regularizar situación
3. Trabajaron en otro fork no detectado → informar la URL correcta

### 📝 Recomendaciones
- **Urgente**: mergear el trabajo de Act4 a `main` o indicar dónde está
- Justificar la situación en el coloquio
- El trabajo en testing está muy bien, pero la Act4 requiere los entregables de Docker + OTel + Grafana

---

## Grupo 15 — Manuela Chanquia

**Repo**: Damianpiazz/alentapp  
**Integrantes**: CHANQUIA Manuela, CRESPO Milagros, MEZA Lucia, PIAZZA Damian, GARCIA AMENDOLA Martina

### ✅ Logros
- **Excelente distribución**: todos entre 15-23% — grupo más balanceado de S41
- Dashboard RED y datasources de Grafana provisionados
- ActiveRequests agregados a LockerController (métrica útil)
- Documento de verificación técnica
- PRs (#58, #59, #60) — buen uso

### ⚠️ A Mejorar
- Lucia Meza con 14.9% — la de menor participación
- Podrían haber agregado más métricas de negocio (business.*)

### 📝 Recomendaciones
- Sostener el nivel de organización y distribución
- Lucia: prepararse para el coloquio

---

## Grupo 16 — Felipe Etchanchuk

**Repo**: FerchaEtc/alentapp  
**Integrantes**: ETCHANCHUK Fermin, FLORES Bautista, IROZ Nahuel

### ✅ Logros
- Dashboard RED implementado
- Informe con puntos 4.1 a 4.3 documentados
- Grupo chico (3) pero completaron la entrega

### ⚠️ A Mejorar
- **Fermín concentra el 50% de los commits** — grupo chico, pero distribución muy sesgada
- No se ve evidencia de implementación técnica de Docker multi-stage, docker-compose.prod.yml ni OTel en los commits de `main`
- Bautista Flores con 14.8% — verificar aporte

### 📝 Recomendaciones
- Si la implementación técnica está en otra rama, mergear a `main`
- Bautista: prepararse para explicar tu aporte en el coloquio
- Grupo chico: priorizar la implementación técnica sobre la documentación

---

## Resumen de Resultados S41

### Por Grupo

| Grupo | Estado | Destacado |
|-------|--------|-----------|
| 1. Rodriguez | ✅ Aprobado | Buena distribución, mejorar tamaño imagen |
| 2. Pianelli | ✅ Aprobado | OTel funcional, verificar integrantes |
| 3. Wilt | ✅ Aprobado | Verificar que Act4 esté en main |
| 4. Andreau | ✅ Aprobado | ⭐ Mejores feature branches |
| 5. Balduzzi | ✅ Aprobado | Dashboard provisionado, balancear carga |
| 6. Braunstein | ✅ Aprobado | Buenos informes, provisionar dashboards |
| 7. Coloma | ✅ Aprobado | Unificar cuentas GitHub |
| 8. Flores | ✅ Aprobado | Más foco en implementación técnica |
| 9. Fredes | ✅ Aprobado | ⭐ Mejores PRs del curso |
| 10. Martinez | ✅ Aprobado | Grupo más balanceado, alinear docs |
| 11. Caceres | ✅ Aprobado | Iara y Oriana con participación crítica |
| 12. Pascucci | ✅ Aprobado | Buena optimización, verificar Joaquin |
| 13. Geffroy | ✅ Aprobado | Documentación progresiva, balancear |
| 14. Moyano | ⚠️ Sin evidencia en main | **Regularizar urgente** |
| 15. Chanquia | ✅ Aprobado | ⭐ Grupo más balanceado de S41 |
| 16. Etchanchuk | ✅ Aprobado | Más foco en implementación que docs |

### Grupos Destacados

| Grupo | Fortaleza |
|-------|-----------|
| **4. Andreau** | Feature branches por entidad (único en S41) |
| **9. Fredes** | PRs numerados con descripciones (único en S41) |
| **15. Chanquia** | Distribución de commits más balanceada |
| **10. Martinez** | Mayor cantidad de commits (563) |

### Áreas de Mejora Transversales (S41)

1. **Solo 2/16 grupos usaron PRs** (13%) — vs 86% en S42. Mejorar urgentemente.
2. **Solo 2/16 grupos usaron feature branches** (13%) — vs 86% en S42.
3. **Distribución de carga**: la mayoría tiene 1-2 integrantes que concentran >35% de commits.
4. **Documentación vs implementación**: varios grupos priorizaron informes extensos pero la implementación técnica quedó incompleta.
5. **Cuentas GitHub duplicadas**: algunos alumnos aparecen con múltiples cuentas, lo que distorsiona las métricas.

### Comparativa S41 vs S42

| Práctica | S41 (Noche) | S42 (Mañana) |
|----------|:-----------:|:------------:|
| Pull Requests | 13% | 86% |
| Feature branches | 13% | 86% |
| Commits promedio/grupo | 374 | 371 |
| Alumnos con engagement bajo | ~7% | ~3% |
| Act4 completada | 94% | 100% |
