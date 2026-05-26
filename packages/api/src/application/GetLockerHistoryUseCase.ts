import { LockerAssignmentLogRepository } from '../domain/LockerRepository.js';
import { LockerAssignmentLogDTO } from '@alentapp/shared';

interface HistoryFilters {
  lockerId?: string;
  memberId?: string;
}

export class GetLockerHistoryUseCase {
    constructor(private readonly logRepo: LockerAssignmentLogRepository) {}

    async execute(filters: HistoryFilters): Promise<LockerAssignmentLogDTO[]> {
        if (filters.lockerId) {
            return this.logRepo.findByLocker(filters.lockerId);
        }
        if (filters.memberId) {
            return this.logRepo.findByMember(filters.memberId);
        }
        return [];
    }
}
