import {
  PaymentDTO,
  PaymentDetailDTO,
  CreatePaymentRequest,
  PaymentFilters,
  PaymentStatus,
  PaginatedResponse,
} from '@alentapp/shared';

import { IncomeReportResponse } from '@alentapp/shared';

export interface PaymentRepository {
  create(data: CreatePaymentRequest & { status: PaymentStatus }): Promise<PaymentDTO>;
  findById(id: string): Promise<PaymentDetailDTO | null>;
  findAll(filters: PaymentFilters): Promise<PaginatedResponse<PaymentDTO>>;
  update(id: string, data: Partial<PaymentDTO>): Promise<PaymentDTO>;
  getIncomeReport(from: string, to: string, groupBy: string): Promise<IncomeReportResponse>;
}
