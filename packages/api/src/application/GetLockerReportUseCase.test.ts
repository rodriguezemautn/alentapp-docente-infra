import { describe, it, expect, vi } from 'vitest';
import { GetLockerReportUseCase } from './GetLockerReportUseCase.js';
import type { LockerRepository } from '../domain/LockerRepository.js';

describe('GetLockerReportUseCase', () => {
    const mockRepo: LockerRepository = {
        create: vi.fn(), findById: vi.fn(), findByNumber: vi.fn(), findAll: vi.fn(),
        update: vi.fn(), delete: vi.fn(), getLockerReport: vi.fn(),
    };
    const useCase = new GetLockerReportUseCase(mockRepo);

    it('debe retornar reporte de casilleros', async () => {
        vi.mocked(mockRepo.getLockerReport).mockResolvedValue({
            total: 10, available: 5, occupied: 3, maintenance: 2, occupancyRate: 30,
        });
        const result = await useCase.execute();
        expect(result.total).toBe(10);
        expect(result.occupancyRate).toBe(30);
    });
});
