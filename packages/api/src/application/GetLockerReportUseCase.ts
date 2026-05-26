import { LockerRepository } from '../domain/LockerRepository.js';
import { LockerReportResponse } from '@alentapp/shared';

export class GetLockerReportUseCase {
    constructor(private readonly lockerRepo: LockerRepository) {}

    async execute(): Promise<LockerReportResponse> {
        return this.lockerRepo.getLockerReport();
    }
}
