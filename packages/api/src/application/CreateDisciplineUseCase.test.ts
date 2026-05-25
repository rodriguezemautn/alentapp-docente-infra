import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateDisciplineUseCase } from './CreateDisciplineUseCase.js';
import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { DisciplineValidator } from '../domain/services/DisciplineValidator.js';
import { CreateDisciplineRequest, DisciplineDetailDTO } from '@alentapp/shared';

describe('CreateDisciplineUseCase', () => {
  const mockDisciplineRepo = {
    create: vi.fn(),
  } as unknown as DisciplineRepository;

  const mockValidator = {
    validateEndDate: vi.fn(),
    validateSportExists: vi.fn(),
  } as unknown as DisciplineValidator;

  const useCase = new CreateDisciplineUseCase(mockDisciplineRepo, mockValidator);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validRequest: CreateDisciplineRequest = {
    sportId: 'sport-1',
    name: 'Fútbol Infantil',
    description: 'Categoría infantil',
    startDate: '2026-06-01',
    endDate: '2026-12-31',
    schedule: 'Lun y Mie 18:00',
    professor: 'Carlos Pérez',
  };

  const expectedDTO: DisciplineDetailDTO = {
    id: 'uuid-1',
    sportId: 'sport-1',
    name: 'Fútbol Infantil',
    description: 'Categoría infantil',
    startDate: '2026-06-01',
    endDate: '2026-12-31',
    schedule: 'Lun y Mie 18:00',
    professor: 'Carlos Pérez',
    created_at: '2026-05-23T00:00:00.000Z',
    sportName: 'Fútbol',
  };

  it('debe crear una disciplina exitosamente si pasa todas las validaciones', async () => {
    vi.mocked(mockDisciplineRepo.create).mockResolvedValueOnce(expectedDTO);

    const result = await useCase.execute(validRequest);

    expect(mockValidator.validateEndDate).toHaveBeenCalledWith('2026-12-31', '2026-06-01');
    expect(mockValidator.validateSportExists).toHaveBeenCalledWith('sport-1');
    expect(mockDisciplineRepo.create).toHaveBeenCalledWith(validRequest);
    expect(result).toEqual(expectedDTO);
  });

  it('debe lanzar error si endDate es inválido', async () => {
    vi.mocked(mockValidator.validateEndDate).mockImplementationOnce(() => {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    });

    await expect(useCase.execute(validRequest)).rejects.toThrow(
      'La fecha de fin debe ser posterior a la fecha de inicio'
    );
    expect(mockDisciplineRepo.create).not.toHaveBeenCalled();
  });

  it('debe lanzar error si el deporte no existe', async () => {
    vi.mocked(mockValidator.validateSportExists).mockRejectedValueOnce(
      new Error('El deporte no existe')
    );

    await expect(useCase.execute(validRequest)).rejects.toThrow('El deporte no existe');
    expect(mockDisciplineRepo.create).not.toHaveBeenCalled();
  });

  it('debe crear una disciplina sin campos opcionales', async () => {
    const minimalRequest: CreateDisciplineRequest = {
      sportId: 'sport-1',
      name: 'Natación Básica',
      startDate: '2026-07-01',
      endDate: '2026-09-30',
    };

    const minimalDTO: DisciplineDetailDTO = {
      id: 'uuid-2',
      sportId: 'sport-1',
      name: 'Natación Básica',
      startDate: '2026-07-01',
      endDate: '2026-09-30',
      created_at: '2026-05-23T00:00:00.000Z',
      sportName: 'Fútbol',
    };

    vi.mocked(mockDisciplineRepo.create).mockResolvedValueOnce(minimalDTO);

    const result = await useCase.execute(minimalRequest);

    expect(mockValidator.validateEndDate).toHaveBeenCalledWith('2026-09-30', '2026-07-01');
    expect(mockValidator.validateSportExists).toHaveBeenCalledWith('sport-1');
    expect(mockDisciplineRepo.create).toHaveBeenCalledWith(minimalRequest);
    expect(result).toEqual(minimalDTO);
  });
});
