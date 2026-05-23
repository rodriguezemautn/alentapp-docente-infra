import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SportController } from './SportController.js';

describe('SportController', () => {
    // 1. Mocks de los Casos de Uso
    const mockCreateUseCase = { execute: vi.fn() };
    const mockGetUseCase = { execute: vi.fn() };
    const mockUpdateUseCase = { execute: vi.fn() };
    const mockDeleteUseCase = { execute: vi.fn() };

    const controller = new SportController(
        mockCreateUseCase as any,
        mockGetUseCase as any,
        mockUpdateUseCase as any,
        mockDeleteUseCase as any
    );

    // 2. Mocks de Fastify Request y Reply
    const mockReply = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn()
    };

    const mockRequest = {
        body: { name: 'Fútbol', maxCapacity: 22 },
        params: { id: 'abc-123' }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('create', () => {
        it('debe devolver status 201 y los datos si la creación es exitosa', async () => {
            const mockSport = { id: '1', name: 'Fútbol', maxCapacity: 22 };
            mockCreateUseCase.execute.mockResolvedValueOnce(mockSport);

            await controller.create(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(201);
            expect(mockReply.send).toHaveBeenCalledWith({ data: mockSport });
        });

        it('debe devolver status 409 Conflict si el nombre ya existe', async () => {
            mockCreateUseCase.execute.mockRejectedValueOnce(new Error('Ya existe un deporte con ese nombre'));

            await controller.create(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(409);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Ya existe un deporte con ese nombre' });
        });

        it('debe devolver status 400 Bad Request si maxCapacity es inválido', async () => {
            mockCreateUseCase.execute.mockRejectedValueOnce(new Error('La capacidad máxima debe ser un número entero positivo'));

            await controller.create(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'La capacidad máxima debe ser un número entero positivo' });
        });

        it('debe devolver status 400 si el nombre es requerido', async () => {
            mockCreateUseCase.execute.mockRejectedValueOnce(new Error('El nombre es requerido'));

            await controller.create(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'El nombre es requerido' });
        });

        it('debe devolver status 500 para cualquier otro error (ej. error de DB)', async () => {
            mockCreateUseCase.execute.mockRejectedValueOnce(new Error('Error de conexion de Prisma...'));

            await controller.create(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Error interno, reintente más tarde' });
        });
    });

    describe('getAll', () => {
        it('debe devolver status 200 y la lista de deportes', async () => {
            const mockSports = [
                { id: '1', name: 'Fútbol', maxCapacity: 22, disciplineCount: 0 },
                { id: '2', name: 'Natación', maxCapacity: 30, disciplineCount: 2 }
            ];
            mockGetUseCase.execute.mockResolvedValueOnce(mockSports);

            await controller.getAll(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith({ data: mockSports });
        });

        it('debe devolver status 500 si falla el caso de uso', async () => {
            mockGetUseCase.execute.mockRejectedValueOnce(new Error('DB Falló'));

            await controller.getAll(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'DB Falló' });
        });
    });

    describe('update', () => {
        it('debe devolver status 200 y los datos si se actualiza correctamente', async () => {
            const mockSport = { id: 'abc-123', name: 'Natación', description: 'Deporte acuático', maxCapacity: 30 };
            mockUpdateUseCase.execute.mockResolvedValueOnce(mockSport);

            await controller.update(mockRequest as any, mockReply as any);

            expect(mockUpdateUseCase.execute).toHaveBeenCalledWith('abc-123', { name: 'Fútbol', maxCapacity: 22 });
            expect(mockReply.status).toHaveBeenCalledWith(200);
            expect(mockReply.send).toHaveBeenCalledWith({ data: mockSport });
        });

        it('debe devolver status 404 si el deporte no existe', async () => {
            mockUpdateUseCase.execute.mockRejectedValueOnce(new Error('El deporte no existe'));

            await controller.update(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'El deporte no existe' });
        });

        it('debe devolver status 400 si se intenta modificar el nombre', async () => {
            mockUpdateUseCase.execute.mockRejectedValueOnce(new Error('No se puede modificar el nombre del deporte'));

            await controller.update(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(400);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'No se puede modificar el nombre del deporte' });
        });

        it('debe devolver status 500 ante un error genérico', async () => {
            mockUpdateUseCase.execute.mockRejectedValueOnce(new Error('Generic failure'));

            await controller.update(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(500);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'Error interno, reintente más tarde' });
        });
    });

    describe('delete', () => {
        it('debe devolver status 204 si la eliminación es exitosa', async () => {
            mockDeleteUseCase.execute.mockResolvedValueOnce(undefined);

            await controller.delete(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(204);
            expect(mockReply.send).toHaveBeenCalledWith();
        });

        it('debe devolver status 404 si el deporte no existe', async () => {
            mockDeleteUseCase.execute.mockRejectedValueOnce(new Error('El deporte no existe'));

            await controller.delete(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(404);
            expect(mockReply.send).toHaveBeenCalledWith({ error: 'El deporte no existe' });
        });

        it('debe devolver status 409 si el deporte tiene disciplinas asociadas', async () => {
            mockDeleteUseCase.execute.mockRejectedValueOnce(
                new Error('No se puede eliminar un deporte con disciplinas asociadas. Elimine las disciplinas primero')
            );

            await controller.delete(mockRequest as any, mockReply as any);

            expect(mockReply.status).toHaveBeenCalledWith(409);
            expect(mockReply.send).toHaveBeenCalledWith({
                error: 'No se puede eliminar un deporte con disciplinas asociadas. Elimine las disciplinas primero'
            });
        });
    });
});
