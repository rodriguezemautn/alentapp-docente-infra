import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreateSportUseCase } from './CreateSportUseCase.js';
import { SportRepository } from '../domain/SportRepository.js';
import { SportValidator } from '../domain/services/SportValidator.js';
import { CreateSportRequest, SportDTO } from '@alentapp/shared';

describe('CreateSportUseCase', () => {
    const mockSportRepo = {
        create: vi.fn(),
        findByName: vi.fn(),
    } as unknown as SportRepository;

    const mockSportValidator = {
        validateName: vi.fn(),
        validateDescription: vi.fn(),
        validateMaxCapacity: vi.fn(),
        validateNameIsUnique: vi.fn(),
        validateNameNotInPayload: vi.fn(),
    } as unknown as SportValidator;

    const useCase = new CreateSportUseCase(mockSportRepo, mockSportValidator);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const validRequest: CreateSportRequest = {
        name: 'Fútbol',
        description: 'Deporte de equipo',
        maxCapacity: 22,
    };

    const expectedSportDTO: SportDTO = {
        id: 'uuid-1',
        name: 'Fútbol',
        description: 'Deporte de equipo',
        maxCapacity: 22,
        created_at: '2026-05-23T00:00:00.000Z',
    };

    it('debe crear un deporte exitosamente si pasa todas las validaciones', async () => {
        vi.mocked(mockSportRepo.create).mockResolvedValueOnce(expectedSportDTO);

        const result = await useCase.execute(validRequest);

        expect(mockSportValidator.validateName).toHaveBeenCalledWith('Fútbol');
        expect(mockSportValidator.validateDescription).toHaveBeenCalledWith('Deporte de equipo');
        expect(mockSportValidator.validateMaxCapacity).toHaveBeenCalledWith(22);
        expect(mockSportValidator.validateNameIsUnique).toHaveBeenCalledWith('Fútbol');
        expect(mockSportRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Fútbol',
            description: 'Deporte de equipo',
            maxCapacity: 22,
        }));
        expect(result).toEqual(expectedSportDTO);
    });

    it('debe lanzar error si el nombre ya existe (duplicado)', async () => {
        vi.mocked(mockSportValidator.validateNameIsUnique).mockRejectedValueOnce(
            new Error('Ya existe un deporte con ese nombre')
        );

        await expect(useCase.execute(validRequest)).rejects.toThrow('Ya existe un deporte con ese nombre');
        expect(mockSportRepo.create).not.toHaveBeenCalled();
    });

    it('debe lanzar error si maxCapacity es inválido', async () => {
        vi.mocked(mockSportValidator.validateMaxCapacity).mockImplementationOnce(() => {
            throw new Error('La capacidad máxima debe ser un número entero positivo');
        });

        await expect(useCase.execute(validRequest)).rejects.toThrow('La capacidad máxima debe ser un número entero positivo');
        expect(mockSportRepo.create).not.toHaveBeenCalled();
    });

    it('debe lanzar error si el nombre está vacío', async () => {
        vi.mocked(mockSportValidator.validateName).mockImplementationOnce(() => {
            throw new Error('El nombre es requerido');
        });

        await expect(useCase.execute(validRequest)).rejects.toThrow('El nombre es requerido');
        expect(mockSportRepo.create).not.toHaveBeenCalled();
    });

    it('debe convertir description undefined a null al crear', async () => {
        const requestSinDesc: CreateSportRequest = {
            name: 'Natación',
            maxCapacity: 30,
        };
        const expectedSinDesc: SportDTO = {
            id: 'uuid-2',
            name: 'Natación',
            description: undefined,
            maxCapacity: 30,
            created_at: '2026-05-23T00:00:00.000Z',
        };

        vi.mocked(mockSportRepo.create).mockResolvedValueOnce(expectedSinDesc);

        const result = await useCase.execute(requestSinDesc);

        expect(mockSportRepo.create).toHaveBeenCalledWith({
            name: 'Natación',
            description: null,
            maxCapacity: 30,
        });
        expect(result.description).toBeUndefined();
    });
});
