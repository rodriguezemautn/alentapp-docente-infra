# Diseño: Entidad MedicalCertificate

## Enfoque Técnico

MedicalCertificate tiene una superficie de API limitada (crear + obtener activo) pero introduce **transacciones de Prisma** por primera vez en el proyecto. La complejidad clave es la operación atómica `deactivateAllByMember + create`.

## Vista General de Arquitectura

```
Prisma schema [medical_certificates table]
    ↓
Shared DTOs [MedicalCertificateDTO, CreateMedicalCertificateRequest]
    ↓
Domain:
  MedicalCertificateRepository (port: create, findActiveByMember, deactivateAllByMember)
  MedicalCertificateValidator (validate member, validate dates)
    ↓
Application:
  CreateMedicalCertificateUseCase (transactional - deactivate + create)
  GetActiveMedicalCertificateUseCase
    ↓
Delivery:
  MedicalCertificateController (POST create, GET active)
    ↓
Infrastructure:
  PostgresMedicalCertificateRepository (Prisma with $transaction)
    ↓
Frontend:
  services/medical-certificates.ts → views/MedicalCertificates.tsx → routes.ts
```

## Decisiones de Arquitectura

### Decisión: Prisma $transaction para creación
**Opción**: Usar `prisma.$transaction` para envolver `deactivateAllByMember` + `create`.
**Justificación**: Sin una transacción, una falla después de la desactivación pero antes de la creación dejaría al miembro sin ningún certificado activo. La transacción asegura atomicidad.
**Compensación**: La transacción abarca repositorio + caso de uso. El caso de uso controla el límite de la transacción.

### Decisión: Solo endpoint de certificado activo
**Opción**: Sin endpoint de listado de certificados.
**Justificación**: Los certificados médicos son un detalle de backend para validación. El frontend solo necesita mostrar el certificado activo actual y permitir crear uno nuevo.

### Decisión: Sin actualización/eliminación
**Opción**: Sin endpoints de actualización ni eliminación.
**Justificación**: Según TDD-0005, los certificados médicos son inmutables por trazabilidad. Si los datos son incorrectos, crear uno nuevo (que desactiva el anterior).

## Esquema Prisma

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

## Componentes de Arquitectura

### Capa de Dominio
**MedicalCertificateRepository** (puerto — 3 métodos):
  - `create(data)`: Promise<MedicalCertificateDTO>
  - `findActiveByMember(memberId)`: Promise<MedicalCertificateDTO | null>
  - `deactivateAllByMember(memberId)`: Promise<void> (updateMany isActive=false)

**MedicalCertificateValidator**:
  - `validateExpirationDate(issueDate, expirationDate?)`: if expirationDate < issueDate → error
  - No validateMemberExists - manejado en el caso de uso via memberRepo

### Capa de Aplicación
**CreateMedicalCertificateUseCase**:
  - execute(data): validateExpirationDate → check member exists → [deactivateAllByMember, create] in transaction → return DTO
  - Transacción: `prisma.$transaction([deactivateAllByMember, create])`

**GetActiveMedicalCertificateUseCase**:
  - execute(memberId): repo.findActiveByMember → return or 404

### Capa de Presentación
**MedicalCertificateController**:
  - POST `/api/v1/certificados-medicos` → create
  - GET `/api/v1/certificados-medicos/activo/:memberId` → getActive

### Capa de Infraestructura
**PostgresMedicalCertificateRepository**:
  - create: `prisma.medicalCertificate.create({ data })` → mapToDTO
  - findActiveByMember: `prisma.medicalCertificate.findFirst({ where: { memberId, isActive: true } })`
  - deactivateAllByMember: `prisma.medicalCertificate.updateMany({ where: { memberId, isActive: true }, data: { isActive: false } })`

## Validación

### Backend
| Campo | Regla | Capa |
|-------|------|------|
| memberId | Requerido, debe existir | Validador + memberRepo |
| expirationDate | Debe ser posterior a issueDate si se proporciona | Validador |
| issueDate | Opcional, por defecto now() | Default |

### Frontend
| Campo | Regla | Visualización |
|-------|------|---------------|
| memberId | Requerido | Selector de miembro |
| expirationDate | Opcional, debe ser posterior a hoy | Input de fecha con min=hoy |
| description | Opcional | Área de texto |
| doctorName | Opcional | Input de texto |

## Orden de Implementación
1. Esquema Prisma + migración
2. DTOs
3. Puerto del repositorio
4. Validador + pruebas (TDD)
5. CreateMedicalCertificateUseCase + prueba (TDD)
6. GetActiveMedicalCertificateUseCase + prueba (TDD)
7. PostgresMedicalCertificateRepository
8. Controlador + pruebas (TDD)
9. Cableado en app.ts
10. Frontend
