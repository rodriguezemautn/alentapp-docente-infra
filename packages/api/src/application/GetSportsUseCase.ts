import { SportRepository } from '../domain/SportRepository.js';
import { SportDetailDTO } from '@alentapp/shared';

export class GetSportsUseCase {
    constructor(private readonly sportRepo: SportRepository) {}

    async execute(): Promise<SportDetailDTO[]> {
        return this.sportRepo.findAll();
    }
}
