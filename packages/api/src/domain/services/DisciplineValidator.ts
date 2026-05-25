import { SportRepository } from '../SportRepository.js';

export class DisciplineValidator {
  constructor(private readonly sportRepo: SportRepository) {}

  validateEndDate(endDate: string, startDate: string): void {
    if (new Date(endDate) <= new Date(startDate)) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }
  }

  async validateSportExists(sportId: string): Promise<void> {
    const sport = await this.sportRepo.findById(sportId);
    if (!sport) {
      throw new Error('El deporte no existe');
    }
  }
}
