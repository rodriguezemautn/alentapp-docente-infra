import { SportRepository } from '../domain/SportRepository.js';
import { SportValidator } from '../domain/services/SportValidator.js';
import { SportDTO, UpdateSportRequest } from '@alentapp/shared';

export class UpdateSportUseCase {
    constructor(
        private readonly sportRepo: SportRepository,
        private readonly sportValidator: SportValidator
    ) {}

    async execute(id: string, data: UpdateSportRequest): Promise<SportDTO> {
        const existing = await this.sportRepo.findById(id);
        if (!existing) {
            throw new Error('El deporte no existe');
        }

        // Runtime check: name is immutable — reject if included
        this.sportValidator.validateNameNotInPayload(data as Record<string, unknown>);

        if (data.maxCapacity !== undefined) {
            this.sportValidator.validateMaxCapacity(data.maxCapacity);
        }

        if (data.description !== undefined) {
            this.sportValidator.validateDescription(data.description);
        }

        return this.sportRepo.update(id, data);
    }
}
