import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateDisciplineUseCase } from './UpdateDisciplineUseCase.js';
import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { DisciplineValidator } from '../domain/services/DisciplineValidator.js';
import { UpdateDisciplineRequest, DisciplineDetailDTO } from '@alentapp/shared';
import { NotFoundError } from '../domain/errors.js';

describe('UpdateDisciplineUseCase', () => {
  const mockDisciplineRepo = {
    findById: vi.fn(),
    update: vi.fn(),
  } as unknown as DisciplineRepository;

  const mockValidator = {
    validateEndDate: vi.fn(),
    validateSportExists: vi.fn(),
  } as unknown as DisciplineValidator;

  const useCase = new UpdateDisciplineUseCase(mockDisciplineRepo, mockValidator);

  const existingDiscipline: DisciplineDetailDTO = {
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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(mockDisciplineRepo.findById).mockResolvedValue(existingDiscipline);
  });

  it('debe actualizar una disciplina exitosamente', async () => {
    const updateData: UpdateDisciplineRequest = {
      name: 'Fútbol Infantil Modificado',
      professor: 'Nuevo Profesor',
    };

    const updatedDiscipline: DisciplineDetailDTO = {
      ...existingDiscipline,
      name: 'Fútbol Infantil Modificado',
      professor: 'Nuevo Profesor',
    };

    vi.mocked(mockDisciplineRepo.update).mockResolvedValueOnce(updatedDiscipline);

    const result = await useCase.execute('uuid-1', updateData);

    expect(mockDisciplineRepo.findById).toHaveBeenCalledWith('uuid-1');
    expect(mockValidator.validateEndDate).not.toHaveBeenCalled();
    expect(mockDisciplineRepo.update).toHaveBeenCalledWith('uuid-1', updateData);
    expect(result).toEqual(updatedDiscipline);
  });

  it('debe re-validar fechas si endDate cambia', async () => {
    const updateData: UpdateDisciplineRequest = {
      endDate: '2027-01-31',
    };

    vi.mocked(mockDisciplineRepo.update).mockResolvedValueOnce({
      ...existingDiscipline,
      endDate: '2027-01-31',
    });

    await useCase.execute('uuid-1', updateData);

    expect(mockValidator.validateEndDate).toHaveBeenCalledWith('2027-01-31', '2026-06-01');
    expect(mockDisciplineRepo.update).toHaveBeenCalledWith('uuid-1', updateData);
  });

  it('debe re-validar fechas si startDate cambia', async () => {
    const updateData: UpdateDisciplineRequest = {
      startDate: '2026-07-01',
    };

    vi.mocked(mockDisciplineRepo.update).mockResolvedValueOnce({
      ...existingDiscipline,
      startDate: '2026-07-01',
    });

    await useCase.execute('uuid-1', updateData);

    expect(mockValidator.validateEndDate).toHaveBeenCalledWith('2026-12-31', '2026-07-01');
  });

  it('debe lanzar NotFoundError si la disciplina no existe', async () => {
    vi.mocked(mockDisciplineRepo.findById).mockResolvedValueOnce(null);

    await expect(useCase.execute('uuid-no-existe', { name: 'test' })).rejects.toThrow(NotFoundError);
    expect(mockDisciplineRepo.update).not.toHaveBeenCalled();
  });

  it('debe lanzar error si endDate es inválido', async () => {
    vi.mocked(mockValidator.validateEndDate).mockImplementationOnce(() => {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    });

    await expect(
      useCase.execute('uuid-1', { endDate: '2026-05-01' })
    ).rejects.toThrow('La fecha de fin debe ser posterior a la fecha de inicio');
    expect(mockDisciplineRepo.update).not.toHaveBeenCalled();
  });
});
