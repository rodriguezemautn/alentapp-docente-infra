import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPaymentByIdUseCase } from './GetPaymentByIdUseCase.js';
import { PaymentRepository } from '../domain/PaymentRepository.js';
import { PaymentDetailDTO } from '@alentapp/shared';
import { NotFoundError } from '../domain/errors.js';

describe('GetPaymentByIdUseCase', () => {
    const mockPaymentRepo = {
        findById: vi.fn(),
        create: vi.fn(),
        findAll: vi.fn(),
        update: vi.fn(),
    } as unknown as PaymentRepository;

    const useCase = new GetPaymentByIdUseCase(mockPaymentRepo);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('debe retornar el pago si existe', async () => {
        const mockPayment: PaymentDetailDTO = {
            id: 'payment-uuid-1',
            memberId: 'member-uuid-1',
            amount: 150.0,
            paymentDate: '2026-05-23T00:00:00.000Z',
            paymentType: 'Cuota',
            status: 'Completed',
            created_at: '2026-05-23T00:00:00.000Z',
            memberName: 'Juan Pérez',
        };
        vi.mocked(mockPaymentRepo.findById).mockResolvedValueOnce(mockPayment);

        const result = await useCase.execute('payment-uuid-1');

        expect(mockPaymentRepo.findById).toHaveBeenCalledWith('payment-uuid-1');
        expect(result).toEqual(mockPayment);
        expect(result.memberName).toBe('Juan Pérez');
    });

    it('debe lanzar NotFoundError si el pago no existe', async () => {
        vi.mocked(mockPaymentRepo.findById).mockResolvedValueOnce(null);

        await expect(useCase.execute('non-existent-id')).rejects.toThrow(NotFoundError);
        expect(mockPaymentRepo.findById).toHaveBeenCalledWith('non-existent-id');
    });
});
