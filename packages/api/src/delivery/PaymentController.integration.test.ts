import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { PaymentValidator } from '../domain/services/PaymentValidator.js';
import { CreatePaymentUseCase } from '../application/CreatePaymentUseCase.js';
import { GetPaymentsUseCase } from '../application/GetPaymentsUseCase.js';
import { GetPaymentByIdUseCase } from '../application/GetPaymentByIdUseCase.js';
import { CancelPaymentUseCase } from '../application/CancelPaymentUseCase.js';
import { PaymentController } from './PaymentController.js';

// Mockeamos el repositorio para que la API entera funcione sin conectarse a la Base de Datos real
vi.mock('../infrastructure/PostgresPaymentRepository.js', () => {
    // Estado interno del mock para simular la base de datos
    const paymentsStore: Record<string, any> = {};
    let nextId = 1;

    return {
        PostgresPaymentRepository: class {
            async create(data: any) {
                const id = String(nextId++);
                const now = new Date().toISOString();
                const newPayment = {
                    id,
                    memberId: data.memberId,
                    amount: data.amount,
                    paymentDate: data.paymentDate || now,
                    paymentType: data.paymentType,
                    status: data.status || 'Completed',
                    created_at: now,
                };
                paymentsStore[id] = newPayment;
                return {
                    id: newPayment.id,
                    memberId: newPayment.memberId,
                    amount: newPayment.amount,
                    paymentDate: newPayment.paymentDate,
                    paymentType: newPayment.paymentType,
                    status: newPayment.status,
                    created_at: newPayment.created_at,
                };
            }

            async findById(id: string) {
                const payment = paymentsStore[id];
                if (!payment) return null;
                return {
                    ...payment,
                    memberName: 'Juan Pérez',
                };
            }

            async findAll(filters: any) {
                let data = Object.values(paymentsStore);
                if (filters.memberId) {
                    data = data.filter((p: any) => p.memberId === filters.memberId);
                }
                if (filters.paymentType) {
                    data = data.filter((p: any) => p.paymentType === filters.paymentType);
                }
                if (filters.status) {
                    data = data.filter((p: any) => p.status === filters.status);
                }
                const total = data.length;
                const page = filters.page || 1;
                const limit = filters.limit || 10;
                const skip = (page - 1) * limit;
                data = data.slice(skip, skip + limit);
                return {
                    data: data.map((p: any) => ({
                        id: p.id,
                        memberId: p.memberId,
                        amount: p.amount,
                        paymentDate: p.paymentDate,
                        paymentType: p.paymentType,
                        status: p.status,
                        created_at: p.created_at,
                    })),
                    total,
                    page,
                    limit,
                };
            }

            async update(id: string, data: any) {
                const existing = paymentsStore[id];
                if (!existing) {
                    throw new Error('Pago no encontrado');
                }
                if (data.status !== undefined) {
                    existing.status = data.status;
                }
                return {
                    id: existing.id,
                    memberId: existing.memberId,
                    amount: existing.amount,
                    paymentDate: existing.paymentDate,
                    paymentType: existing.paymentType,
                    status: existing.status,
                    created_at: existing.created_at,
                };
            }
        }
    };
});

// Mockeamos MemberRepository para CreatePaymentUseCase
vi.mock('../infrastructure/PostgresMemberRepository.js', () => {
    const membersStore: Record<string, any> = {
        'member-uuid-1': { id: 'member-uuid-1', name: 'Juan Pérez', dni: '12345678', email: 'juan@test.com', category: 'Pleno', status: 'Activo', created_at: '2026-01-01' },
    };

    return {
        PostgresMemberRepository: class {
            async findById(id: string) {
                return membersStore[id] || null;
            }
            async findByDni() { return null; }
            async findAll() { return Object.values(membersStore); }
            async create(data: any) { return data; }
            async update(id: string, data: any) { return data; }
            async delete(_id: string) { }
        }
    };
});

describe('Payment API Integration Tests', () => {
    let app: FastifyInstance;
    let paymentController: PaymentController;

    beforeAll(async () => {
        app = Fastify();

        const { PostgresPaymentRepository } = await import('../infrastructure/PostgresPaymentRepository.js');
        const { PostgresMemberRepository } = await import('../infrastructure/PostgresMemberRepository.js');
        const paymentRepo = new PostgresPaymentRepository();
        const memberRepo = new PostgresMemberRepository();
        const paymentValidator = new PaymentValidator();

        const createPaymentUseCase = new CreatePaymentUseCase(paymentRepo, memberRepo, paymentValidator);
        const getPaymentsUseCase = new GetPaymentsUseCase(paymentRepo, paymentValidator);
        const getPaymentByIdUseCase = new GetPaymentByIdUseCase(paymentRepo);
        const cancelPaymentUseCase = new CancelPaymentUseCase(paymentRepo, paymentValidator);

        paymentController = new PaymentController(
            createPaymentUseCase,
            getPaymentsUseCase,
            getPaymentByIdUseCase,
            cancelPaymentUseCase,
        );

        app.post('/api/v1/pagos', paymentController.create.bind(paymentController));
        app.get('/api/v1/pagos', paymentController.getAll.bind(paymentController));
        app.get('/api/v1/pagos/:id', paymentController.getById.bind(paymentController));
        app.put('/api/v1/pagos/:id/cancel', paymentController.cancel.bind(paymentController));

        await app.ready();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('GET /api/v1/pagos', () => {
        it('debe retornar 200 con lista vacía cuando no hay pagos', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/pagos'
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.payload);
            expect(body.data).toBeInstanceOf(Array);
            expect(body.data).toHaveLength(0);
            expect(body.total).toBe(0);
            expect(body.page).toBe(1);
            expect(body.limit).toBe(10);
        });
    });

    describe('POST /api/v1/pagos', () => {
        it('debe retornar 404 si el miembro no existe (memberId inválido)', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/pagos',
                payload: {
                    memberId: 'non-existent-member',
                    amount: 150.0,
                    paymentType: 'Cuota',
                }
            });

            expect(response.statusCode).toBe(404);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('Miembro no encontrado');
        });

        it('debe retornar 201 y crear el pago exitosamente', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/pagos',
                payload: {
                    memberId: 'member-uuid-1',
                    amount: 150.0,
                    paymentType: 'Cuota',
                }
            });

            expect(response.statusCode).toBe(201);
            const body = JSON.parse(response.payload);
            expect(body.data.memberId).toBe('member-uuid-1');
            expect(body.data.amount).toBe(150.0);
            expect(body.data.paymentType).toBe('Cuota');
            expect(body.data.status).toBe('Completed');
            expect(body.data.id).toBeDefined();
        });

        it('debe retornar 400 si amount es inválido', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/pagos',
                payload: {
                    memberId: 'member-uuid-1',
                    amount: 0,
                    paymentType: 'Cuota',
                }
            });

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('El monto debe ser un número positivo');
        });

        it('debe retornar 400 si paymentType es inválido', async () => {
            const response = await app.inject({
                method: 'POST',
                url: '/api/v1/pagos',
                payload: {
                    memberId: 'member-uuid-1',
                    amount: 150.0,
                    paymentType: 'Invalido',
                }
            });

            expect(response.statusCode).toBe(400);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('El tipo de pago no es válido');
        });
    });

    describe('GET /api/v1/pagos (con datos)', () => {
        it('debe retornar 200 con los pagos creados', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/pagos'
            });

            expect(response.statusCode).toBe(200);
            const body = JSON.parse(response.payload);
            expect(body.data).toBeInstanceOf(Array);
            expect(body.total).toBeGreaterThanOrEqual(1);
            expect(body.data[0].amount).toBe(150.0);
        });
    });

    describe('GET /api/v1/pagos/:id', () => {
        it('debe retornar 404 si el pago no existe', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/pagos/nonexistent-id'
            });

            expect(response.statusCode).toBe(404);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('Pago no encontrado');
        });
    });

    describe('PUT /api/v1/pagos/:id/cancel', () => {
        it('debe retornar 404 si el pago a cancelar no existe', async () => {
            const response = await app.inject({
                method: 'PUT',
                url: '/api/v1/pagos/nonexistent-id/cancel'
            });

            expect(response.statusCode).toBe(404);
            const body = JSON.parse(response.payload);
            expect(body.error).toBe('Pago no encontrado');
        });
    });
});
