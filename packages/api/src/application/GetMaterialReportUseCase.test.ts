import { describe, it, expect, vi } from 'vitest';
import { GetMaterialReportUseCase } from './GetMaterialReportUseCase.js';
import type { EquipmentLoanRepository } from '../domain/EquipmentLoanRepository.js';

describe('GetMaterialReportUseCase', () => {
    const mockRepo: EquipmentLoanRepository = {
        create: vi.fn(), findById: vi.fn(), findAll: vi.fn(), update: vi.fn(),
        delete: vi.fn(), getMaterialReport: vi.fn(),
    };
    const useCase = new GetMaterialReportUseCase(mockRepo);

    it('debe retornar reporte de material', async () => {
        vi.mocked(mockRepo.getMaterialReport).mockResolvedValue({
            totalLoans: 5, byStatus: { active: 2, returned: 2, lost: 1 },
            activeLoans: [], lostItems: [],
        });
        const result = await useCase.execute();
        expect(result.totalLoans).toBe(5);
        expect(result.byStatus.lost).toBe(1);
    });
});
