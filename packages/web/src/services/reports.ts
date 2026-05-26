import type {
  IncomeReportResponse,
  LockerReportResponse,
  MaterialReportResponse,
  MemberReportResponse,
} from "@alentapp/shared";

const BASE_URL = "http://localhost:3000/api/v1";

export const reportsService = {
  async getIncomeReport(from: string, to: string, groupBy = "month"): Promise<IncomeReportResponse> {
    const res = await fetch(`${BASE_URL}/reportes/ingresos?from=${from}&to=${to}&groupBy=${groupBy}`);
    if (!res.ok) throw new Error("Error al cargar reporte de ingresos");
    const json = await res.json();
    return json.data;
  },

  async getLockerReport(): Promise<LockerReportResponse> {
    const res = await fetch(`${BASE_URL}/reportes/casilleros`);
    if (!res.ok) throw new Error("Error al cargar reporte de casilleros");
    const json = await res.json();
    return json.data;
  },

  async getMaterialReport(): Promise<MaterialReportResponse> {
    const res = await fetch(`${BASE_URL}/reportes/material`);
    if (!res.ok) throw new Error("Error al cargar reporte de material");
    const json = await res.json();
    return json.data;
  },

  async getMemberReport(): Promise<MemberReportResponse> {
    const res = await fetch(`${BASE_URL}/reportes/socios`);
    if (!res.ok) throw new Error("Error al cargar reporte de socios");
    const json = await res.json();
    return json.data;
  },
};
