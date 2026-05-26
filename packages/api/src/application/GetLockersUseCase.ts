import { LockerRepository } from '../domain/LockerRepository.js';
import { LockerDetailDTO } from '@alentapp/shared';

export class GetLockersUseCase {
    constructor(private readonly lockerRepo: LockerRepository) {}

    async execute(status?: string): Promise<LockerDetailDTO[]> {
        return this.lockerRepo.findAll(status);
    }
}
