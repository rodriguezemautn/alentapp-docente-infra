import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LockerController } from './LockerController.js';

describe('LockerController', () => {
    const mockCreateUseCase = { execute: vi.fn() };
    const mockGetAllUseCase = { execute: vi.fn() };
    const mockGetByIdUseCase = { execute: vi.fn() };
    const mockUpdateUseCase = { execute: vi.fn() };
    const mockDeleteUseCase = { execute: vi.fn() };

    const controller = new LockerController(
        mockCreateUseCase as any,
        mockGetAllUseCase as any,
        mockGetByIdUseCase as any,
        mockUpdateUseCase as any,
        mockDeleteUseCase as any,
    );

    const mockReply = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('create', () => {
        const mockRequest = { body: { number: 101, location: 'Planta baja' } };

        it('debe devolver 201 si se crea el casillero', async () => {
            const locker = { id: '1', number: 101, location: 'Planta baja', status: 'Available', created_at: '' };
            mockCreateUseCase.execute.mockResolvedValueOnce(locker);

            await controller.create(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith({ data: locker });
        });

        it('debe devolver 409 si el número ya existe', async () => {
            mockCreateUseCase.execute.mockRejectedValueOnce(new Error('Ya existe un casillero con ese número'));

            await controller.create(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(409);
        });

        it('debe devolver 400 si el número es inválido', async () => {
            mockCreateUseCase.execute.mockRejectedValueOnce(new Error('debe ser un entero positivo'));

            await controller.create(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(400);
        });
    });

    describe('getAll', () => {
        it('debe devolver 200 con la lista', async () => {
            const locker = { id: '1', number: 101, status: 'Available', created_at: '' };
            mockGetAllUseCase.execute.mockResolvedValueOnce([locker]);

            await controller.getAll({ query: {} } as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith({ data: [locker] });
        });
    });

    describe('getById', () => {
        it('debe devolver 200 si existe', async () => {
            const locker = { id: '1', number: 101, status: 'Available', created_at: '' };
            mockGetByIdUseCase.execute.mockResolvedValueOnce(locker);

            await controller.getById({ params: { id: '1' } } as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(200);
        });

        it('debe devolver 404 si no existe', async () => {
            mockGetByIdUseCase.execute.mockRejectedValueOnce(new Error('El casillero no existe'));

            await controller.getById({ params: { id: '999' } } as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(404);
        });
    });

    describe('delete', () => {
        it('debe devolver 204 si se elimina', async () => {
            mockDeleteUseCase.execute.mockResolvedValueOnce(undefined);

            await controller.delete({ params: { id: '1' } } as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(204);
        });
    });
});
