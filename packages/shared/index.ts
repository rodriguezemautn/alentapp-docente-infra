// ==========================================
// Member
// ==========================================
export type MemberCategory = 'Pleno' | 'Cadete' | 'Honorario';
export type MemberStatus = 'Activo' | 'Moroso' | 'Suspendido';
export type SportCategory = 'Senior' | 'Lifetime' | 'Cadet';

export interface MemberDTO {
  id: string; // UUID
  dni: string;
  name: string;
  email: string;
  birthdate: string; // ISO Date String (YYYY-MM-DD)
  category: MemberCategory;
  status: MemberStatus;
  sportCategory?: SportCategory;
  created_at: string; // ISO Date String
}

export interface UpdateMemberRequest {
  dni?: string;
  name?: string;
  email?: string;
  birthdate?: string; // ISO Date String (YYYY-MM-DD)
  category?: MemberCategory;
  status?: MemberStatus;
  sportCategory?: SportCategory;
}

export interface CreateMemberRequest {
  dni: string;
  name: string;
  email: string;
  birthdate: string; // ISO Date String (YYYY-MM-DD)
  category: MemberCategory;
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
// Discipline
// ==========================================
export interface DisciplineDTO {
  id: string;
  sportId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  schedule?: string;
  professor?: string;
  created_at: string;
}

export interface DisciplineDetailDTO extends DisciplineDTO {
  sportName?: string;
}

export interface CreateDisciplineRequest {
  sportId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  schedule?: string;
  professor?: string;
}

export interface UpdateDisciplineRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  schedule?: string;
  professor?: string;
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

// ==========================================
// Locker
// ==========================================
export type LockerStatus = 'Available' | 'Occupied' | 'Maintenance';

export interface LockerDTO {
  id: string;
  number: number;
  location?: string;
  status: LockerStatus;
  memberId?: string;
  created_at: string;
}

export interface LockerDetailDTO extends LockerDTO {
  memberName?: string;
}

export interface CreateLockerRequest {
  number: number;
  location?: string;
}

export interface UpdateLockerRequest {
  number?: number;
  location?: string;
  status?: LockerStatus;
  memberId?: string | null;
}

// ==========================================
// Locker Assignment Log
// ==========================================
export type LockerEventType = 'Assignment' | 'Release';

export interface LockerAssignmentLogDTO {
  id: string;
  lockerId: string;
  lockerNumber: number;
  memberId: string;
  memberName: string;
  eventType: LockerEventType;
  assignedAt: string;
  releasedAt?: string;
  created_at: string;
}

// ==========================================
// Equipment Loan
// ==========================================
export type LoanStatus = 'Active' | 'Returned' | 'Lost';

export interface EquipmentLoanDTO {
  id: string;
  memberId: string;
  equipmentName: string;
  loanDate: string;
  returnDate?: string;
  status: LoanStatus;
  notes?: string;
  created_at: string;
}

export interface EquipmentLoanDetailDTO extends EquipmentLoanDTO {
  memberName?: string;
}

export interface CreateEquipmentLoanRequest {
  memberId: string;
  equipmentName: string;
  notes?: string;
}

export interface ReturnEquipmentLoanRequest {
  returnDate?: string;
  notes?: string;
}

// ==========================================
// Reports
// ==========================================
export interface IncomeReportItem {
  period: string;
  total: number;
  byType: {
    Cuota: number;
    Mensualidad: number;
    Inscripcion: number;
    Otro: number;
  };
  canceledCount: number;
}

export interface IncomeReportResponse {
  from: string;
  to: string;
  grandTotal: number;
  items: IncomeReportItem[];
}

export interface LockerReportResponse {
  total: number;
  available: number;
  occupied: number;
  maintenance: number;
  occupancyRate: number;
}

export interface MaterialReportResponse {
  totalLoans: number;
  byStatus: {
    active: number;
    returned: number;
    lost: number;
  };
  activeLoans: EquipmentLoanDetailDTO[];
  lostItems: EquipmentLoanDetailDTO[];
}

export interface MemberReportResponse {
  total: number;
  byCategory: {
    Pleno: number;
    Cadete: number;
    Honorario: number;
  };
  byStatus: {
    Activo: number;
    Moroso: number;
    Suspendido: number;
  };
  delinquencyRate: number;
  monthlyRegistrations: {
    month: string;
    count: number;
  }[];
}
