import { MemberRepository } from '../domain/MemberRepository.js';
import { MemberReportResponse } from '@alentapp/shared';

export class GetMemberReportUseCase {
    constructor(private readonly memberRepo: MemberRepository) {}

    async execute(): Promise<MemberReportResponse> {
        return this.memberRepo.getMemberReport();
    }
}
