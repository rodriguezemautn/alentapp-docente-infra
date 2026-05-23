import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { DisciplineValidator } from '../domain/services/DisciplineValidator.js';
import { DisciplineDetailDTO, CreateDisciplineRequest } from '@alentapp/shared';

export class CreateDisciplineUseCase {
  constructor(
    private readonly disciplineRepo: DisciplineRepository,
    private readonly disciplineValidator: DisciplineValidator,
  ) {}

  async execute(data: CreateDisciplineRequest): Promise<DisciplineDetailDTO> {
    this.disciplineValidator.validateEndDate(data.endDate, data.startDate);
    await this.disciplineValidator.validateSportExists(data.sportId);

    return this.disciplineRepo.create(data);
  }
}
