import { DisciplineDetailDTO, CreateDisciplineRequest, UpdateDisciplineRequest } from '@alentapp/shared';

export interface DisciplineFilters {
  sportId?: string;
}

export interface DisciplineRepository {
  create(data: CreateDisciplineRequest): Promise<DisciplineDetailDTO>;
  findById(id: string): Promise<DisciplineDetailDTO | null>;
  findAll(filters?: DisciplineFilters): Promise<DisciplineDetailDTO[]>;
  update(id: string, data: UpdateDisciplineRequest): Promise<DisciplineDetailDTO>;
  delete(id: string): Promise<void>;
}
