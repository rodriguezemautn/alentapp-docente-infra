import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetSportsUseCase } from './GetSportsUseCase.js';
import { SportRepository } from '../domain/SportRepository.js';
import { SportDetailDTO } from '@alentapp/shared';

describe('GetSportsUseCase', () => {
    const mockSportRepo = {
        findAll: vi.fn(),
    } as unknown as SportRepository;

    const useCase = new GetSportsUseCase(mockSportRepo);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe retornar la lista de deportes con disciplineCount', async () => {
        const mockSports: SportDetailDTO[] = [
            {
                id: 'uuid-1',
                name: 'Fútbol',
                description: 'Deporte de equipo',
                maxCapacity: 22,
                created_at: '2026-05-23T00:00:00.000Z',
                disciplineCount: 2,
            },
            {
                id: 'uuid-2',
                name: 'Natación',
                description: undefined,
                maxCapacity: 30,
                created_at: '2026-05-23T00:00:00.000Z',
                disciplineCount: 0,
            },
        ];

        vi.mocked(mockSportRepo.findAll).mockResolvedValueOnce(mockSports);

        const result = await useCase.execute();

        expect(result).toEqual(mockSports);
        expect(result).toHaveLength(2);
        expect(result[0].disciplineCount).toBe(2);
        expect(result[1].disciplineCount).toBe(0);
        expect(mockSportRepo.findAll).toHaveBeenCalledOnce();
    });

    it('debe retornar un arreglo vacío si no hay deportes', async () => {
        vi.mocked(mockSportRepo.findAll).mockResolvedValueOnce([]);

        const result = await useCase.execute();

        expect(result).toEqual([]);
        expect(mockSportRepo.findAll).toHaveBeenCalledOnce();
    });
});
