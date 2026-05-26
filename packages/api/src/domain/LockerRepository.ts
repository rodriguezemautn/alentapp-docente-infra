import { LockerDTO, LockerDetailDTO, CreateLockerRequest, UpdateLockerRequest, LockerAssignmentLogDTO } from '@alentapp/shared';

export interface LockerRepository {
  create(data: CreateLockerRequest): Promise<LockerDTO>;
  findById(id: string): Promise<LockerDetailDTO | null>;
  findByNumber(number: number): Promise<LockerDTO | null>;
  findAll(status?: string): Promise<LockerDetailDTO[]>;
  update(id: string, data: UpdateLockerRequest): Promise<LockerDTO>;
  delete(id: string): Promise<void>;
}

export interface LockerAssignmentLogRepository {
  create(event: {
    lockerId: string;
    memberId: string;
    eventType: 'Assignment' | 'Release';
    assignedAt: Date;
    releasedAt?: Date;
  }): Promise<void>;
  findByLocker(lockerId: string): Promise<LockerAssignmentLogDTO[]>;
  findByMember(memberId: string): Promise<LockerAssignmentLogDTO[]>;
}
