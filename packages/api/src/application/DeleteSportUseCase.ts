import { SportRepository } from '../domain/SportRepository.js';

export class DeleteSportUseCase {
    constructor(private readonly sportRepo: SportRepository) {}

    async execute(id: string): Promise<void> {
        const existing = await this.sportRepo.findById(id);
        if (!existing) {
            throw new Error('El deporte no existe');
        }

        const disciplineCount = await this.sportRepo.countDisciplines(id);
        if (disciplineCount > 0) {
            throw new Error(
                'No se puede eliminar un deporte con disciplinas asociadas. Elimine las disciplinas primero'
            );
        }

        await this.sportRepo.delete(id);
    }
}
