import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentController } from './PaymentController.js';

describe('PaymentController', () => {
    // 1. Mocks de los Casos de Uso
    const mockCreateUseCase = { execute: vi.fn() };
    const mockGetAllUseCase = { execute: vi.fn() };
    const mockGetByIdUseCase = { execute: vi.fn() };
    const mockCancelUseCase = { execute: vi.fn() };

    const controller = new PaymentController(
        mockCreateUseCase as any,
        mockGetAllUseCase as any,
        mockGetByIdUseCase as any,
        mockCancelUseCase as any
    );

    // 2. Mocks de Fastify Request y Reply
    const mockReply = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn()
    };

    const mockRequestCreate = {
        body: {
            memberId: 'member-uuid-1',
            amount: 150.0,
            paymentType: 'Cuota' as const,
        }
    };

    const mockRequestId = {
        params: { id: 'payment-uuid-1' }
    };

    const mockRequestQuery = {
        query: {}
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('create', () => {
        it('debe devolver status 201 y los datos si la creación es exitosa', async () => {
            const mockPayment = {
                id: 'payment-uuid-1',
                memberId: 'member-uuid-1',
                amount: 150.0,
                paymentDate: '2026-05-23T00:00:00.000Z',
                paymentType: 'Cuota',
                status: 'Completed',
                created_at: '2026-05-23T00:00:00.000Z',
            };
            mockCreateUseCase.execute.mockResolvedValueOnce(mockPayment);

            await controller.create(mockRequestCreate as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith({ data: mockPayment });
        });

        it('debe devolver status 400 si el monto es inválido', async () => {
            mockCreateUseCase.execute.mockRejectedValueOnce(
                new (class extends Error {
                    constructor() { super('El monto debe ser un número positivo'); this.name = 'ValidationError'; }
                })()
            );

            await controller.create(mockRequestCreate as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'El monto debe ser un número positivo' });
        });

        it('debe devolver status 400 si el tipo de pago es inválido', async () => {
            mockCreateUseCase.execute.mockRejectedValueOnce(
                new (class extends Error {
                    constructor() { super('El tipo de pago no es válido'); this.name = 'ValidationError'; }
                })()
            );

            await controller.create(mockRequestCreate as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'El tipo de pago no es válido' });
        });

        it('debe devolver status 404 si el miembro no existe', async () => {
            mockCreateUseCase.execute.mockRejectedValueOnce(
                new (class extends Error {
                    constructor() { super('Miembro no encontrado'); this.name = 'NotFoundError'; }
                })()
            );

            await controller.create(mockRequestCreate as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Miembro no encontrado' });
        });

        it('debe devolver status 500 para cualquier otro error', async () => {
            mockCreateUseCase.execute.mockRejectedValueOnce(new Error('Error de conexion de Prisma...'));

            await controller.create(mockRequestCreate as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Error interno, reintente más tarde' });
        });
    });

    describe('getAll', () => {
        it('debe devolver status 200 y la lista paginada de pagos', async () => {
            const mockPaginated = {
                data: [
                    { id: '1', memberId: 'm1', amount: 100, paymentDate: '2026-01-01', paymentType: 'Cuota', status: 'Completed', created_at: '2026-01-01' },
                ],
                total: 1,
                page: 1,
                limit: 10,
            };
            mockGetAllUseCase.execute.mockResolvedValueOnce(mockPaginated);

            await controller.getAll(mockRequestQuery as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith(mockPaginated);
        });

        it('debe devolver status 400 si las fechas son inválidas', async () => {
            mockGetAllUseCase.execute.mockRejectedValueOnce(
                new (class extends Error {
                    constructor() { super('La fecha "desde" no puede ser posterior a la fecha "hasta"'); this.name = 'ValidationError'; }
                })()
            );

            await controller.getAll(mockRequestQuery as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'La fecha "desde" no puede ser posterior a la fecha "hasta"' });
        });

        it('debe devolver status 500 si falla el caso de uso', async () => {
            mockGetAllUseCase.execute.mockRejectedValueOnce(new Error('DB Falló'));

            await controller.getAll(mockRequestQuery as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'DB Falló' });
        });
    });

    describe('getById', () => {
        it('debe devolver status 200 con el detalle del pago', async () => {
            const mockDetail = {
                id: 'payment-uuid-1',
                memberId: 'member-uuid-1',
                amount: 150.0,
                paymentDate: '2026-05-23T00:00:00.000Z',
                paymentType: 'Cuota',
                status: 'Completed',
                created_at: '2026-05-23T00:00:00.000Z',
                memberName: 'Juan Pérez',
            };
            mockGetByIdUseCase.execute.mockResolvedValueOnce(mockDetail);

            await controller.getById(mockRequestId as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith({ data: mockDetail });
        });

        it('debe devolver status 404 si el pago no existe', async () => {
            mockGetByIdUseCase.execute.mockRejectedValueOnce(
                new (class extends Error {
                    constructor() { super('Pago no encontrado'); this.name = 'NotFoundError'; }
                })()
            );

            await controller.getById(mockRequestId as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Pago no encontrado' });
        });

        it('debe devolver status 500 ante un error genérico', async () => {
            mockGetByIdUseCase.execute.mockRejectedValueOnce(new Error('Generic failure'));

            await controller.getById(mockRequestId as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Error interno, reintente más tarde' });
        });
    });

    describe('cancel', () => {
        it('debe devolver status 200 con el pago cancelado', async () => {
            const mockCanceled = {
                id: 'payment-uuid-1',
                memberId: 'member-uuid-1',
                amount: 150.0,
                paymentDate: '2026-05-23T00:00:00.000Z',
                paymentType: 'Cuota',
                status: 'Canceled',
                created_at: '2026-05-23T00:00:00.000Z',
            };
            mockCancelUseCase.execute.mockResolvedValueOnce(mockCanceled);

            await controller.cancel(mockRequestId as any, mockReply as any);

            expect(mockCancelUseCase.execute).toHaveBeenCalledWith('payment-uuid-1');
            expect(mockReply.status).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith({ data: mockCanceled });
        });

        it('debe devolver status 404 si el pago no existe', async () => {
            mockCancelUseCase.execute.mockRejectedValueOnce(
                new (class extends Error {
                    constructor() { super('Pago no encontrado'); this.name = 'NotFoundError'; }
                })()
            );

            await controller.cancel(mockRequestId as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Pago no encontrado' });
        });

        it('debe devolver status 409 si el pago ya está cancelado', async () => {
            mockCancelUseCase.execute.mockRejectedValueOnce(
                new (class extends Error {
                    constructor() { super('El pago ya está cancelado'); this.name = 'ConflictError'; }
                })()
            );

            await controller.cancel(mockRequestId as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(409);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'El pago ya está cancelado' });
        });

        it('debe devolver status 500 ante un error genérico', async () => {
            mockCancelUseCase.execute.mockRejectedValueOnce(new Error('Generic failure'));

            await controller.cancel(mockRequestId as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Error interno, reintente más tarde' });
        });
    });
});
