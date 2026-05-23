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
