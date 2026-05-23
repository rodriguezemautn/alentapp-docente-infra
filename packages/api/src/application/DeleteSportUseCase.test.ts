import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteSportUseCase } from './DeleteSportUseCase.js';
import { SportRepository } from '../domain/SportRepository.js';
import { SportDTO } from '@alentapp/shared';

describe('DeleteSportUseCase', () => {
    const mockSportRepo = {
        findById: vi.fn(),
        delete: vi.fn(),
        countDisciplines: vi.fn(),
    } as unknown as SportRepository;

    const useCase = new DeleteSportUseCase(mockSportRepo);

    const mockSport: SportDTO = {
        id: 'uuid-1',
        name: 'Fútbol',
        description: 'Deporte de equipo',
        maxCapacity: 22,
        created_at: '2026-05-23T00:00:00.000Z',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe eliminar un deporte exitosamente si existe y no tiene disciplinas', async () => {
        vi.mocked(mockSportRepo.findById).mockResolvedValueOnce(mockSport);
        vi.mocked(mockSportRepo.countDisciplines).mockResolvedValueOnce(0);

        await useCase.execute('uuid-1');

        expect(mockSportRepo.findById).toHaveBeenCalledWith('uuid-1');
        expect(mockSportRepo.countDisciplines).toHaveBeenCalledWith('uuid-1');
        expect(mockSportRepo.delete).toHaveBeenCalledWith('uuid-1');
    });

    it('debe lanzar error si el deporte no existe', async () => {
        vi.mocked(mockSportRepo.findById).mockResolvedValueOnce(null);

        await expect(useCase.execute('uuid-no-existe')).rejects.toThrow('El deporte no existe');
        expect(mockSportRepo.delete).not.toHaveBeenCalled();
        expect(mockSportRepo.countDisciplines).not.toHaveBeenCalled();
    });

    it('debe lanzar error si el deporte tiene disciplinas asociadas', async () => {
        vi.mocked(mockSportRepo.findById).mockResolvedValueOnce(mockSport);
        vi.mocked(mockSportRepo.countDisciplines).mockResolvedValueOnce(2);

        await expect(useCase.execute('uuid-1')).rejects.toThrow(
            'No se puede eliminar un deporte con disciplinas asociadas'
        );
        expect(mockSportRepo.delete).not.toHaveBeenCalled();
    });
});
