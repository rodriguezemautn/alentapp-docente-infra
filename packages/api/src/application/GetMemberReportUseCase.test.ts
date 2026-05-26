import { describe, it, expect, vi } from 'vitest';
import { GetMemberReportUseCase } from './GetMemberReportUseCase.js';
import type { MemberRepository } from '../domain/MemberRepository.js';

describe('GetMemberReportUseCase', () => {
    const mockRepo: MemberRepository = {
        create: vi.fn(), findById: vi.fn(), findByDni: vi.fn(), findAll: vi.fn(),
        update: vi.fn(), delete: vi.fn(), getMemberReport: vi.fn(),
    };
    const useCase = new GetMemberReportUseCase(mockRepo);

    it('debe retornar reporte de socios', async () => {
        vi.mocked(mockRepo.getMemberReport).mockResolvedValue({
            total: 10, byCategory: { Pleno: 5, Cadete: 3, Honorario: 2 },
            byStatus: { Activo: 8, Moroso: 1, Suspendido: 1 },
            delinquencyRate: 10, monthlyRegistrations: [],
        });
        const result = await useCase.execute();
        expect(result.total).toBe(10);
        expect(result.delinquencyRate).toBe(10);
    });
});
