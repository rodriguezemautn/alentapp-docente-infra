import { DisciplineRepository } from '../domain/DisciplineRepository.js';
import { DisciplineValidator } from '../domain/services/DisciplineValidator.js';
import { DisciplineDetailDTO, UpdateDisciplineRequest } from '@alentapp/shared';
import { NotFoundError } from '../domain/errors.js';

export class UpdateDisciplineUseCase {
  constructor(
    private readonly disciplineRepo: DisciplineRepository,
    private readonly disciplineValidator: DisciplineValidator,
  ) {}

  async execute(id: string, data: UpdateDisciplineRequest): Promise<DisciplineDetailDTO> {
    const existing = await this.disciplineRepo.findById(id);
    if (!existing) {
      throw new NotFoundError('La disciplina no existe');
    }

    if (data.startDate !== undefined || data.endDate !== undefined) {
      const effectiveStartDate = data.startDate ?? existing.startDate;
      const effectiveEndDate = data.endDate ?? existing.endDate;
      this.disciplineValidator.validateEndDate(effectiveEndDate, effectiveStartDate);
    }

    return this.disciplineRepo.update(id, data);
  }
}
