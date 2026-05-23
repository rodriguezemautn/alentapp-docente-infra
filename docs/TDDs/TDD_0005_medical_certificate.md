---
id: 0005
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: ABM de Certificados Médicos
---

# TDD-0005: ABM de Certificados Médicos

## Contexto de Negocio (PRD)

### Objetivo

Administrar los certificados médicos de aptitud física de los socios. Dado que un socio no puede tener más de un certificado activo al mismo tiempo, el sistema debe invalidar automáticamente los certificados anteriores al emitir uno nuevo. Esto asegura que siempre exista un único certificado vigente por socio.

### User Persona

- **Nombre**: Laura (Secretaria/Administrativa).
- **Necesidad**: Cargar los certificados médicos que los socios entregan al club. Cuando un socio trae un nuevo certificado, el anterior debe quedar automáticamente como no vigente. Necesita poder consultar rápidamente si un socio está apto para realizar actividades.

### Criterios de Aceptación

- El sistema debe permitir crear un certificado médico asociado a un socio existente.
- Al crear un nuevo certificado, el sistema debe **invalidar automáticamente** cualquier certificado activo previo del mismo socio (cambiar su `isActive` a `false`).
- El sistema debe permitir listar los certificados de un socio, activos e inactivos.
- El sistema debe indicar claramente si un certificado está vigente o no.
- No se permite modificar ni eliminar certificados una vez creados (inmutabilidad por trazabilidad médica).

## Diseño Técnico (RFC)

### Modelo de Datos

Se creará la entidad `MedicalCertificate` con las siguientes propiedades y restricciones:

- `id`: Identificador único universal (UUID).
- `memberId`: Relación con el socio (UUID, clave foránea).
- `issueDate`: Fecha de emisión del certificado (por defecto la fecha actual).
- `expirationDate`: Fecha de vencimiento del certificado (opcional).
- `isActive`: Indica si el certificado está vigente (por defecto `true` al crearse).
- `description`: Diagnóstico o motivo del certificado (opcional).
- `doctorName`: Nombre del médico que emite el certificado (opcional).
- `created_at`: Fecha de creación autogenerada.

```prisma
model MedicalCertificate {
    id              String    @id @default(uuid())
    memberId        String
    member          Member    @relation(fields: [memberId], references: [id])
    issueDate       DateTime  @default(now())
    expirationDate  DateTime?
    isActive        Boolean   @default(true)
    description     String?
    doctorName      String?
    created_at      DateTime  @default(now())

    @@map("medical_certificates")
}
```

### Contrato de API (@alentapp/shared)

Endpoint base: `/api/v1/certificados-medicos`

```ts
export interface MedicalCertificateDTO {
    id: string;
    memberId: string;
    issueDate: string;         // ISO Date String
    expirationDate?: string;   // ISO Date String
    isActive: boolean;
    description?: string;
    doctorName?: string;
    created_at: string;        // ISO Date String
}

// POST /api/v1/certificados-medicos
export interface CreateMedicalCertificateRequest {
    memberId: string;
    expirationDate?: string;
    description?: string;
    doctorName?: string;
}
```

| Método | Endpoint                                  | Descripción                                       |
|--------|-------------------------------------------|---------------------------------------------------|
| GET    | `/api/v1/certificados-medicos`            | Listar todos los certificados (filtro por ?memberId=) |
| GET    | `/api/v1/certificados-medicos/:id`        | Obtener un certificado por ID                     |
| POST   | `/api/v1/certificados-medicos`            | Crear certificado (invalida anteriores automáticamente) |

No existen endpoints `PUT` ni `DELETE` — los certificados son inmutables para mantener trazabilidad médica.

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `MedicalCertificateRepository` (Interface: `create`, `findById`, `findByMember`, `deactivateAllByMember`).
2. **Servicio de Dominio**: `MedicalCertificateValidator` (Valida existencia del socio, fecha de vencimiento posterior a la emisión).
3. **Casos de Uso**:
   - `CreateMedicalCertificateUseCase` (Crea el certificado y desactiva los anteriores del mismo socio en una transacción).
   - `GetMedicalCertificatesUseCase` (Lista con filtro por socio).
4. **Adaptador de Salida**: `PostgresMedicalCertificateRepository` (Implementación con Prisma, lógica de desactivación en transacción).
5. **Adaptador de Entrada**: `MedicalCertificateController` (Rutas HTTP).

## Casos de Borde y Errores

| Escenario                                      | Resultado Esperado                                           | Código HTTP |
|------------------------------------------------|--------------------------------------------------------------|-------------|
| Socio inexistente                              | Mensaje: "El socio no existe"                                | 404 Not Found |
| Fecha de vencimiento anterior a la emisión     | Mensaje: "La fecha de vencimiento debe ser posterior a la fecha de emisión" | 400 Bad Request |
| Socio sin certificados previos                 | Creación normal, primer certificado activo                   | 201 Created |
| Socio con certificado activo existente         | El nuevo certificado se crea como activo, el anterior pasa a inactivo | 201 Created |
| Intentar modificar un certificado existente    | Mensaje: "No se permite modificar certificados médicos"      | 405 Method Not Allowed |
| Error de conexión a DB                         | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Agregar modelo `MedicalCertificate` al schema de Prisma y crear migración.
2. Definir tipos compartidos (`MedicalCertificateDTO`, `CreateMedicalCertificateRequest`) en `@alentapp/shared`.
3. Crear el puerto `MedicalCertificateRepository` en `domain/`.
4. Implementar el servicio de dominio `MedicalCertificateValidator`.
5. Implementar los casos de uso (`CreateMedicalCertificateUseCase`, `GetMedicalCertificatesUseCase`), asegurando la desactivación de certificados previos dentro de una transacción de Prisma.
6. Implementar `PostgresMedicalCertificateRepository` en infraestructura.
7. Crear `MedicalCertificateController` con rutas GET y POST en Fastify.
8. Registrar rutas y dependencias en `app.ts`.
9. Crear `medicalCertificatesService` en el frontend.
10. Crear vista `MedicalCertificatesView` con tabla, indicador visual de vigencia y modal de creación.
11. Agregar ruta `/certificados-medicos` en el router del frontend.
