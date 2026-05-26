import { LockerRepository } from '../domain/LockerRepository.js';
import { LockerValidator } from '../domain/services/LockerValidator.js';

export class DeleteLockerUseCase {
    constructor(
        private readonly lockerRepo: LockerRepository,
        private readonly lockerValidator: LockerValidator,
    ) {}

    async execute(id: string): Promise<void> {
        const existing = await this.lockerRepo.findById(id);
        if (!existing) {
            throw new Error('El casillero no existe');
        }

        this.lockerValidator.validateStatusForDeletion(existing.status);
        await this.lockerRepo.delete(id);
    }
}
