import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CancelPaymentUseCase } from './CancelPaymentUseCase.js';
import { PaymentRepository } from '../domain/PaymentRepository.js';
import { PaymentValidator } from '../domain/services/PaymentValidator.js';
import { PaymentDetailDTO, PaymentDTO } from '@alentapp/shared';
import { NotFoundError, ConflictError } from '../domain/errors.js';

describe('CancelPaymentUseCase', () => {
    const mockPaymentRepo = {
        findById: vi.fn(),
        update: vi.fn(),
        create: vi.fn(),
        findAll: vi.fn(),
    } as unknown as PaymentRepository;

    const mockValidator = {
        validateCancel: vi.fn(),
        validateAmount: vi.fn(),
        validatePaymentType: vi.fn(),
        validateDateRange: vi.fn(),
    } as unknown as PaymentValidator;

    const useCase = new CancelPaymentUseCase(mockPaymentRepo, mockValidator);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const existingPayment: PaymentDetailDTO = {
        id: 'payment-uuid-1',
        memberId: 'member-uuid-1',
        amount: 150.0,
        paymentDate: '2026-05-23T00:00:00.000Z',
        paymentType: 'Cuota',
        status: 'Completed',
        created_at: '2026-05-23T00:00:00.000Z',
        memberName: 'Juan Pérez',
    };

    const canceledPaymentDTO: PaymentDTO = {
        id: 'payment-uuid-1',
        memberId: 'member-uuid-1',
        amount: 150.0,
        paymentDate: '2026-05-23T00:00:00.000Z',
        paymentType: 'Cuota',
        status: 'Canceled',
        created_at: '2026-05-23T00:00:00.000Z',
    };

    it('debe cancelar un pago exitosamente', async () => {
        vi.mocked(mockPaymentRepo.findById).mockResolvedValueOnce(existingPayment);
        vi.mocked(mockPaymentRepo.update).mockResolvedValueOnce(canceledPaymentDTO);

        const result = await useCase.execute('payment-uuid-1');

        expect(mockPaymentRepo.findById).toHaveBeenCalledWith('payment-uuid-1');
        expect(mockValidator.validateCancel).toHaveBeenCalledWith(existingPayment);
        expect(mockPaymentRepo.update).toHaveBeenCalledWith('payment-uuid-1', { status: 'Canceled' });
        expect(result).toEqual(canceledPaymentDTO);
        expect(result.status).toBe('Canceled');
    });

    it('debe lanzar NotFoundError si el pago no existe', async () => {
        vi.mocked(mockPaymentRepo.findById).mockResolvedValueOnce(null);
        vi.mocked(mockValidator.validateCancel).mockImplementationOnce(() => {
            throw new NotFoundError('Pago no encontrado');
        });

        await expect(useCase.execute('non-existent-id')).rejects.toThrow(NotFoundError);
        expect(mockPaymentRepo.findById).toHaveBeenCalledWith('non-existent-id');
        expect(mockValidator.validateCancel).toHaveBeenCalledWith(null);
        expect(mockPaymentRepo.update).not.toHaveBeenCalled();
    });

    it('debe lanzar ConflictError si el pago ya está cancelado', async () => {
        const canceledPayment: PaymentDetailDTO = {
            ...existingPayment,
            status: 'Canceled',
        };
        vi.mocked(mockPaymentRepo.findById).mockResolvedValueOnce(canceledPayment);
        vi.mocked(mockValidator.validateCancel).mockImplementationOnce(() => {
            throw new ConflictError('El pago ya está cancelado');
        });

        await expect(useCase.execute('payment-uuid-1')).rejects.toThrow(ConflictError);
        expect(mockPaymentRepo.findById).toHaveBeenCalledWith('payment-uuid-1');
        expect(mockValidator.validateCancel).toHaveBeenCalledWith(canceledPayment);
        expect(mockPaymentRepo.update).not.toHaveBeenCalled();
    });
});
