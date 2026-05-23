import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UpdateSportUseCase } from './UpdateSportUseCase.js';
import { SportRepository } from '../domain/SportRepository.js';
import { SportValidator } from '../domain/services/SportValidator.js';
import { UpdateSportRequest, SportDTO } from '@alentapp/shared';

describe('UpdateSportUseCase', () => {
    const mockSportRepo = {
        findById: vi.fn(),
        update: vi.fn(),
    } as unknown as SportRepository;

    const mockSportValidator = {
        validateName: vi.fn(),
        validateDescription: vi.fn(),
        validateMaxCapacity: vi.fn(),
        validateNameIsUnique: vi.fn(),
        validateNameNotInPayload: vi.fn(),
    } as unknown as SportValidator;

    const useCase = new UpdateSportUseCase(mockSportRepo, mockSportValidator);

    const mockExistingSport: SportDTO = {
        id: 'uuid-1',
        name: 'Fútbol',
        description: 'Deporte de equipo',
        maxCapacity: 22,
        created_at: '2026-05-23T00:00:00.000Z',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(mockSportRepo.findById).mockResolvedValue(mockExistingSport);
    });

    it('debe actualizar un deporte exitosamente', async () => {
        const updateData: UpdateSportRequest = {
            description: 'Deporte actualizado',
            maxCapacity: 30,
        };
        const updatedSport: SportDTO = {
            ...mockExistingSport,
            description: 'Deporte actualizado',
            maxCapacity: 30,
        };

        vi.mocked(mockSportRepo.update).mockResolvedValueOnce(updatedSport);

        const result = await useCase.execute('uuid-1', updateData);

        expect(mockSportRepo.findById).toHaveBeenCalledWith('uuid-1');
        expect(mockSportValidator.validateNameNotInPayload).toHaveBeenCalledWith(
            expect.objectContaining({ description: 'Deporte actualizado', maxCapacity: 30 })
        );
        expect(mockSportValidator.validateMaxCapacity).toHaveBeenCalledWith(30);
        expect(mockSportValidator.validateDescription).toHaveBeenCalledWith('Deporte actualizado');
        expect(mockSportRepo.update).toHaveBeenCalledWith('uuid-1', updateData);
        expect(result).toEqual(updatedSport);
    });

    it('debe actualizar solo descripción si solo se envía descripción', async () => {
        const updateData: UpdateSportRequest = {
            description: 'Solo descripción',
        };
        const updatedSport: SportDTO = {
            ...mockExistingSport,
            description: 'Solo descripción',
        };

        vi.mocked(mockSportRepo.update).mockResolvedValueOnce(updatedSport);

        const result = await useCase.execute('uuid-1', updateData);

        expect(mockSportValidator.validateMaxCapacity).not.toHaveBeenCalled();
        expect(mockSportValidator.validateDescription).toHaveBeenCalledWith('Solo descripción');
        expect(mockSportRepo.update).toHaveBeenCalledWith('uuid-1', updateData);
        expect(result.description).toBe('Solo descripción');
    });

    it('debe actualizar solo maxCapacity si solo se envía maxCapacity', async () => {
        const updateData: UpdateSportRequest = {
            maxCapacity: 25,
        };
        const updatedSport: SportDTO = {
            ...mockExistingSport,
            maxCapacity: 25,
        };

        vi.mocked(mockSportRepo.update).mockResolvedValueOnce(updatedSport);

        const result = await useCase.execute('uuid-1', updateData);

        expect(mockSportValidator.validateMaxCapacity).toHaveBeenCalledWith(25);
        expect(mockSportValidator.validateDescription).not.toHaveBeenCalled();
        expect(mockSportRepo.update).toHaveBeenCalledWith('uuid-1', updateData);
        expect(result.maxCapacity).toBe(25);
    });

    it('debe lanzar error si el deporte no existe', async () => {
        vi.mocked(mockSportRepo.findById).mockResolvedValueOnce(null);

        await expect(useCase.execute('uuid-no-existe', { description: 'test' })).rejects.toThrow(
            'El deporte no existe'
        );
        expect(mockSportRepo.update).not.toHaveBeenCalled();
    });

    it('debe lanzar error si se intenta modificar el nombre', async () => {
        vi.mocked(mockSportValidator.validateNameNotInPayload).mockImplementationOnce(() => {
            throw new Error('No se puede modificar el nombre del deporte');
        });

        await expect(
            useCase.execute('uuid-1', { name: 'Nuevo nombre' } as unknown as UpdateSportRequest)
        ).rejects.toThrow('No se puede modificar el nombre del deporte');
        expect(mockSportRepo.update).not.toHaveBeenCalled();
    });

    it('debe lanzar error si maxCapacity es inválido', async () => {
        vi.mocked(mockSportValidator.validateMaxCapacity).mockImplementationOnce(() => {
            throw new Error('La capacidad máxima debe ser un número entero positivo');
        });

        await expect(
            useCase.execute('uuid-1', { maxCapacity: 0 })
        ).rejects.toThrow('La capacidad máxima debe ser un número entero positivo');
        expect(mockSportRepo.update).not.toHaveBeenCalled();
    });
});
