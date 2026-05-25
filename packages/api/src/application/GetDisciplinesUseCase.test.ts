import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetDisciplinesUseCase } from './GetDisciplinesUseCase.js';
import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { DisciplineDetailDTO } from '@alentapp/shared';

describe('GetDisciplinesUseCase', () => {
  const mockDisciplineRepo = {
    findAll: vi.fn(),
  } as unknown as DisciplineRepository;

  const useCase = new GetDisciplinesUseCase(mockDisciplineRepo);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe retornar todas las disciplinas con sportName', async () => {
    const mockDisciplines: DisciplineDetailDTO[] = [
      {
        id: 'uuid-1',
        sportId: 'sport-1',
        name: 'Fútbol Infantil',
        startDate: '2026-06-01',
        endDate: '2026-12-31',
        created_at: '2026-05-23T00:00:00.000Z',
        sportName: 'Fútbol',
      },
      {
        id: 'uuid-2',
        sportId: 'sport-2',
        name: 'Natación Básica',
        startDate: '2026-07-01',
        endDate: '2026-09-30',
        created_at: '2026-05-23T00:00:00.000Z',
        sportName: 'Natación',
      },
    ];

    vi.mocked(mockDisciplineRepo.findAll).mockResolvedValueOnce(mockDisciplines);

    const result = await useCase.execute();

    expect(result).toEqual(mockDisciplines);
    expect(result).toHaveLength(2);
    expect(result[0].sportName).toBe('Fútbol');
    expect(result[1].sportName).toBe('Natación');
    expect(mockDisciplineRepo.findAll).toHaveBeenCalledWith(undefined);
  });

  it('debe retornar disciplinas filtradas por sportId', async () => {
    const mockDisciplines: DisciplineDetailDTO[] = [
      {
        id: 'uuid-1',
        sportId: 'sport-1',
        name: 'Fútbol Infantil',
        startDate: '2026-06-01',
        endDate: '2026-12-31',
        created_at: '2026-05-23T00:00:00.000Z',
        sportName: 'Fútbol',
      },
    ];

    vi.mocked(mockDisciplineRepo.findAll).mockResolvedValueOnce(mockDisciplines);

    const result = await useCase.execute({ sportId: 'sport-1' });

    expect(result).toEqual(mockDisciplines);
    expect(result).toHaveLength(1);
    expect(mockDisciplineRepo.findAll).toHaveBeenCalledWith({ sportId: 'sport-1' });
  });

  it('debe retornar lista vacía si no hay disciplinas', async () => {
    vi.mocked(mockDisciplineRepo.findAll).mockResolvedValueOnce([]);

    const result = await useCase.execute();

    expect(result).toEqual([]);
    expect(mockDisciplineRepo.findAll).toHaveBeenCalledWith(undefined);
  });
});
