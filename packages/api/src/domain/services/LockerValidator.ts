import { LockerRepository } from '../LockerRepository.js';

export class LockerValidator {
    constructor(private readonly lockerRepo: LockerRepository) {}

    validateNumber(number: number): void {
        if (number === undefined || number === null) {
            throw new Error('El número de casillero es requerido');
        }
        if (!Number.isInteger(number) || number <= 0) {
            throw new Error('El número de casillero debe ser un entero positivo');
        }
    }

    async validateNumberIsUnique(number: number, excludeLockerId?: string): Promise<void> {
        const existing = await this.lockerRepo.findByNumber(number);
        if (existing && existing.id !== excludeLockerId) {
            throw new Error('Ya existe un casillero con ese número');
        }
    }

    validateStatusForAssignment(status: string): void {
        if (status === 'Maintenance') {
            throw new Error('No se puede asignar un casillero en mantenimiento');
        }
        if (status === 'Occupied') {
            throw new Error('El casillero ya está ocupado');
        }
    }

    validateStatusForDeletion(status: string): void {
        if (status === 'Occupied') {
            throw new Error('No se puede eliminar un casillero ocupado. Libérelo primero');
        }
        if (status === 'Maintenance') {
            throw new Error('No se puede eliminar un casillero en mantenimiento');
        }
    }
}
