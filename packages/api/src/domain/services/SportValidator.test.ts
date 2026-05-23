import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SportValidator } from './SportValidator.js';
import { SportRepository } from '../SportRepository.js';

describe('SportValidator', () => {
    const mockSportRepo = {
        findByName: vi.fn(),
    } as unknown as SportRepository;

    const validator = new SportValidator(mockSportRepo);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('validateName', () => {
        it('debe pasar correctamente si el nombre es válido', () => {
            expect(() => validator.validateName('Fútbol')).not.toThrow();
            expect(() => validator.validateName('Natación')).not.toThrow();
        });

        it('debe lanzar un error si el nombre está vacío', () => {
            expect(() => validator.validateName('')).toThrow('El nombre es requerido');
            expect(() => validator.validateName('   ')).toThrow('El nombre es requerido');
        });

        it('debe lanzar un error si el nombre supera los 100 caracteres', () => {
            const longName = 'A'.repeat(101);
            expect(() => validator.validateName(longName)).toThrow('El nombre no puede superar los 100 caracteres');
        });
    });

    describe('validateDescription', () => {
        it('debe pasar correctamente si la descripción es válida', () => {
            expect(() => validator.validateDescription('Deporte de equipo')).not.toThrow();
        });

        it('debe pasar si la descripción es null o undefined', () => {
            expect(() => validator.validateDescription(undefined)).not.toThrow();
            expect(() => validator.validateDescription()).not.toThrow();
        });

        it('debe lanzar un error si la descripción supera los 500 caracteres', () => {
            const longDescription = 'A'.repeat(501);
            expect(() => validator.validateDescription(longDescription)).toThrow('La descripción no puede superar los 500 caracteres');
        });
    });

    describe('validateMaxCapacity', () => {
        it('debe pasar correctamente si la capacidad es un entero positivo', () => {
            expect(() => validator.validateMaxCapacity(22)).not.toThrow();
            expect(() => validator.validateMaxCapacity(1)).not.toThrow();
            expect(() => validator.validateMaxCapacity(100)).not.toThrow();
        });

        it('debe lanzar un error si la capacidad es 0', () => {
            expect(() => validator.validateMaxCapacity(0)).toThrow('La capacidad máxima debe ser un número entero positivo');
        });

        it('debe lanzar un error si la capacidad es negativa', () => {
            expect(() => validator.validateMaxCapacity(-1)).toThrow('La capacidad máxima debe ser un número entero positivo');
        });

        it('debe lanzar un error si la capacidad es un número decimal', () => {
            expect(() => validator.validateMaxCapacity(1.5)).toThrow('La capacidad máxima debe ser un número entero positivo');
        });

        it('debe lanzar un error si la capacidad es null o undefined', () => {
            expect(() => validator.validateMaxCapacity(undefined as unknown as number)).toThrow('La capacidad máxima es requerida');
            expect(() => validator.validateMaxCapacity(null as unknown as number)).toThrow('La capacidad máxima es requerida');
        });
    });

    describe('validateNameIsUnique', () => {
        it('debe pasar si el nombre no existe en la base de datos', async () => {
            vi.mocked(mockSportRepo.findByName).mockResolvedValueOnce(null);

            await expect(validator.validateNameIsUnique('Fútbol')).resolves.not.toThrow();
            expect(mockSportRepo.findByName).toHaveBeenCalledWith('Fútbol');
        });

        it('debe pasar si el nombre existe pero pertenece al mismo deporte (caso de edición)', async () => {
            vi.mocked(mockSportRepo.findByName).mockResolvedValueOnce({ id: 'deporte-1', name: 'Fútbol' } as any);

            await expect(validator.validateNameIsUnique('Fútbol', 'deporte-1')).resolves.not.toThrow();
        });

        it('debe lanzar error si el nombre existe y pertenece a otro deporte diferente', async () => {
            vi.mocked(mockSportRepo.findByName).mockResolvedValueOnce({ id: 'deporte-2', name: 'Fútbol' } as any);

            await expect(validator.validateNameIsUnique('Fútbol', 'deporte-1')).rejects.toThrow('Ya existe un deporte con ese nombre');
        });
    });

    describe('validateNameNotInPayload', () => {
        it('debe pasar si el payload no incluye name', () => {
            expect(() => validator.validateNameNotInPayload({ description: 'test' })).not.toThrow();
            expect(() => validator.validateNameNotInPayload({ maxCapacity: 10 })).not.toThrow();
            expect(() => validator.validateNameNotInPayload({})).not.toThrow();
        });

        it('debe lanzar error si el payload incluye name', () => {
            expect(() => validator.validateNameNotInPayload({ name: 'Nuevo nombre' })).toThrow('No se puede modificar el nombre del deporte');
            expect(() => validator.validateNameNotInPayload({ name: '', description: 'test' })).toThrow('No se puede modificar el nombre del deporte');
        });
    });
});
