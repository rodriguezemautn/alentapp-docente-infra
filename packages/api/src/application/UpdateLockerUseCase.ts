import { LockerRepository } from '../domain/LockerRepository.js';
import { LockerValidator } from '../domain/services/LockerValidator.js';
import { LockerDTO, UpdateLockerRequest } from '@alentapp/shared';

export class UpdateLockerUseCase {
    constructor(
        private readonly lockerRepo: LockerRepository,
        private readonly lockerValidator: LockerValidator,
        private readonly logRepo?: LockerRepository['constructor'] extends never ? never : any,
    ) {}

    async execute(id: string, data: UpdateLockerRequest): Promise<LockerDTO> {
        const existing = await this.lockerRepo.findById(id);
        if (!existing) {
            throw new Error('El casillero no existe');
        }

        if (data.number !== undefined) {
            this.lockerValidator.validateNumber(data.number);
            await this.lockerValidator.validateNumberIsUnique(data.number, id);
        }

        if (data.memberId !== undefined && data.memberId !== null) {
            this.lockerValidator.validateStatusForAssignment(existing.status);
        }

        return this.lockerRepo.update(id, data);
    }
}
