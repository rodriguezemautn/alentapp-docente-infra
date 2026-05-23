import { SportDTO, SportDetailDTO, CreateSportRequest, UpdateSportRequest } from '@alentapp/shared';

export interface SportRepository {
  create(data: CreateSportRequest): Promise<SportDTO>;
  findById(id: string): Promise<SportDTO | null>;
  findByName(name: string): Promise<SportDTO | null>;
  findAll(): Promise<SportDetailDTO[]>;
  update(id: string, data: UpdateSportRequest): Promise<SportDTO>;
  delete(id: string): Promise<void>;
  countDisciplines(sportId: string): Promise<number>;
}
