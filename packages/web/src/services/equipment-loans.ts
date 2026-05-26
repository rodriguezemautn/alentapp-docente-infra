import type {
  EquipmentLoanDTO,
  EquipmentLoanDetailDTO,
  CreateEquipmentLoanRequest,
  ReturnEquipmentLoanRequest,
} from "@alentapp/shared";

const BASE_URL = "http://localhost:3000/api/v1";

export const equipmentLoansService = {
  async getAll(memberId?: string, status?: string): Promise<EquipmentLoanDetailDTO[]> {
    const params = new URLSearchParams();
    if (memberId) params.set("memberId", memberId);
    if (status) params.set("status", status);
    const qs = params.toString();
    const res = await fetch(`${BASE_URL}/prestamos-equipamiento${qs ? `?${qs}` : ""}`);
    if (!res.ok) throw new Error("Error al cargar préstamos");
    const json = await res.json();
    return json.data;
  },

  async create(data: CreateEquipmentLoanRequest): Promise<EquipmentLoanDTO> {
    const res = await fetch(`${BASE_URL}/prestamos-equipamiento`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al crear préstamo");
    }
    const json = await res.json();
    return json.data;
  },

  async returnLoan(id: string, data: ReturnEquipmentLoanRequest): Promise<EquipmentLoanDTO> {
    const res = await fetch(`${BASE_URL}/prestamos-equipamiento/${id}/return`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al devolver préstamo");
    }
    const json = await res.json();
    return json.data;
  },

  async reportLost(id: string): Promise<EquipmentLoanDTO> {
    const res = await fetch(`${BASE_URL}/prestamos-equipamiento/${id}/report-lost`, {
      method: "PUT",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al reportar pérdida");
    }
    const json = await res.json();
    return json.data;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/prestamos-equipamiento/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al eliminar préstamo");
    }
  },
};
