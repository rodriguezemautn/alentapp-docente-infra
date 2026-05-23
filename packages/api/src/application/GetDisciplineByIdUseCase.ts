import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { DisciplineDetailDTO } from '@alentapp/shared';
import { NotFoundError } from '../domain/errors.js';

export class GetDisciplineByIdUseCase {
  constructor(private readonly disciplineRepo: DisciplineRepository) {}

  async execute(id: string): Promise<DisciplineDetailDTO> {
    const discipline = await this.disciplineRepo.findById(id);
    if (!discipline) {
      throw new NotFoundError('La disciplina no existe');
    }
    return discipline;
  }
}
