// ==========================================
// Member
// ==========================================
export type MemberCategory = 'Pleno' | 'Cadete' | 'Honorario';
export type MemberStatus = 'Activo' | 'Moroso' | 'Suspendido';

export interface MemberDTO {
  id: string; // UUID
  dni: string;
  name: string;
  email: string;
  birthdate: string; // ISO Date String (YYYY-MM-DD)
  category: MemberCategory;
  status: MemberStatus;
  created_at: string; // ISO Date String
}

export interface CreateMemberRequest {
  dni: string;
  name: string;
  email: string;
  birthdate: string; // ISO Date String (YYYY-MM-DD)
  category: MemberCategory;
}

export interface UpdateMemberRequest {
  dni?: string;
  name?: string;
  email?: string;
  birthdate?: string; // ISO Date String (YYYY-MM-DD)
  category?: MemberCategory;
  status?: MemberStatus;
}

// ==========================================
// Sport
// ==========================================
export interface SportDTO {
  id: string;           // UUID
  name: string;
  description?: string; // nullable
  maxCapacity: number;
  created_at: string;   // ISO date string
}

export interface SportDetailDTO extends SportDTO {
  disciplineCount: number;
}

export interface CreateSportRequest {
  name: string;
  description?: string;
  maxCapacity: number;
}

export interface UpdateSportRequest {
  description?: string;
  maxCapacity?: number;
  // NOTE: name is intentionally excluded — it is immutable after creation
}

// ==========================================
// Payment
// ==========================================
export type PaymentType = 'Cuota' | 'Mensualidad' | 'Inscripcion' | 'Otro';
export type PaymentStatus = 'Completed' | 'Canceled';

export interface PaymentDTO {
  id: string;
  memberId: string;
  amount: number;
  paymentDate: string;
  paymentType: PaymentType;
  status: PaymentStatus;
  created_at: string;
}

export interface PaymentDetailDTO extends PaymentDTO {
  memberName: string;
}

export interface CreatePaymentRequest {
  memberId: string;
  amount: number;
  paymentDate?: string;
  paymentType: PaymentType;
}

export interface PaymentFilters {
  memberId?: string;
  paymentType?: PaymentType;
  status?: PaymentStatus;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ==========================================
// Medical Certificate
// ==========================================
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
