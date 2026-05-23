import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetDisciplineByIdUseCase } from './GetDisciplineByIdUseCase.js';
import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { DisciplineDetailDTO } from '@alentapp/shared';
import { NotFoundError } from '../domain/errors.js';

describe('GetDisciplineByIdUseCase', () => {
  const mockDisciplineRepo = {
    findById: vi.fn(),
  } as unknown as DisciplineRepository;

  const useCase = new GetDisciplineByIdUseCase(mockDisciplineRepo);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe retornar la disciplina si existe', async () => {
    const mockDiscipline: DisciplineDetailDTO = {
      id: 'uuid-1',
      sportId: 'sport-1',
      name: 'Fútbol Infantil',
      startDate: '2026-06-01',
      endDate: '2026-12-31',
      schedule: 'Lun y Mie 18:00',
      professor: 'Carlos Pérez',
      created_at: '2026-05-23T00:00:00.000Z',
      sportName: 'Fútbol',
    };

    vi.mocked(mockDisciplineRepo.findById).mockResolvedValueOnce(mockDiscipline);

    const result = await useCase.execute('uuid-1');

    expect(result).toEqual(mockDiscipline);
    expect(mockDisciplineRepo.findById).toHaveBeenCalledWith('uuid-1');
  });

  it('debe lanzar NotFoundError si la disciplina no existe', async () => {
    vi.mocked(mockDisciplineRepo.findById).mockResolvedValueOnce(null);

    await expect(useCase.execute('uuid-no-existe')).rejects.toThrow(NotFoundError);
    await expect(useCase.execute('uuid-no-existe')).rejects.toThrow('La disciplina no existe');
    expect(mockDisciplineRepo.findById).toHaveBeenCalledWith('uuid-no-existe');
  });
});
