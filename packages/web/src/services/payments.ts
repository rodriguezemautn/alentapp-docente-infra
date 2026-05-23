import type { PaymentDTO, PaymentDetailDTO, CreatePaymentRequest, PaymentFilters, PaginatedResponse } from '@alentapp/shared';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/v1';

export const paymentsService = {
  async getAll(filters?: PaymentFilters): Promise<PaginatedResponse<PaymentDTO>> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.memberId) params.set('memberId', filters.memberId);
      if (filters.paymentType) params.set('paymentType', filters.paymentType);
      if (filters.status) params.set('status', filters.status);
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      if (filters.page) params.set('page', String(filters.page));
      if (filters.limit) params.set('limit', String(filters.limit));
    }
    const queryString = params.toString();
    const url = `${API_URL}/pagos${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Error al obtener los pagos');
    }
    return await response.json();
  },

  async getById(id: string): Promise<PaymentDetailDTO> {
    const response = await fetch(`${API_URL}/pagos/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener el pago');
    }
    const result = await response.json();
    return result.data;
  },

  async create(data: CreatePaymentRequest): Promise<PaymentDTO> {
    const response = await fetch(`${API_URL}/pagos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear el pago');
    }
    const result = await response.json();
    return result.data;
  },

  async cancel(id: string): Promise<PaymentDTO> {
    const response = await fetch(`${API_URL}/pagos/${id}/cancel`, {
      method: 'PUT',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al cancelar el pago');
    }
    const result = await response.json();
    return result.data;
  },
};
