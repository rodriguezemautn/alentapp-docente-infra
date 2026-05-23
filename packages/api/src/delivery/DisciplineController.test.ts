import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisciplineController } from './DisciplineController.js';

describe('DisciplineController', () => {
  const mockCreateUseCase = { execute: vi.fn() };
  const mockGetDisciplinesUseCase = { execute: vi.fn() };
  const mockGetByIdUseCase = { execute: vi.fn() };
  const mockUpdateUseCase = { execute: vi.fn() };
  const mockDeleteUseCase = { execute: vi.fn() };

  const controller = new DisciplineController(
    mockCreateUseCase as any,
    mockGetDisciplinesUseCase as any,
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
    const mockCreateRequest = {
      body: {
        sportId: 'sport-1',
        name: 'Fútbol Infantil',
        startDate: '2026-06-01',
        endDate: '2026-12-31',
      },
    };

    it('debe devolver status 201 y los datos si la creación es exitosa', async () => {
      const mockDiscipline = {
        id: 'uuid-1',
        sportId: 'sport-1',
        name: 'Fútbol Infantil',
        startDate: '2026-06-01',
        endDate: '2026-12-31',
        created_at: '2026-05-23T00:00:00.000Z',
        sportName: 'Fútbol',
      };
      mockCreateUseCase.execute.mockResolvedValueOnce(mockDiscipline);

      await controller.create(mockCreateRequest as any, mockReply as any);

      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith({ data: mockDiscipline });
    });

    it('debe devolver status 400 si la fecha de fin es inválida', async () => {
      mockCreateUseCase.execute.mockRejectedValueOnce(
        new Error('La fecha de fin debe ser posterior a la fecha de inicio'),
      );

      await controller.create(mockCreateRequest as any, mockReply as any);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'La fecha de fin debe ser posterior a la fecha de inicio',
      });
    });

    it('debe devolver status 404 si el deporte no existe', async () => {
      mockCreateUseCase.execute.mockRejectedValueOnce(
        new Error('El deporte no existe'),
      );

      await controller.create(mockCreateRequest as any, mockReply as any);

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'El deporte no existe' });
    });

    it('debe devolver status 500 para errores inesperados', async () => {
      mockCreateUseCase.execute.mockRejectedValueOnce(new Error('Error de conexión'));

      await controller.create(mockCreateRequest as any, mockReply as any);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Error interno, reintente más tarde' });
    });
  });

  describe('getAll', () => {
    it('debe devolver status 200 con la lista de disciplinas', async () => {
      const mockDisciplines = [
        { id: '1', name: 'Fútbol Infantil', sportName: 'Fútbol' },
        { id: '2', name: 'Natación Básica', sportName: 'Natación' },
      ];
      mockGetDisciplinesUseCase.execute.mockResolvedValueOnce(mockDisciplines);

      const requestWithQuery = { query: { sportId: 'sport-1' } };
      await controller.getAll(requestWithQuery as any, mockReply as any);

      expect(mockGetDisciplinesUseCase.execute).toHaveBeenCalledWith({ sportId: 'sport-1' });
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({ data: mockDisciplines });
    });

    it('debe llamar al caso de uso sin filtros si no hay sportId', async () => {
      mockGetDisciplinesUseCase.execute.mockResolvedValueOnce([]);

      await controller.getAll({ query: {} } as any, mockReply as any);

      expect(mockGetDisciplinesUseCase.execute).toHaveBeenCalledWith(undefined);
      expect(mockReply.status).toHaveBeenCalledWith(200);
    });

    it('debe devolver status 500 si falla el caso de uso', async () => {
      mockGetDisciplinesUseCase.execute.mockRejectedValueOnce(new Error('DB Falló'));

      await controller.getAll({ query: {} } as any, mockReply as any);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'DB Falló' });
    });
  });

  describe('getById', () => {
    it('debe devolver status 200 con la disciplina', async () => {
      const mockDiscipline = {
        id: 'uuid-1',
        name: 'Fútbol Infantil',
        sportName: 'Fútbol',
      };
      mockGetByIdUseCase.execute.mockResolvedValueOnce(mockDiscipline);

      await controller.getById({ params: { id: 'uuid-1' } } as any, mockReply as any);

      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({ data: mockDiscipline });
    });

    it('debe devolver status 404 si la disciplina no existe', async () => {
      mockGetByIdUseCase.execute.mockRejectedValueOnce(
        new Error('La disciplina no existe'),
      );

      await controller.getById({ params: { id: 'no-existe' } } as any, mockReply as any);

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'La disciplina no existe' });
    });
  });

  describe('update', () => {
    const mockUpdateRequest = {
      params: { id: 'uuid-1' },
      body: { name: 'Nuevo nombre' },
    };

    it('debe devolver status 200 con los datos actualizados', async () => {
      const mockDiscipline = {
        id: 'uuid-1',
        name: 'Nuevo nombre',
        sportName: 'Fútbol',
      };
      mockUpdateUseCase.execute.mockResolvedValueOnce(mockDiscipline);

      await controller.update(mockUpdateRequest as any, mockReply as any);

      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith('uuid-1', { name: 'Nuevo nombre' });
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({ data: mockDiscipline });
    });

    it('debe devolver status 404 si la disciplina no existe', async () => {
      mockUpdateUseCase.execute.mockRejectedValueOnce(new Error('La disciplina no existe'));

      await controller.update(mockUpdateRequest as any, mockReply as any);

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'La disciplina no existe' });
    });

    it('debe devolver status 400 si endDate es inválido', async () => {
      mockUpdateUseCase.execute.mockRejectedValueOnce(
        new Error('La fecha de fin debe ser posterior a la fecha de inicio'),
      );

      await controller.update(mockUpdateRequest as any, mockReply as any);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        error: 'La fecha de fin debe ser posterior a la fecha de inicio',
      });
    });

    it('debe devolver status 500 para errores inesperados', async () => {
      mockUpdateUseCase.execute.mockRejectedValueOnce(new Error('Generic failure'));

      await controller.update(mockUpdateRequest as any, mockReply as any);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Error interno, reintente más tarde' });
    });
  });

  describe('delete', () => {
    it('debe devolver status 204 si la eliminación es exitosa', async () => {
      mockDeleteUseCase.execute.mockResolvedValueOnce(undefined);

      await controller.delete({ params: { id: 'uuid-1' } } as any, mockReply as any);

      expect(mockReply.status).toHaveBeenCalledWith(204);
      expect(mockReply.send).toHaveBeenCalledWith();
    });

    it('debe devolver status 404 si la disciplina no existe', async () => {
      mockDeleteUseCase.execute.mockRejectedValueOnce(new Error('La disciplina no existe'));

      await controller.delete({ params: { id: 'no-existe' } } as any, mockReply as any);

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'La disciplina no existe' });
    });

    it('debe devolver status 500 para errores inesperados', async () => {
      mockDeleteUseCase.execute.mockRejectedValueOnce(new Error('DB error'));

      await controller.delete({ params: { id: 'uuid-1' } } as any, mockReply as any);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Error interno, reintente más tarde' });
    });
  });
});
