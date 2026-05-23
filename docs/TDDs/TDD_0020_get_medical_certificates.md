---
id: 0020
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Consulta de Certificados Médicos
---

# TDD-0020: Consulta de Certificados Médicos

## Contexto de Negocio (PRD)

### Objetivo

Permitir la consulta de certificados médicos de un socio, tanto activos como inactivos. La secretaria necesita saber rápidamente si un socio tiene un certificado vigente para autorizar su participación en actividades.

### User Persona

- **Nombre**: Laura (Secretaria/Administrativa).
- **Necesidad**: Verificar si un socio tiene certificado médico activo antes de permitirle usar instalaciones. También necesita ver el historial completo de certificados del socio.

### Criterios de Aceptación

- El sistema debe listar los certificados de un socio filtrados por `memberId`.
- El sistema debe indicar visualmente qué certificado está activo.
- El sistema debe exponer un endpoint específico para obtener el certificado activo de un socio.
- El sistema debe permitir obtener un certificado individual por ID.

## Diseño Técnico (RFC)

### Contrato de API (@alentapp/shared)

```ts
// GET /api/v1/certificados-medicos?memberId=xxx
// GET /api/v1/certificados-medicos/activo/:memberId  → certificado activo o null
// GET /api/v1/certificados-medicos/:id
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `MedicalCertificateRepository` (Métodos `findByMember(memberId)`, `findActiveByMember(memberId)`, `findById(id)`).
2. **Casos de Uso**: `GetMedicalCertificatesUseCase`, `GetActiveCertificateUseCase`.
3. **Adaptador de Entrada**: `MedicalCertificateController` (Rutas GET).

## Casos de Borde y Errores

| Escenario                                      | Resultado Esperado                                           | Código HTTP |
|------------------------------------------------|--------------------------------------------------------------|-------------|
| Socio sin certificados                         | Lista vacía                                                  | 200 OK |
| Socio sin certificado activo                   | Endpoint /activo devuelve `null`                             | 200 OK |
| Certificado inexistente                        | Mensaje: "El certificado no existe"                          | 404 Not Found |
| Socio inexistente                              | Mensaje: "El socio no existe"                                | 404 Not Found |

## Plan de Implementación

1. Agregar métodos de consulta a `MedicalCertificateRepository`.
2. Implementar casos de uso de consulta.
3. Agregar rutas GET en `MedicalCertificateController`.
4. En el frontend, mostrar indicador visual de certificado activo (verde) vs. inactivo (gris).
