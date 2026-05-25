
## [1.0.0](https://github.com/rodriguezemautn/alentapp-docente-infra/compare/4a2127f5606b5ee50b62261bce0311cf58c616b5...v1.0.0) (2026-05-25)

### Features

* agrega TDDs para las 6 entidades del TP integrador ([4a2127f](https://github.com/rodriguezemautn/alentapp-docente-infra/commit/4a2127f5606b5ee50b62261bce0311cf58c616b5))
* **api:** complete discipline prisma model with all fields ([348f42a](https://github.com/rodriguezemautn/alentapp-docente-infra/commit/348f42a54aab1c5b4ae534dd2c95d81d3545fcfc))
* **api:** implement discipline hexagon with full tdd ([f70da47](https://github.com/rodriguezemautn/alentapp-docente-infra/commit/f70da4721c034f37389892d632dc0c6ae8bbe8d2))
* **api:** implementa entidad MedicalCertificate (backend) ([3e61cf2](https://github.com/rodriguezemautn/alentapp-docente-infra/commit/3e61cf23144153e053c57130ea1712dc8171547c))
* **api:** implementa entidad Payment (backend) ([9d00319](https://github.com/rodriguezemautn/alentapp-docente-infra/commit/9d00319fb403ea5df23d9c3f88c58958a3e7dbb7))
* **api:** implementa entidad Sport (backend) ([c739b0f](https://github.com/rodriguezemautn/alentapp-docente-infra/commit/c739b0fbaf79b623af55eed2957e0b87d1abc8d5))
* **api:** wire discipline routes in app.ts ([842c64f](https://github.com/rodriguezemautn/alentapp-docente-infra/commit/842c64f586c8cd8834b739d3bbaa8b8b88211f6a))
* reestructura TDDs por operación CRUD y agrega consulta, reportes e históricos ([4038645](https://github.com/rodriguezemautn/alentapp-docente-infra/commit/4038645de486e693a77e5e1c01c1cad6eea837bf))
* **shared:** add discipline dtos ([4c4c77a](https://github.com/rodriguezemautn/alentapp-docente-infra/commit/4c4c77ae64748d39fae9ce5cc75fa996f7691a15))
* **web:** agrega vista de certificados medicos (frontend) ([0261bac](https://github.com/rodriguezemautn/alentapp-docente-infra/commit/0261bac1705b4f986ff123cec8e3b83f625cac86))
* **web:** implementa frontend de Payment ([82420af](https://github.com/rodriguezemautn/alentapp-docente-infra/commit/82420af248ba2a882c2b2353d98609dca7a12cae))
* **web:** implementa frontend de Sport ([99c3c20](https://github.com/rodriguezemautn/alentapp-docente-infra/commit/99c3c20c301384954720d327c11bd11566bd648c))

### Bug Fixes

* **api:** add discipline backend routes, fix sports API path ([0ccb3df](https://github.com/rodriguezemautn/alentapp-docente-infra/commit/0ccb3df29920d309463f45c3062ddf655f65e837))
* correct constants.ts import path (./components vs ../components) ([cd15574](https://github.com/rodriguezemautn/alentapp-docente-infra/commit/cd155740a4fb4320489a035aff31f0f2a666d98f))
* LuTriangleAlert replaces non-existent LuAlertTriangle icon ([5830a96](https://github.com/rodriguezemautn/alentapp-docente-infra/commit/5830a960ea6313a9a999116bb7ad8df6244731d7))
* remove extra </Box> in Layout from merge conflict ([378e10c](https://github.com/rodriguezemautn/alentapp-docente-infra/commit/378e10cb5d64573d01867d34ddc068d992eee725))
* rename routes.ts to routes.tsx (JSX detection by oxc) ([02da504](https://github.com/rodriguezemautn/alentapp-docente-infra/commit/02da504a50243c4994eb7a2315d5d4bfbedca80f))
* separa SportCategory de MemberCategory en TDD-0009 ([0191ae4](https://github.com/rodriguezemautn/alentapp-docente-infra/commit/0191ae469edb121552677ff8cad078241f4af220))
* **web:** restore Home.tsx with all 5 entity cards ([8e55de0](https://github.com/rodriguezemautn/alentapp-docente-infra/commit/8e55de08d1b955e3b61e31ddc976aeeb4f65aff7))
# CHANGELOG

Todas las modificaciones notables en este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
con [Conventional Commits](https://www.conventionalcommits.org/).


## [1.0.0] — 2026-05-22

### Added

- Documentación: notas académicas de SDD (03-spec-driven-development.md)
- Documentación: guía práctica de SDD con ejemplo de Locker ABM
- Herramientas: husky, commitlint, lint-staged, changelog automático
- Automatización: script gh-automation.sh para PRs y merges

### Changed

- README reescrito con orientación docente

### Notes

- Ver notas académicas en docs/notas-academicas/ para contexto detallado
