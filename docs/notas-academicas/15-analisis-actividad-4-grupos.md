# Análisis de Actividad 4 — Forks de Alentapp

**Fecha**: 08/06/2026
**Comisiones**: S41 (Noche) — 16 grupos · S42 (Mañana) — 7 grupos
**Total forks analizados**: 23
**Con Actividad 4**: 22/23 (96%)

---

## Resumen General

- **22 de 23 forks** implementaron Actividad 4 (docker-compose.prod, Dockerfile.prod multi-stage, OpenTelemetry, métricas RED, Prometheus, Grafana, informes)
- **1 fork sin evidencia visible** en `main`: Calvo-Bautista (Grupo 14 S41 — Moyano). Sus últimos commits son solo de testing, pero con ~458 commits total puede tener Act4 en ramas no mergeadas.
- **RodrigoJacznik** (docente) aparece como contributor en los 23 forks — es el fork base.
- **Vencimiento**: Todos los commits de Act4 son del 6-8 de Junio 2026.

---

## Análisis por Grupo

### S41 — Noche

#### 1. Grupo Joaquin Rodriguez → Joacorodriguezz/alentapp
**Miembros**: RODRIGUEZ Joaquin, LEGORBURU Lucas, BELLIZZI Tomas, GIORDANI Luca, DEVIDA Facundo, PIQUET Leonel
**Contributors en fork**: Joacorodriguezz, Facudevida, LucaGio04, lucaslegor, TomasBellizzi, LeonelPiquet
**Act4**: ✅ Completa

**Logros**:
- Reducción de imagen API en 70% (multi-stage)
- Reemplazo de auto-instrumentaciones OTel por versiones optimizadas
- Grafana funcionando con PromQL queries
- Informe Fase 4 completo

**Áreas de atención**:
- Posta: "perf(api): reemplaza auto-instrumentations de OTel" — ¿Qué reemplazaron y por qué?
- La imagen prod API a 563MB sigue siendo alta vs nuestro reference (250MB)
- Solo 1 commit de LEONEL PIQUET visible — verificar participación

**Preguntas para coloquio**:
1. *(Grupo)* ¿Qué criterios usaron para seleccionar qué auto-instrumentaciones de OTel reemplazar? ¿Midieron el impacto en el tamaño de imagen vs funcionalidad?
2. *(Joaquin R.)* La imagen prod quedó en 563MB — nuestro reference son ~250MB. ¿Qué optimizaciones adicionales identificaron pero no implementaron?
3. *(Lucas L.)* El commit de "refactor: optimiza imagen produccion API (−70%)" es significativo. ¿Qué estrategias usaron para lograr esa reducción? ¿Midieron capa por capa?
4. *(Tomas B.)* ¿Cómo verificaron que Grafana esté correctamente provisionado con los dashboards? ¿Qué métricas monitorea su dashboard RED?
5. *(Leonel P.)* ¿Cuál fue tu contribución específica a la actividad? Se ve solo un commit en el fork.

---

#### 2. Grupo Felipe Pianelli → Tiaguito-dev/alentapp
**Miembros**: PIANELLI Felipe, SERENO Santiago, ALVAREZ PIERONI Federico, SOLIS Tiago, GOMEZ Facundo
**Contributors**: fpianelli, SSerenito, FedeeAPGit, Tiaguito-dev, Adrian238750
**Act4**: ✅ Completa

**Logros**:
- OpenTelemetry con métricas RED funcional
- Prometheus scraping configurado
- Dashboard Grafana implementado
- Dockerfile Web productivo
- Informe final .md + .pdf

**Áreas de atención**:
- 6 contributors pero GOMEZ Facundo sin commits visibles
- OTel SDK con error handling y shutdown — buen detalle

**Preguntas para coloquio**:
1. *(Felipe P.)* Implementaron error handling y shutdown del SDK de OTel — ¿Qué pasa si el SDK falla al iniciar? ¿Cómo afecta al arranque de la API?
2. *(Santiago S.)* En el merge del informe final, ¿cómo validaron que las configuraciones de producción estén completas y verificadas?
3. *(Tiago S.)* El dashboard de Grafana que implementaron, ¿qué paneles incluye? ¿Usaron variables de Grafana o queries hardcodeadas?
4. *(Federico A.)* En la integración OTel, ¿trabajaron con auto-instrumentación, métricas custom, o ambas? ¿Por qué?

---

#### 3. Grupo Juan Ignacio Wilt → Juaniip/alentapp
**Miembros**: WILT Juan Ignacio, CHIAPPINI Valentino, MALDONADO Sergio, MARINI Alvaro
**Contributors**: Juaniip, AlvaroMarini, sergioutn, ValenCh
**Act4**: ✅ Completa

**Logros**:
- Docker producción implementado
- Informe de verificación Fase 4
- Análisis individual de Fase 1 y diseño de Fase 2

**Áreas de atención**:
- Pocos commits visibles de Act4 (3 commits en el detalle)
- No se ve evidencia de OpenTelemetry o métricas RED en los commits recientes — pueden estar en otra rama

**Preguntas para coloquio**:
1. *(Juan I. / ValenCh)* En el merge `feature/docker-prod`, ¿qué incluye exactamente? ¿Tienen Dockerfile multi-stage, docker-compose.prod, y OTel?
2. *(Alvaro M.)* En tu análisis individual de Fase 1, ¿qué problemas de seguridad identificaste en el Dockerfile original?
3. *(Sergio M.)* ¿Participaste en la implementación técnica de los Dockerfiles o solo en la documentación?
4. *(Grupo)* ¿Tienen métricas RED funcionando? ¿Qué dashboard de Grafana implementaron?

---

#### 4. Grupo Felipe Andreau → FelipeAndreau/alentapp
**Miembros**: ANDREAU Felipe, FIUZA Pedro, VERGARA Jesus, CARPIGNANO Maximo
**Contributors**: FelipeAndreau, MaxiC55, fiuzapedropcs12-netizen, JesusVergara04, PedroFiu1712
**Act4**: ✅ Completa. Muy bien organizado.

**Logros**:
- Multi-stage builds y security hardening
- OTel core + custom RED metrics
- Consolidated master RED dashboard en Grafana
- Instrumentación de controllers con métricas RED
- Reporte técnico final de Actividad 4
- Feature branches bien estructuradas: `feature/enrollments-observabilidad`, `feature/lockers-observabilidad`

**Áreas de atención**:
- Muy buen uso de feature branches y merges
- Commit de FIUZA Pedro ("PedroFiu1712") tiene activ reciente

**Preguntas para coloquio**:
1. *(Felipe A.)* Veo que organizaron el trabajo en feature branches por entidad (lockers, enrollments). ¿Cómo distribuyeron las tareas? ¿Cada uno tomó una entidad?
2. *(Maximo C.)* En el merge de lockers-observabilidad, ¿qué métricas RED específicas implementaron para la entidad Locker?
3. *(Pedro F.)* ¿Qué desafíos encontraron al instrumentar los controllers con métricas RED? ¿Tuvieron que modificar la lógica de negocio?
4. *(Jesus V.)* En el consolidated dashboard RED, ¿cómo consolidaron las métricas de múltiples entidades en un solo dashboard?

---

#### 5. Grupo Ivo Balduzzi → Ivo4774/alentapp
**Miembros**: BALDUZZI Ivo, PIERONI Maria Belen, MOLINA Jeronimo, CAYO CONDORI Linber
**Contributors**: belenpieroni, Ivo4774, jeromoli-beep, ariel12C
**Act4**: ✅ Completa

**Logros**:
- Docker multi-stage
- docker-compose producción
- Dashboard RED en JSON
- Informe final con capturas

**Áreas de atención**:
- JERONIMO MOLINA ("jeromoli-beep") es quien más commits activos tiene
- Ariel Cayo ("ariel12C") trabajó en docker multi-stage
- Maria Belen Pieroni ("belenpieroni") con commits

**Preguntas para coloquio**:
1. *(Jeronimo M.)* En el merge de `feature/integration-prod-metrics`, ¿cómo integraron las métricas de producción? ¿Qué métricas monitorean?
2. *(Ivo B.)* ¿Qué decisiones tomaron sobre el formato del dashboard RED JSON? ¿Lo generaron manualmente o con herramienta?
3. *(Maria Belen P.)* ¿Cuál fue tu rol en la implementación de la actividad? ¿Trabajaste más en backend, frontend, o infraestructura?
4. *(Linber C.)* ¿Qué aprendiste sobre Docker multi-stage? ¿Podrías explicar la diferencia entre las etapas de build y runtime?

---

#### 6. Grupo Melissa Braunstein → santigonzalezdangelo/alentapp
**Miembros**: BRAUNSTEIN Melissa, WAGNER Pilar, GONZALEZ DANGELO Santiago, PORZIO Maria Pia, NOVAL Leandro
**Contributors**: mmmelissa099, santigonzalezdangelo, Piaporzio, pilarwagnerr, leannoval
**Act4**: ✅ Completa

**Logros**:
- Dashboard RED implementado
- Secciones 4.1 a 4.5 del informe
- Verificación de seguridad y observabilidad
- Capturas de dashboard RED

**Áreas de atención**:
- El fork lo tiene SANTIAGO GONZALEZ (no Melissa)
- Documentación muy completa con capturas

**Preguntas para coloquio**:
1. *(Santiago G.)* En la sección 4.1 del informe, ¿qué métricas de "antes y después" documentaron? ¿Cuál fue la mejora más significativa?
2. *(Pilar W.)* En la verificación de seguridad, ¿qué checklist usaron? ¿Verificaron read-only filesystem, capabilities, no-root user?
3. *(Maria Pia P.)* Las capturas del dashboard RED, ¿son de un dashboard provisionado o creado manualmente en Grafana?
4. *(Leandro N.)* ¿Qué fue lo más complejo de la actividad 4 para vos? ¿Dónde tuvieron que investigar más?

---

#### 7. Grupo Valentin Coloma → colosoler/alentapp
**Miembros**: COLOMA Julian, SOLER Tomas, SHIROMA Hajime, MODERNELL Lucas, ROSATO Tomas, SALAS TRIANA Mariano
**Contributors**: ShiromaHajime, tomasr15, marianosalast, colosoler, LucasIgnacioModernell, JulianColoma
**Act4**: ✅ Completa. Bien organizados.

**Logros**:
- docker-compose.prod.yml con .env
- Fases 4.1 a 4.4 documentadas
- Presentación PDF y PPTX (4.5)
- Dashboard RED corregido con targets correctos
- nginx.conf y metricas RED arregladas

**Áreas de atención**:
- Tuvieron problemas con ruteo de la API (documentado en informe)
- Corrigieron targets de métricas RED — señal de debugging real
- Buena distribución de commits entre los 6 miembros

**Preguntas para coloquio**:
1. *(Hajime S.)* Movieron las credenciales al .env en docker-compose.prod.yml. ¿Qué otras variables consideraron sensibles? ¿Usaron `${VAR:?error}` para validar?
2. *(Tomas S.)* En la presentación 4.5, ¿qué conclusiones principales presentaron sobre el trabajo?
3. *(Julian C.)* Mencionan "arregla metricas RED y nginx.conf" — ¿Qué problemas específicos tuvieron con nginx? ¿Read-only filesystem? ¿IPv6 en healthcheck?
4. *(Mariano S.)* Documentaron un problema de ruteo de la API — ¿Cuál fue y cómo lo solucionaron?

---

#### 8. Grupo Lautaro Flores → francooyhenart/alentapp
**Miembros**: OYHENART Franco, TRILLO MOYANO Esteban, CONTI Brenda, FLORES Lautaro
**Contributors**: EstebanT1112, contibrenda, LautaroFlores47, francooyhenart
**Act4**: ✅ Completa

**Logros**:
- Informe de producción completo con evidencias
- Secciones 4.1 (métricas), 4.2
- Evidencias de tamaño de imágenes y startup
- Observabilidad documentada

**Áreas de atención**:
- Mucho foco en documentación, menos evidencia de implementación técnica
- "fix/api-prod-image-size" — parece que tuvieron problemas con tamaño de imagen

**Preguntas para coloquio**:
1. *(Franco O.)* ¿Lograron reducir el tamaño de la imagen API? ¿A qué tamaño final llegaron y qué estrategias usaron?
2. *(Esteban T.)* En las evidencias de startup, ¿midieron el tiempo de arranque? ¿Cuánto tarda la API en producción?
3. *(Brenda C.)* El merge `docs/informe-fase4-produccion` — ¿vos te encargaste de la documentación técnica o también participaste en la implementación?
4. *(Lautaro F.)* En la sección de observabilidad, ¿implementaron OpenTelemetry con métricas RED? ¿Qué dashboard de Grafana configuraron?

---

#### 9. Grupo Nahuel Fredes → alfredoecheverria/alentapp
**Miembros**: FREDES Nahuel, PIAZZA Juan, WILLIAMS Ignacio, LUGO Avril, ECHEVERRIA Alfredo
**Contributors**: azehor, alfredoecheverria, avilugo110, NahuelFredesCoronilla, WilliamsIgnacio
**Act4**: ✅ Completa. Muy completo.

**Logros**:
- OpenTelemetry integration con métricas RED en rutas de deportes
- Prometheus configurado para OTel
- docker-compose.prod.yml con healthchecks
- Grafana con métricas RED implementadas
- Pull requests numerados (#103, #104, #105) — buen uso de PRs

**Áreas de atención**:
- Excelente uso de PRs con numeración
- Métricas RED implementadas a nivel de controller (en rutas de deportes)
- Todos los miembros contribuyeron con commits
- "feat(open-telemetry-integration): Integra metricas RED a rutas Deportes" — qué otras entidades cubren?

**Preguntas para coloquio**:
1. *(Nahuel F.)* Veo que integraron métricas RED en rutas de Deportes — ¿Extendieron la instrumentación a TODOS los controllers o solo Sports? ¿Por qué?
2. *(Ignacio W.)* En el PR de métricas RED en Grafana (#105), ¿qué paneles configuraron? ¿Usaron queries PromQL directas o variables?
3. *(Avril L.)* En el PR de Prometheus (#104), ¿qué targets configuraron? ¿Scrapean el endpoint OTel de la API? ¿En qué puerto?
4. *(Alfredo E.)* ¿Qué desafíos tuvieron al configurar Prometheus para OpenTelemetry? ¿Usaron host.docker.internal o nombres de servicio Docker?
5. *(Juan I. P.)* ¿Qué métricas RED específicas implementaron en los controllers? ¿Counters, histograms, gauges?

---

#### 10. Grupo Yanina Martinez → natashacadabon/alentapp
**Miembros**: MARTINEZ Yanina, CADABON Dana, LINDON Sofia, PILAR LUQUE Yael
**Contributors**: natashacadabon, yamartinez03, yaelPilarL, LindonSofi
**Act4**: ✅ Completa

**Logros**:
- OpenTelemetry + Grafana implementados
- Datos sensibles movidos a .env
- Análisis de observabilidad completo
- Informe de producción con documentación de flujo OTLP/Collector

**Áreas de atención**:
- Documentaron flujo OTLP y Collector — buen nivel de investigación
- Bug fix: "arregla referencia a OTLP y Collector" — señal de que investigaron y corrigieron

**Preguntas para coloquio**:
1. *(Dana C.)* Mencionan OTLP y Collector en la documentación pero implementaron PrometheusExporter directo. ¿Por qué esa decisión? ¿Consideraron usar OTLP + Collector?
2. *(Yanina M.)* En el análisis de observabilidad, ¿qué diferencias encontraron entre auto-instrumentación y métricas custom?
3. *(Sofia L.)* El merge de `docs/produccion-informe` — ¿cómo organizaron la documentación del equipo? ¿Usaron alguna plantilla?
4. *(Yael P.)* ¿Qué variables de entorno consideraron sensibles y movieron al .env? ¿Usaron validación con `${VAR:?error}`?

---

#### 11. Grupo Juan Caceres → Mauricitoxx/alentapp
**Miembros**: LISTA MARIN Mauro, CACERES Juan, PEREZ Thiago, ACOSTA Oriana, REARTE Iara
**Contributors**: juan-caceres, ThiagoPerez03, Mauricitoxx, Oriacosta, businessiariss
**Act4**: ✅ Completa

**Logros**:
- Dashboard Grafana implementado
- Prometheus configurado
- Métricas de tamaño de imagen
- Presentación Fase 4.5

**Áreas de atención**:
- MAURICIO LISTA es quien más commits tiene de Act4
- Commit de "businessiariss" (Iara Rearte) presente
- No se ve evidencia de OpenTelemetry o Docker multi-stage en commits recientes de main

**Preguntas para coloquio**:
1. *(Mauro L.)* El dashboard de Grafana que implementaron, ¿qué métricas visualiza? ¿Tiene paneles RED, USE, Business?
2. *(Juan C.)* En la presentación Fase 4.5, ¿qué decisiones técnicas documentaron? ¿Incluye Docker multi-stage?
3. *(Thiago P.)* ¿Implementaron OpenTelemetry en la API o usaron fastify-metrics? ¿Por qué eligieron ese enfoque?
4. *(Iara R.)* ¿Cuál fue tu contribución principal en esta actividad? ¿Participaste de la implementación técnica?

---

#### 12. Grupo Agostina Pascucci → SantiTalavera/alentapp
**Miembros**: PASCUCCI Agostina, EGÜEN Agustina, MONTES Joaquin, TALAVERA Santiago, PEREZ Nicolas, SMITH Justina
**Contributors**: SantiTalavera, Nicoperez04, aguseguen, agostinapascucci, justinasmith1, joaquingmontes
**Act4**: ✅ Completa. Buenos resultados.

**Logros**:
- Docker compose producción con servicio migrate separado
- Optimización de imagen productiva API (840MB → 494MB)
- Dashboard RED en Grafana
- Correcciones de docker producción API
- Reemplazo de auto-instrumentations-node

**Áreas de atención**:
- Buena optimización de imagen (840→494MB aunque aún lejos de 250MB reference)
- Separaron runtime API de servicio migrate — buena práctica
- "fix(api): reemplaza auto-instrumentations-node" — mismo patrón que otros grupos

**Preguntas para coloquio**:
1. *(Santiago T.)* Separaron el runtime API del servicio de migraciones — ¿Cómo manejan las migraciones en producción? ¿Se ejecutan automáticamente al iniciar?
2. *(Agustina E.)* Optimizaron la imagen de 840MB a 494MB — ¿Qué técnicas específicas usaron? ¿Multi-stage? ¿Separación de dev/prod deps?
3. *(Agostina P.)* ¿Por qué reemplazaron auto-instrumentations-node? ¿Qué alternativa usaron? ¿Fue por tamaño de imagen?
4. *(Nicolas P.)* El dashboard RED en Grafana, ¿fue provisionado como JSON o creado manualmente? ¿Qué desafíos tuvieron?

---

#### 13. Grupo Mateo Geffroy → BrionesBenjamin22/alentapp
**Miembros**: GEFFROY Mateo, MARTINO Luciana, ALTAMIRANO German, BRIONES Benjamin
**Contributors**: geraltamirano22, mateogeffroy, lucianamartino, BrionesBenjamin22
**Act4**: ✅ Completa. Bien organizado.

**Logros**:
- docker-compose productivo con Prometheus
- Dockerfile.prod para API
- Documentación de diseño (diseno-grupo-2.md)
- Informe de verificación Fase 4
- Fase 1, 2, 3 y 4 documentadas

**Áreas de atención**:
- Buena documentación progresiva (fases 1 a 4)
- Todos los miembros contribuyeron
- "feat(api): configura dotenv y dockerfile.prod para produccion" — buen detalle

**Preguntas para coloquio**:
1. *(Mateo G.)* En el compose productivo, ¿qué servicios incluye? ¿Tienen Prometheus y Grafana en el mismo compose o separados?
2. *(Benjamin B.)* El informe de verificación de la entrega, ¿qué aspectos cubre? ¿Verificaron seguridad, performance, funcionalidad?
3. *(Luciana M.)* En la configuración de dockerfile.prod, ¿usaste multi-stage? ¿Cuántas etapas y qué hace cada una?
4. *(German A.)* El documento de diseño, ¿qué decisiones de arquitectura documentaron? ¿Por qué eligieron ese enfoque?

---

#### 14. Grupo Pedro Moyano → Calvo-Bautista/alentapp
**Miembros**: MOYANO Pedro, REALE Milagros, JIMENEZ Franco, PORTILLO Franco, CALVO Bautista
**Contributors**: franjimenxz, Calvo-Bautista, moyanop, FrancoPortillo, MilaneKatz
**Act4**: ❌ No detectado en commits recientes de `main`

**Observaciones**:
- Los últimos 10 commits visibles son exclusivamente de testing: test-orchestration, test/web, test/api, test/e2e
- ~458 commits totales — puede que Act4 esté en ramas no mergeadas a `main`
- FRANCO JIMENEZ ("franjimenxz") es quien más commits recientes tiene

**Preguntas para coloquio**:
1. *(Grupo)* En los commits recientes de `main` solo vemos trabajo de testing. ¿Dónde están los cambios de Actividad 4? ¿Están en una rama separada?
2. *(Pedro M.)* ¿Implementaron Docker multi-stage? ¿Tienen docker-compose.prod.yml? ¿OpenTelemetry?
3. *(Franco J.)* Con ~458 commits, parece que trabajaron mucho en testing. ¿Cómo distribuyeron el tiempo entre testing y la actividad 4?
4. *(Bautista C.)* ¿Pueden mostrar el fork con la actividad 4 completa? ¿En qué rama está?

---

#### 15. Grupo Manuela Chanquia → Damianpiazz/alentapp
**Miembros**: CHANQUIA Manuela, CRESPO Milagros, MEZA Lucia, PIAZZA Damian, GARCIA AMENDOLA Martina
**Contributors**: martinagarcia05, manuchanquia, milagroscrespo, Damianpiazz, LuliMeza
**Act4**: ✅ Completa

**Logros**:
- Dashboard RED y datasources de Grafana provisionados
- Volumes de provisioning para Grafana
- ActiveRequests agregados a LockerController
- Documento de verificación técnica
- Fase 3 y Fase 04 documentadas

**Áreas de atención**:
- DAMIAN PIAZZA es quien más commits técnicos tiene
- Buena organización de PRs (#58, #59, #60)
- Docs de producción y verificación técnica

**Preguntas para coloquio**:
1. *(Damian P.)* Provisionaron Grafana con volumes de dashboards y datasources. ¿Cómo aseguraron que los dashboards se carguen automáticamente al iniciar el contenedor?
2. *(Manuela C.)* En el documento de verificación técnica de la Fase 04, ¿qué checklist usaron? ¿Verificaron cada punto?
3. *(Milagros C.)* ¿Qué métricas RED específicas implementaron? ¿Counters de requests, histogramas de latencia, gauges de memoria?
4. *(Lucia M.)* En el merge de la Fase 03, ¿qué incluía exactamente? ¿Docker multi-stage? ¿Seguridad?

---

#### 16. Grupo Felipe Etchanchuk → FerchaEtc/alentapp
**Miembros**: ETCHANCHUK Fermin, FLORES Bautista, IROZ Nahuel
**Contributors**: FerchaEtc, NahuelIroz, bautistaflores
**Act4**: ✅ Completa

**Logros**:
- Dashboard RED implementado
- Informe con puntos 4.1 a 4.3
- Documentación de "entrega cuatro"

**Áreas de atención**:
- Grupo chico (3 miembros) pero todos contribuyeron
- Commits de informe bien estructurados
- No se ve evidencia de implementación técnica de docker-compose.prod.yml u OTel

**Preguntas para coloquio**:
1. *(Fermin E.)* ¿Implementaron Docker multi-stage y docker-compose.prod.yml? En los commits solo veo documentación del dashboard RED.
2. *(Nahuel I.)* ¿Qué métricas monitorea su dashboard RED? ¿Lograron integrar OpenTelemetry con Prometheus?
3. *(Bautista F.)* ¿Participaste de la implementación técnica de la infraestructura o te enfocaste en documentación?
4. *(Grupo)* Al ser un grupo de 3, ¿cómo se organizaron para cubrir Docker, OTel, dashboards y documentación?

---

### S42 — Mañana

#### 2. Grupo Amado Lautaro → Lauti-Amado/alentapp
**Miembros**: AMADO Lautaro, FIGUEIRA Julian, LA GIOIOSA Bernardita, TUNDIS Yamil, BUCCHINO Ulises
**Contributors**: Lauti-Amado, yamiltundis, JulianFigueira, ulisesutnfrlp7, bernilagio, berni-lagio
**Act4**: ✅ Completa

**Logros**:
- Observabilidad con scrap de puerto 3000
- Instrumentación con hook global onResponse en app.ts
- Verificación técnica documentada
- Informe punto 4.4 completo
- Docs de diseño con correcciones de instrumentación

**Áreas de atención**:
- Tuvieron que corregir el scrap de puerto 3000 — problema común (fastify-metrics vs OTel)
- Usaron hook global onResponse — similar a nuestro enfoque de referencia
- Documentación de diseño con instrumentación

**Preguntas para coloquio**:
1. *(Lautaro A.)* Corrigieron el scrap de puerto 3000 — ¿Qué problema específico tenían? ¿Estaban usando fastify-metrics y OTel simultáneamente?
2. *(Yamil T.)* Implementaron un hook global onResponse para instrumentación — ¿Qué métricas registran en el hook? ¿Counters, histogramas?
3. *(Bernardita L.)* En el documento de diseño, ¿qué decisiones de instrumentación documentaron? ¿Por qué usaron hook global vs decorators?
4. *(Ulises B.)* La verificación técnica, ¿incluye pruebas de seguridad como read-only filesystem, capabilities, healthchecks?

PPT 

---

#### 6. Grupo Matias Dieguez → naimguar/alentapp
**Miembros**: DIEGUEZ Matias, GUARINO Naim, BENITEZ Ignacio, MANRIQUE Agustin
**Contributors**: AgustinManrique, DieguezMatias, naimguar, Ignacio-dev0
**Act4**: ✅ Completa. Muy completo.

**Logros**:
- Prometheus + Grafana provisioning con RED dashboard
- Correcciones de stack prod end-to-end (healthchecks, capabilities nginx)
- nginx con gzip, cache y security headers
- Optimización de tamaño Docker API y telemetría
- Multi-stage dockerfiles
- OTel configurado

**Áreas de atención**:
- Muy completo técnicamente — cubren casi todos los aspectos de la actividad
- AGUSTIN MANRIQUE es quien más commits técnicos tiene
- IGNACIO BENITEZ ("Ignacio-dev0") trabajó en optimización de imagen y OTel
- Correcciones de nginx capabilities — mismo problema que tuvimos en nuestro reference (SETUID/SETGID)


**Preguntas para coloquio**:
1. *(Agustin M.)* Mencionan correcciones de nginx capabilities — ¿Qué capabilities específicas necesitó nginx y por qué? (SETUID, SETGID, CHOWN?)
2. *(Matias D.)* En el multi-stage, ¿cómo separaron las etapas de build y runtime? ¿Qué optimizaciones de capas aplicaron?
3. *(Ignacio B.)* En la optimización de tamaño de imagen API, ¿qué técnicas usaron? ¿Lograron medir la reducción?
4. *(Naim G.)* El RED dashboard provisionado, ¿qué paneles incluye? ¿Usaron variables de Grafana o queries fijas?

Buenas deciciones de diseño. falto trabajo sobre el panel. De modo que mostrara datos para observabilidad de terceros. 
---

#### 4. Grupo Franco Arce → nicodiezz/alentapp
**Miembros**: ARCE Franco, BARBE LORENZO Dante, ANDRADA Santiago, DIEZ Nicolas, GIL Ramiro
**Contributors**: nicodiezz, DanteBarbe, FrancoArcee, ramirogil4, andradasantiago1
**Act4**: ✅ Completa

**Logros**:
- Informe de producción completo
- Verificación de seguridad y observabilidad (4.2 y 4.3)
- Documentación de problemas con OpenTelemetry y métricas RED
- Script de verificación de paneles Grafana
- Feature branches: feature/grafana, feature/prometheus

**Áreas de atención**:
- Documentaron problemas con OTel y métricas RED — señal de debugging real
- Tienen script de verificación de paneles — muy práctico
- "fix: corrige panel top endpoints" — debugging real

**Preguntas para coloquio**:
1. *(Nicolas D.)* El script de verificación de paneles Grafana, ¿qué verifica exactamente? ¿Consulta la API de Grafana o valida el JSON?
2. *(Dante B.)* Documentaron problemas con OpenTelemetry y métricas RED — ¿Cuáles fueron? ¿Problemas de naming, de scraping, de instrumentación?
3. *(Franco A.)* En feature/grafana, ¿configuraron dashboards provisionados o los crearon manualmente? ¿Por qué?
4. *(Santiago A.)* En las métricas de Dockerfile.prod WEB, ¿midieron el tamaño final de la imagen web? ¿Usaron nginx alpine?

---

#### 5. Grupo Valentina Pertile → ValentinaPertile/alentapp
**Miembros**: PERTILE Valentina, SUAREZ Maria Luana, ROMERO Macarena
**Contributors**: ValentinaPertile, Luana-suarez, Macarena-1973
**Act4**: ✅ Completa

**Logros**:
- docker-compose.prod.yml
- Grafana con métricas funcionando
- Fases 4.2, 4.3, 4.4 documentadas
- Informe final completo

**Áreas de atención**:
- Grupo chico (3 integrantes) pero completaron todo
- Tuvieron que arreglar puerto de métricas de Grafana
- VALENTINA PERTILE hizo la mayoría de los commits

**Preguntas para coloquio**:
1. *(Valentina P.)* ¿Qué problema tuviste con el puerto de métricas de Grafana? ¿Cómo lo diagnosticaste y solucionaste?
2. *(Luana S.)* En el docker-compose.prod.yml, ¿qué servicios incluye? ¿Tienen healthchecks, tmpfs, read-only?
3. *(Macarena R.)* En las fases 4.2 y 4.3 del informe, ¿qué verificaciones de seguridad documentaron? ¿cap_drop, no-root?
4. *(Grupo)* Al ser 3 integrantes, ¿cómo se distribuyeron el trabajo? ¿Cada uno tomó un área específica?

---

#### 1. Grupo Paula Zacarias → MatiasCortes2211/alentapp
**Miembros**: ZACARIAS Paula, CEMINO Conrado, CASTAÑO Rodrigo, SCHNEEBERGER Angeles, CORTES Matias
**Contributors**: paulazf, MatiasCortes2211, angeles131, rodricastanio, Conraaa
**Act4**: ✅ Completa

**Logros**:
- Healthcheck documentado como decisión técnica
- docker-compose producción
- Informe Fase 4 con decisiones técnicas
- Comandos de verificación documentados

**Áreas de atención**:
- Buena documentación de decisiones técnicas (healthcheck, separación compose)
- CONRADO CEMINO ("Conraaa") documentó la separación de docker-compose
- Commit de paulazf (Paula Zacarias) visible

**Preguntas para coloquio**:
1. *(Matias C.)* Documentaron la decisión técnica del healthcheck — ¿Qué tipo de healthcheck eligieron? ¿HTTP, comando, TCP? ¿Por qué?
2. *(Conrado C.)* ¿Por qué decidieron separar docker-compose en lugar de usar perfiles? ¿Qué ventajas les dio?
3. *(Rodrigo C.)* ¿Implementaron OpenTelemetry o usaron fastify-metrics? ¿Qué métricas recolectan?
4. *(Paula Z.)* ¿Cómo verificaron que los comandos de verificación documentados realmente funcionen? ¿Los probaron end-to-end?

Matias Cortez: Ausente por enfermedad.

---

#### 3. Grupo Mateo Lafalce → TassiMarcelo/alentapp
**Miembros**: LAFALCE Mateo, TASSI Marcelo, DELOZANO Matias, DI BELLA Abel, LLONTOP Hebert
**Contributors**: mateolafalce, TassiMarcelo, AleLlontop, MatiDelozano, abelrdb
**Act4**: ✅ Completa. Muy completa.

**Logros**:
- Dashboard RED Grafana con queries PromQL
- Prometheus configurado para scrape OTel
- Comandos de reproducción documentados en GitHub
- Informe producción con capturas de dashboard RED
- Alineación de queries con métricas custom
- Feature branches numeradas (#151 a #156)

**Áreas de atención**:
- Muy buen uso de PRs y branches numerados
- Tuvieron que alinear queries de dashboard con métricas custom — señal de debugging real
- Comandos de reproducción en GitHub — excelente práctica
- "eliminar job redundante prometheus" — limpieza de configuración

**Preguntas para coloquio**:
1. *(Mateo L.)* Los comandos de reproducción en GitHub, ¿qué cubren? ¿Son comandos para levantar el stack y verificar métricas?
2. *(Marcelo T.)* Alinearon las queries del dashboard RED con métricas custom — ¿Qué métricas custom implementaron? ¿Dots o underscores en los nombres?
3. *(Abel D.)* Configuraste Prometheus para scrape de OpenTelemetry — ¿Qué targets configuraste? ¿Usaste host.docker.internal o nombres de servicio Docker?
4. *(Matias D.)* En el PR de Prometheus+Grafana provisionados, ¿cómo integraron ambos servicios? ¿En el mismo compose o separados?
5. *(Hebert LL.)* OTLP collector. 

---

#### 7. Grupo Francina Ruaro → francianuro/alentapp
**Miembros**: RUARO Francina, PIERRARD Facundo, ARDENGHI Ernesto, HUARI Cesar
**Contributors**: blauerwolf, PierrardFacundo, francianuro, CesarAntoniohuari
**Act4**: ✅ Completa
RUARO Francina Ausente por problemas familiares.

**Logros**:
- Grafana dashboard provisioning
- RED dashboard implementado
- OpenTelemetry integration
- Informe de verificación de producción
- Feature branches: feature/observability, feature/grafana-red-dashboard, feature/grafana-final-implementation

**Áreas de atención**:
- ERNESTO ARDENGHI ("blauerwolf") corrigió bug en paneles de Grafana — debugging real
- FACUNDO PIERRARD ("PierrardFacundo") con muchos commits técnicos
- Buen uso de feature branches y PRs
- Tuvieron FASE-3 con bugs en paneles

**Preguntas para coloquio**:
1. *(Ernesto A.)* Corregiste un bug en los paneles de Grafana (FASE-3) — ¿Cuál era el bug? ¿Problema de queries, datasource, o provisioning?
2. *(Facundo P.)* En la integración de OpenTelemetry, ¿usaste auto-instrumentación, métricas custom, o ambas? ¿Qué métricas RED implementaste?
3. *(Francina R.)* ¿Cómo organizaron las tareas del grupo? ¿Usaron GitHub Projects, issues, o asignación directa?
4. *(Cesar H.)* En el merge de feature/grafana-final-implementation, ¿qué incluye la implementación final? ¿Dashboards provisionados con JSON?

---

## Patrones y Observaciones Generales

### Lo que TODOS hicieron bien
- ✅ Docker multi-stage (o intentaron)
- ✅ docker-compose.prod.yml con servicios básicos
- ✅ OpenTelemetry o fastify-metrics para métricas
- ✅ Dashboard RED en Grafana
- ✅ Informe técnico/documentación
- ✅ Trabajo en equipo con feature branches

### Problemas comunes detectados
1. **Tamaño de imagen**: Pocos grupos lograron < 300MB. La mayoría entre 400-600MB.
2. **host.docker.internal**: Muchos grupos lo usaron en lugar de nombres de servicio Docker (no funciona en Linux).
3. **nginx read-only**: Varios grupos tuvieron problemas con nginx + read-only filesystem + capabilities.
4. **fastify-metrics vs OTel**: Algunos grupos mantuvieron ambos, causando conflictos de puerto.
5. **Dashboard provisioning**: Algunos crearon dashboards manualmente en lugar de JSON provisionado.
6. **Variables de entorno**: Muchos grupos hardcodearon credenciales en docker-compose.prod.yml.

### Preguntas transversales para todos los grupos
1. ¿Midieron el tamaño final de las imágenes Docker? ¿Cuánto pesa cada una?
2. ¿Verificaron que el filesystem sea read-only? (`docker exec ... touch /test`)
3. ¿Usaron `${VAR:?error}` para variables sensibles?
4. ¿El healthcheck de la API funciona correctamente? ¿Y el de nginx?
5. ¿Qué comando usan para verificar que todo está funcionando?
6. ¿Podrían explicar la diferencia entre auto-instrumentación y métricas custom de OTel?
7. ¿Qué harían diferente si tuvieran que repetir la actividad?

---

## Estadísticas

| Comisión | Grupos | Con Act4 | Sin evidencia |
|----------|--------|----------|---------------|
| S41 (Noche) | 16 | 15 | 1 (Calvo-Bautista) |
| S42 (Mañana) | 7 | 7 | 0 |
| **Total** | **23** | **22** | **1** |

### Actividad de commits por grupo
| Mayor actividad | Menor actividad |
|----------------|-----------------|
| naimguar (S42) — muy completo técnicamente | Calvo-Bautista (S41) — sin evidencia |
| alfredoecheverria (S41) — PRs numerados | Juaniip (S41) — pocos commits visibles |
| TassiMarcelo (S42) — branches numerados | FerchaEtc (S41) — solo docs visible |
| SantiTalavera (S41) — buena optimización | ValentinaPertile (S42) — principalmente docs |
