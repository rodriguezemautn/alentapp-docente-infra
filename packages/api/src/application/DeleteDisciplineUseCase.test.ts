import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteDisciplineUseCase } from './DeleteDisciplineUseCase.js';
import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { DisciplineDetailDTO } from '@alentapp/shared';
import { NotFoundError } from '../domain/errors.js';

describe('DeleteDisciplineUseCase', () => {
  const mockDisciplineRepo = {
    findById: vi.fn(),
    delete: vi.fn(),
  } as unknown as DisciplineRepository;

  const useCase = new DeleteDisciplineUseCase(mockDisciplineRepo);

  const existingDiscipline: DisciplineDetailDTO = {
    id: 'uuid-1',
    sportId: 'sport-1',
    name: 'Fútbol Infantil',
    startDate: '2026-06-01',
    endDate: '2026-12-31',
    created_at: '2026-05-23T00:00:00.000Z',
    sportName: 'Fútbol',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe eliminar una disciplina exitosamente', async () => {
    vi.mocked(mockDisciplineRepo.findById).mockResolvedValueOnce(existingDiscipline);
    vi.mocked(mockDisciplineRepo.delete).mockResolvedValueOnce(undefined);

    await useCase.execute('uuid-1');

    expect(mockDisciplineRepo.findById).toHaveBeenCalledWith('uuid-1');
    expect(mockDisciplineRepo.delete).toHaveBeenCalledWith('uuid-1');
  });

  it('debe lanzar NotFoundError si la disciplina no existe', async () => {
    vi.mocked(mockDisciplineRepo.findById).mockResolvedValueOnce(null);

    await expect(useCase.execute('uuid-no-existe')).rejects.toThrow(NotFoundError);
    await expect(useCase.execute('uuid-no-existe')).rejects.toThrow('La disciplina no existe');
    expect(mockDisciplineRepo.findById).toHaveBeenCalledWith('uuid-no-existe');
    expect(mockDisciplineRepo.delete).not.toHaveBeenCalled();
  });
});
