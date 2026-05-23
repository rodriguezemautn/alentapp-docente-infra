import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { NotFoundError } from '../domain/errors.js';

export class DeleteDisciplineUseCase {
  constructor(private readonly disciplineRepo: DisciplineRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.disciplineRepo.findById(id);
    if (!existing) {
      throw new NotFoundError('La disciplina no existe');
    }

    await this.disciplineRepo.delete(id);
  }
}
