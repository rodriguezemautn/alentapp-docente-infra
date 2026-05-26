import type {
  LockerDTO,
  LockerDetailDTO,
  CreateLockerRequest,
  UpdateLockerRequest,
} from "@alentapp/shared";

const BASE_URL = "http://localhost:3000/api/v1";

export const lockersService = {
  async getAll(status?: string): Promise<LockerDetailDTO[]> {
    const params = status ? `?status=${status}` : "";
    const res = await fetch(`${BASE_URL}/casilleros${params}`);
    if (!res.ok) throw new Error("Error al cargar casilleros");
    const json = await res.json();
    return json.data;
  },

  async getById(id: string): Promise<LockerDetailDTO> {
    const res = await fetch(`${BASE_URL}/casilleros/${id}`);
    if (!res.ok) throw new Error("Error al obtener el casillero");
    const json = await res.json();
    return json.data;
  },

  async create(data: CreateLockerRequest): Promise<LockerDTO> {
    const res = await fetch(`${BASE_URL}/casilleros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al crear casillero");
    }
    const json = await res.json();
    return json.data;
  },

  async update(id: string, data: UpdateLockerRequest): Promise<LockerDTO> {
    const res = await fetch(`${BASE_URL}/casilleros/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al actualizar casillero");
    }
    const json = await res.json();
    return json.data;
  },

  async delete(id: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/casilleros/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al eliminar casillero");
    }
  },
};
