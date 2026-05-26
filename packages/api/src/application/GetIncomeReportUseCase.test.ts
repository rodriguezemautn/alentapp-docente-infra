import { describe, it, expect, vi } from 'vitest';
import { GetIncomeReportUseCase } from './GetIncomeReportUseCase.js';
import type { PaymentRepository } from '../domain/PaymentRepository.js';

describe('GetIncomeReportUseCase', () => {
    const mockRepo: PaymentRepository = {
        create: vi.fn(), findById: vi.fn(), findAll: vi.fn(), update: vi.fn(),
        getIncomeReport: vi.fn(),
    };
    const useCase = new GetIncomeReportUseCase(mockRepo);

    it('debe generar reporte con fechas válidas', async () => {
        vi.mocked(mockRepo.getIncomeReport).mockResolvedValue({ from: '2026-01-01', to: '2026-01-31', grandTotal: 1000, items: [] });
        const result = await useCase.execute('2026-01-01', '2026-01-31');
        expect(result.grandTotal).toBe(1000);
    });

    it('debe rechazar fecha from > to', async () => {
        await expect(useCase.execute('2026-02-01', '2026-01-01')).rejects.toThrow('no puede ser posterior');
    });

    it('debe rechazar groupBy inválido', async () => {
        await expect(useCase.execute('2026-01-01', '2026-01-31', 'invalid')).rejects.toThrow('Agrupación no válida');
    });
});
