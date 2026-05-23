import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CreatePaymentUseCase } from './CreatePaymentUseCase.js';
import { PaymentRepository } from '../domain/PaymentRepository.js';
import { MemberRepository } from '../domain/MemberRepository.js';
import { PaymentValidator } from '../domain/services/PaymentValidator.js';
import { CreatePaymentRequest, PaymentDTO } from '@alentapp/shared';
import { ValidationError, NotFoundError } from '../domain/errors.js';

describe('CreatePaymentUseCase', () => {
    const mockPaymentRepo = {
        create: vi.fn(),
        findById: vi.fn(),
        findAll: vi.fn(),
        update: vi.fn(),
    } as unknown as PaymentRepository;

    const mockMemberRepo = {
        findById: vi.fn(),
        create: vi.fn(),
        findByDni: vi.fn(),
        findAll: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    } as unknown as MemberRepository;

    const mockValidator = {
        validateAmount: vi.fn(),
        validatePaymentType: vi.fn(),
        validateCancel: vi.fn(),
        validateDateRange: vi.fn(),
    } as unknown as PaymentValidator;

    const useCase = new CreatePaymentUseCase(mockPaymentRepo, mockMemberRepo, mockValidator);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const validRequest: CreatePaymentRequest = {
        memberId: 'member-uuid-1',
        amount: 150.0,
        paymentType: 'Cuota',
    };

    const expectedPaymentDTO: PaymentDTO = {
        id: 'payment-uuid-1',
        memberId: 'member-uuid-1',
        amount: 150.0,
        paymentDate: '2026-05-23T00:00:00.000Z',
        paymentType: 'Cuota',
        status: 'Completed',
        created_at: '2026-05-23T00:00:00.000Z',
    };

    it('debe crear un pago exitosamente si pasa todas las validaciones', async () => {
        vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce({ id: 'member-uuid-1', name: 'Juan' } as any);
        vi.mocked(mockPaymentRepo.create).mockResolvedValueOnce(expectedPaymentDTO);

        const result = await useCase.execute(validRequest);

        expect(mockValidator.validateAmount).toHaveBeenCalledWith(150.0);
        expect(mockValidator.validatePaymentType).toHaveBeenCalledWith('Cuota');
        expect(mockMemberRepo.findById).toHaveBeenCalledWith('member-uuid-1');
        expect(mockPaymentRepo.create).toHaveBeenCalledWith(
            expect.objectContaining({
                memberId: 'member-uuid-1',
                amount: 150.0,
                paymentType: 'Cuota',
                status: 'Completed',
            }),
        );
        expect(result).toEqual(expectedPaymentDTO);
    });

    it('debe lanzar ValidationError si el monto es inválido', async () => {
        vi.mocked(mockValidator.validateAmount).mockImplementationOnce(() => {
            throw new ValidationError('El monto debe ser un número positivo');
        });

        await expect(useCase.execute(validRequest)).rejects.toThrow(ValidationError);
        expect(mockPaymentRepo.create).not.toHaveBeenCalled();
    });

    it('debe lanzar ValidationError si el tipo de pago es inválido', async () => {
        vi.mocked(mockValidator.validatePaymentType).mockImplementationOnce(() => {
            throw new ValidationError('El tipo de pago no es válido');
        });

        await expect(useCase.execute(validRequest)).rejects.toThrow(ValidationError);
        expect(mockPaymentRepo.create).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundError si el miembro no existe', async () => {
        vi.mocked(mockMemberRepo.findById).mockResolvedValueOnce(null);

        await expect(useCase.execute(validRequest)).rejects.toThrow(NotFoundError);
        expect(mockMemberRepo.findById).toHaveBeenCalledWith('member-uuid-1');
        expect(mockPaymentRepo.create).not.toHaveBeenCalled();
    });
});
