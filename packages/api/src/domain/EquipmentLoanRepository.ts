import { EquipmentLoanDTO, EquipmentLoanDetailDTO, CreateEquipmentLoanRequest, ReturnEquipmentLoanRequest } from '@alentapp/shared';

export interface EquipmentLoanRepository {
  create(data: CreateEquipmentLoanRequest): Promise<EquipmentLoanDTO>;
  findById(id: string): Promise<EquipmentLoanDetailDTO | null>;
  findAll(memberId?: string, status?: string): Promise<EquipmentLoanDetailDTO[]>;
  update(id: string, data: Partial<ReturnEquipmentLoanRequest & { status: string }>): Promise<EquipmentLoanDTO>;
  delete(id: string): Promise<void>;
}
