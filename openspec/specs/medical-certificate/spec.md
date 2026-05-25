# Especificación de MedicalCertificate

## Propósito

La entidad MedicalCertificate representa un certificado de aptitud médica presentado por un miembro. Un miembro solo puede tener UN certificado activo a la vez — crear uno nuevo desactiva automáticamente cualquier certificado activo anterior. Los certificados médicos son inmutables (sin actualización, sin eliminación) por trazabilidad médica.

## Requisitos Funcionales

### RF-01: Crear Certificado Médico
El sistema DEBE crear un certificado médico para un miembro existente. Crear un nuevo certificado DEBE desactivar automáticamente cualquier certificado activo actual de ese miembro (en una transacción).
- Éxito → HTTP `201` con `MedicalCertificateDTO`, `isActive: true`
- Miembro no encontrado → HTTP `404`
- Fecha de vencimiento anterior a la fecha de emisión → HTTP `400`
- El certificado activo anterior pasa a `isActive: false` automáticamente

### RF-02: Obtener Certificado Activo por Miembro
El sistema DEBE devolver el certificado actualmente activo para un miembro dado.
- Éxito → HTTP `200` con `MedicalCertificateDTO`
- Sin certificado activo → HTTP `404`

## Reglas de Negocio

| ID | Regla | Obligatoriedad |
|----|------|----------------|
| RN-01 | Un miembro DEBE tener como máximo UN certificado activo en todo momento | OBLIGATORIO |
| RN-02 | Crear un nuevo certificado DEBE desactivar cualquier activo anterior en una transacción | OBLIGATORIO |
| RN-03 | Los certificados médicos NO DEBEN ser actualizados ni eliminados (inmutables) | OBLIGATORIO |
| RN-04 | `expirationDate` DEBE ser posterior a `issueDate` si se proporciona | OBLIGATORIO |
| RN-05 | `issueDate` por defecto es now() si no se proporciona | OPCIONAL |

## Contrato de API

Base: `/api/v1/certificados-medicos`

| Método | Ruta | Solicitud | Respuesta | Errores |
|--------|------|-----------|-----------|---------|
| POST | `/api/v1/certificados-medicos` | `CreateMedicalCertificateRequest` | `201` `MedicalCertificateDTO` | 400, 404 |
| GET | `/api/v1/certificados-medicos/activo/:memberId` | — | `200` `MedicalCertificateDTO` | 404 |

## Definiciones de DTO

```typescript
// packages/shared/index.ts additions

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

## Escenarios de Prueba

### Crear — Camino feliz (sin certificado previo)
- DADO un miembro sin certificados previos
- CUANDO se llama a `POST /api/v1/certificados-medicos` con datos válidos
- ENTONCES HTTP `201` con `MedicalCertificateDTO`, `isActive: true`

### Crear — Desactiva el activo anterior
- DADO un miembro con un certificado activo
- CUANDO se crea un nuevo certificado para el mismo miembro
- ENTONCES HTTP `201`, el nuevo certificado tiene `isActive: true`, el anterior tiene `isActive: false`

### Crear — Miembro no encontrado
- DADO que memberId no existe
- CUANDO se llama a `POST`
- ENTONCES HTTP `404`

### Crear — Fecha de vencimiento inválida
- DADO que expirationDate es anterior a issueDate
- CUANDO se llama a `POST`
- ENTONCES HTTP `400`

### Obtener activo — Encontrado
- DADO un miembro con un certificado activo
- CUANDO se llama a `GET /activo/:memberId`
- ENTONCES HTTP `200` con `MedicalCertificateDTO`

### Obtener activo — No encontrado
- DADO un miembro sin certificado activo
- CUANDO se llama a `GET /activo/:memberId`
- ENTONCES HTTP `404`
