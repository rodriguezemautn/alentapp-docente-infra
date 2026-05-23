import { DisciplineRepository, DisciplineFilters } from '../domain/DisciplineRepository.js';
import { DisciplineDetailDTO } from '@alentapp/shared';

export class GetDisciplinesUseCase {
  constructor(private readonly disciplineRepo: DisciplineRepository) {}

  async execute(filters?: DisciplineFilters): Promise<DisciplineDetailDTO[]> {
    return this.disciplineRepo.findAll(filters);
  }
}
