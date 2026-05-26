import { LockerRepository } from '../domain/LockerRepository.js';
import { LockerDetailDTO } from '@alentapp/shared';

export class GetLockerByIdUseCase {
    constructor(private readonly lockerRepo: LockerRepository) {}

    async execute(id: string): Promise<LockerDetailDTO> {
        const locker = await this.lockerRepo.findById(id);
        if (!locker) {
            throw new Error('El casillero no existe');
        }
        return locker;
    }
}
