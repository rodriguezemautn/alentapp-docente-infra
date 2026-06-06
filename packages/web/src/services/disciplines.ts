import type { DisciplineDetailDTO, CreateDisciplineRequest, UpdateDisciplineRequest } from '@alentapp/shared';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/v1';

export const disciplinesService = {
  async getAll(sportId?: string): Promise<DisciplineDetailDTO[]> {
    const params = sportId ? `?sportId=${encodeURIComponent(sportId)}` : '';
    const response = await fetch(`${API_URL}/disciplinas${params}`);
    if (!response.ok) {
      throw new Error('Error al obtener las disciplinas');
    }
    const result = await response.json();
    return result.data;
  },

  async getById(id: string): Promise<DisciplineDetailDTO> {
    const response = await fetch(`${API_URL}/disciplinas/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener la disciplina');
    }
    const result = await response.json();
    return result.data;
  },

  async create(data: CreateDisciplineRequest): Promise<DisciplineDetailDTO> {
    const response = await fetch(`${API_URL}/disciplinas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al crear la disciplina');
    }
    const result = await response.json();
    return result.data;
  },

  async update(id: string, data: UpdateDisciplineRequest): Promise<DisciplineDetailDTO> {
    const response = await fetch(`${API_URL}/disciplinas/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al actualizar la disciplina');
    }
    const result = await response.json();
    return result.data;
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/disciplinas/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al eliminar la disciplina');
    }
  },
};
