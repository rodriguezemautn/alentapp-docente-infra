import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MedicalCertificateController } from './MedicalCertificateController.js';

describe('MedicalCertificateController', () => {
    const mockCreateUseCase = { execute: vi.fn() };
    const mockGetActiveUseCase = { execute: vi.fn() };

    const controller = new MedicalCertificateController(
        mockCreateUseCase as any,
        mockGetActiveUseCase as any,
    );

    const mockReply = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
    };

    const mockCreateRequest = {
        body: {
            memberId: 'member-uuid-1',
            expirationDate: '2026-12-31',
            description: 'Certificado anual',
            doctorName: 'Dr. Pérez',
        },
    };

    const mockGetActiveRequest = {
        params: { memberId: 'member-uuid-1' },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('create', () => {
        it('debe devolver status 201 y los datos si la creación es exitosa', async () => {
            const mockCertificate = {
                id: 'mc-uuid-1',
                memberId: 'member-uuid-1',
                issueDate: '2026-05-23T00:00:00.000Z',
                expirationDate: '2026-12-31T00:00:00.000Z',
                isActive: true,
                description: 'Certificado anual',
                doctorName: 'Dr. Pérez',
                created_at: '2026-05-23T00:00:00.000Z',
            };
            mockCreateUseCase.execute.mockResolvedValueOnce(mockCertificate);

            await controller.create(mockCreateRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith({ data: mockCertificate });
        });

        it('debe devolver status 400 si la fecha de vencimiento es inválida', async () => {
            mockCreateUseCase.execute.mockRejectedValueOnce(
                new (class extends Error {
                    constructor() {
                        super('La fecha de vencimiento no puede ser anterior a la fecha de emisión');
                        this.name = 'ValidationError';
                    }
                })(),
            );

            await controller.create(mockCreateRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({
                error: 'La fecha de vencimiento no puede ser anterior a la fecha de emisión',
            });
        });

        it('debe devolver status 404 si el miembro no existe', async () => {
            mockCreateUseCase.execute.mockRejectedValueOnce(
                new (class extends Error {
                    constructor() {
                        super('Miembro no encontrado');
                        this.name = 'NotFoundError';
                    }
                })(),
            );

            await controller.create(mockCreateRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Miembro no encontrado' });
        });

        it('debe devolver status 500 para cualquier otro error', async () => {
            mockCreateUseCase.execute.mockRejectedValueOnce(new Error('Error de conexión de Prisma'));

            await controller.create(mockCreateRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({
                error: 'Error interno, reintente más tarde',
            });
        });
    });

    describe('getActive', () => {
        it('debe devolver status 200 con el certificado activo', async () => {
            const mockCertificate = {
                id: 'mc-uuid-1',
                memberId: 'member-uuid-1',
                issueDate: '2026-05-23T00:00:00.000Z',
                expirationDate: '2026-12-31T00:00:00.000Z',
                isActive: true,
                description: 'Certificado anual',
                doctorName: 'Dr. Pérez',
                created_at: '2026-05-23T00:00:00.000Z',
            };
            mockGetActiveUseCase.execute.mockResolvedValueOnce(mockCertificate);

            await controller.getActive(mockGetActiveRequest as any, mockReply as any);

            expect(mockGetActiveUseCase.execute).toHaveBeenCalledWith('member-uuid-1');
            expect(mockReply.status).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith({ data: mockCertificate });
        });

        it('debe devolver status 404 si no hay certificado activo', async () => {
            mockGetActiveUseCase.execute.mockRejectedValueOnce(
                new (class extends Error {
                    constructor() {
                        super('No se encontró un certificado médico activo para el miembro');
                        this.name = 'NotFoundError';
                    }
                })(),
            );

            await controller.getActive(mockGetActiveRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({
                error: 'No se encontró un certificado médico activo para el miembro',
            });
        });

        it('debe devolver status 500 ante un error genérico', async () => {
            mockGetActiveUseCase.execute.mockRejectedValueOnce(new Error('Generic failure'));

            await controller.getActive(mockGetActiveRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({
                error: 'Error interno, reintente más tarde',
            });
        });
    });
});
