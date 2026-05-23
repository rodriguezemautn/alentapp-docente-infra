import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GetPaymentsUseCase } from './GetPaymentsUseCase.js';
import { PaymentRepository } from '../domain/PaymentRepository.js';
import { PaymentValidator } from '../domain/services/PaymentValidator.js';
import { PaymentFilters, PaginatedResponse, PaymentDTO } from '@alentapp/shared';
import { ValidationError } from '../domain/errors.js';

describe('GetPaymentsUseCase', () => {
    const mockPaymentRepo = {
        findAll: vi.fn(),
        create: vi.fn(),
        findById: vi.fn(),
        update: vi.fn(),
    } as unknown as PaymentRepository;

    const mockValidator = {
        validateDateRange: vi.fn(),
        validateAmount: vi.fn(),
        validatePaymentType: vi.fn(),
        validateCancel: vi.fn(),
    } as unknown as PaymentValidator;

    const useCase = new GetPaymentsUseCase(mockPaymentRepo, mockValidator);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockPaymentDTO: PaymentDTO = {
        id: 'payment-uuid-1',
        memberId: 'member-uuid-1',
        amount: 150.0,
        paymentDate: '2026-05-23T00:00:00.000Z',
        paymentType: 'Cuota',
        status: 'Completed',
        created_at: '2026-05-23T00:00:00.000Z',
    };

    it('debe retornar pagos sin filtros', async () => {
        const mockResponse: PaginatedResponse<PaymentDTO> = {
            data: [mockPaymentDTO],
            total: 1,
            page: 1,
            limit: 10,
        };
        vi.mocked(mockPaymentRepo.findAll).mockResolvedValueOnce(mockResponse);

        const result = await useCase.execute({});

        expect(mockValidator.validateDateRange).toHaveBeenCalledWith(undefined, undefined);
        expect(mockPaymentRepo.findAll).toHaveBeenCalledWith({});
        expect(result).toEqual(mockResponse);
        expect(result.data).toHaveLength(1);
    });

    it('debe retornar pagos con filtros', async () => {
        const filters: PaymentFilters = {
            memberId: 'member-uuid-1',
            paymentType: 'Cuota',
            status: 'Completed',
            from: '2026-01-01',
            to: '2026-12-31',
            page: 1,
            limit: 5,
        };
        const mockResponse: PaginatedResponse<PaymentDTO> = {
            data: [mockPaymentDTO],
            total: 1,
            page: 1,
            limit: 5,
        };
        vi.mocked(mockPaymentRepo.findAll).mockResolvedValueOnce(mockResponse);

        const result = await useCase.execute(filters);

        expect(mockValidator.validateDateRange).toHaveBeenCalledWith('2026-01-01', '2026-12-31');
        expect(mockPaymentRepo.findAll).toHaveBeenCalledWith(filters);
        expect(result).toEqual(mockResponse);
    });

    it('debe retornar lista vacía si no hay pagos', async () => {
        const mockEmptyResponse: PaginatedResponse<PaymentDTO> = {
            data: [],
            total: 0,
            page: 1,
            limit: 10,
        };
        vi.mocked(mockPaymentRepo.findAll).mockResolvedValueOnce(mockEmptyResponse);

        const result = await useCase.execute({});

        expect(mockPaymentRepo.findAll).toHaveBeenCalledWith({});
        expect(result).toEqual(mockEmptyResponse);
        expect(result.data).toHaveLength(0);
        expect(result.total).toBe(0);
    });

    it('debe lanzar ValidationError si el rango de fechas es inválido', async () => {
        vi.mocked(mockValidator.validateDateRange).mockImplementationOnce(() => {
            throw new ValidationError('La fecha "desde" no puede ser posterior a la fecha "hasta"');
        });

        const filters: PaymentFilters = {
            from: '2026-12-31',
            to: '2026-01-01',
        };

        await expect(useCase.execute(filters)).rejects.toThrow(ValidationError);
        expect(mockPaymentRepo.findAll).not.toHaveBeenCalled();
    });
});
