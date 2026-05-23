import { SportRepository } from '../SportRepository.js';

export class SportValidator {
    constructor(private readonly sportRepo: SportRepository) {}

    validateName(name: string): void {
        if (!name || name.trim().length === 0) {
            throw new Error('El nombre es requerido');
        }
        if (name.length > 100) {
            throw new Error('El nombre no puede superar los 100 caracteres');
        }
    }

    validateDescription(description?: string): void {
        if (description && description.length > 500) {
            throw new Error('La descripción no puede superar los 500 caracteres');
        }
    }

    validateMaxCapacity(maxCapacity: number): void {
        if (maxCapacity === undefined || maxCapacity === null) {
            throw new Error('La capacidad máxima es requerida');
        }
        if (!Number.isInteger(maxCapacity) || maxCapacity <= 0) {
            throw new Error('La capacidad máxima debe ser un número entero positivo');
        }
    }

    async validateNameIsUnique(name: string, excludeSportId?: string): Promise<void> {
        const existing = await this.sportRepo.findByName(name);
        if (existing && existing.id !== excludeSportId) {
            throw new Error('Ya existe un deporte con ese nombre');
        }
    }

    validateNameNotInPayload(data: Record<string, unknown>): void {
        if ('name' in data && data.name !== undefined) {
            throw new Error('No se puede modificar el nombre del deporte');
        }
    }
}
