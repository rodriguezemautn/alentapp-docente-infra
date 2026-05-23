import type { MedicalCertificateDTO, CreateMedicalCertificateRequest } from '@alentapp/shared';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/v1';

export const medicalCertificatesService = {
  async getActive(memberId: string): Promise<MedicalCertificateDTO | null> {
    const response = await fetch(`${API_URL}/certificados-medicos/activo/${memberId}`);
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error('Error al obtener el certificado activo');
    }
    const result = await response.json();
    return result.data;
  },

  async create(data: CreateMedicalCertificateRequest): Promise<MedicalCertificateDTO> {
    const response = await fetch(`${API_URL}/certificados-medicos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear el certificado');
    }
    const result = await response.json();
    return result.data;
  },
};
