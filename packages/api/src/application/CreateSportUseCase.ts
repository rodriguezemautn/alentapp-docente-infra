import { SportRepository } from '../domain/SportRepository.js';
import { SportValidator } from '../domain/services/SportValidator.js';
import { SportDTO, CreateSportRequest } from '@alentapp/shared';

export class CreateSportUseCase {
    constructor(
        private readonly sportRepo: SportRepository,
        private readonly sportValidator: SportValidator
    ) {}

    async execute(data: CreateSportRequest): Promise<SportDTO> {
        this.sportValidator.validateName(data.name);
        this.sportValidator.validateDescription(data.description);
        this.sportValidator.validateMaxCapacity(data.maxCapacity);
        await this.sportValidator.validateNameIsUnique(data.name);

        return this.sportRepo.create({
            ...data,
            description: data.description || null,
        });
    }
}
