import { LockerRepository } from '../domain/LockerRepository.js';
import { LockerValidator } from '../domain/services/LockerValidator.js';
import { LockerDTO, CreateLockerRequest } from '@alentapp/shared';

export class CreateLockerUseCase {
    constructor(
        private readonly lockerRepo: LockerRepository,
        private readonly lockerValidator: LockerValidator,
    ) {}

    async execute(data: CreateLockerRequest): Promise<LockerDTO> {
        this.lockerValidator.validateNumber(data.number);
        await this.lockerValidator.validateNumberIsUnique(data.number);

        return this.lockerRepo.create(data);
    }
}
