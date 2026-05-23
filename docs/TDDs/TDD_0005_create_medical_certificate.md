---
id: 0005
estado: En Progreso
autor: Ezequiel Rodriguez
fecha: 2026-05-22
titulo: Registro de Certificados Médicos
---

# TDD-0005: Registro de Certificados Médicos

## Contexto de Negocio (PRD)

### Objetivo

Registrar los certificados médicos de aptitud física que los socios entregan al club. Dado que un socio no puede tener más de un certificado activo al mismo tiempo, el sistema debe invalidar automáticamente los certificados anteriores al emitir uno nuevo, asegurando que siempre exista un único certificado vigente por socio.

### User Persona

- **Nombre**: Laura (Secretaria/Administrativa).
- **Necesidad**: Cargar los certificados médicos que los socios entregan. Cuando un socio trae un nuevo certificado, el anterior debe quedar automáticamente como no vigente. No necesita modificar ni borrar certificados previos por trazabilidad médica.

### Criterios de Aceptación

- El sistema debe permitir crear un certificado médico asociado a un socio existente.
- Al crear un nuevo certificado, el sistema debe **invalidar automáticamente** cualquier certificado activo previo del mismo socio (cambiar su `isActive` a `false`).
- El campo `isActive` debe ser `true` por defecto para el nuevo certificado.
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

- Endpoint: `POST /api/v1/certificados-medicos`

```ts
export interface MedicalCertificateDTO {
    id: string;
    memberId: string;
    issueDate: string;
    expirationDate?: string;
    isActive: boolean;
    description?: string;
    doctorName?: string;
    created_at: string;
}

export interface CreateMedicalCertificateRequest {
    memberId: string;
    expirationDate?: string;
    description?: string;
    doctorName?: string;
}
```

### Componentes de Arquitectura Hexagonal

1. **Puerto**: `MedicalCertificateRepository` (Interface: `create`, `findByMember`, `deactivateAllByMember`).
2. **Servicio de Dominio**: `MedicalCertificateValidator` (Valida existencia del socio, fecha de vencimiento posterior a la emisión).
3. **Caso de Uso**: `CreateMedicalCertificateUseCase` (Crea el certificado y desactiva los anteriores del mismo socio en una **transacción**).
4. **Adaptador de Salida**: `PostgresMedicalCertificateRepository` (Implementación con Prisma, usando transacción para la desactivación).
5. **Adaptador de Entrada**: `MedicalCertificateController` (Ruta HTTP POST).

## Casos de Borde y Errores

| Escenario                                      | Resultado Esperado                                           | Código HTTP |
|------------------------------------------------|--------------------------------------------------------------|-------------|
| Socio inexistente                              | Mensaje: "El socio no existe"                                | 404 Not Found |
| Fecha de vencimiento anterior a la emisión     | Mensaje: "La fecha de vencimiento debe ser posterior a la fecha de emisión" | 400 Bad Request |
| Socio sin certificados previos                 | Creación normal, primer certificado activo                   | 201 Created |
| Socio con certificado activo existente         | El nuevo certificado se crea como activo, el anterior pasa a inactivo | 201 Created |
| Error de conexión a DB                         | Mensaje: "Error interno, reintente más tarde"                | 500 Internal Server Error |

## Plan de Implementación

1. Agregar modelo `MedicalCertificate` al schema de Prisma y crear migración.
2. Definir tipos compartidos (`MedicalCertificateDTO`, `CreateMedicalCertificateRequest`) en `@alentapp/shared`.
3. Crear el puerto `MedicalCertificateRepository` en `domain/`.
4. Implementar el servicio de dominio `MedicalCertificateValidator`.
5. Implementar `CreateMedicalCertificateUseCase`, asegurando la desactivación de certificados previos dentro de una transacción de Prisma.
6. Implementar `PostgresMedicalCertificateRepository` en infraestructura.
7. Crear `MedicalCertificateController` con ruta POST en Fastify.
8. Registrar ruta y dependencias en `app.ts`.
9. Crear servicio y vista en el frontend.
