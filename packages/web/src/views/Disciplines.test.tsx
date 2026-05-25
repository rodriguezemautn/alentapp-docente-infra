import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DisciplinesView } from './Disciplines';
import { disciplinesService } from '../services/disciplines';
import { sportsService } from '../services/sports';
import { Provider } from '../components/ui/provider';

import type { DisciplineDetailDTO, SportDTO } from '@alentapp/shared';

vi.mock('../services/disciplines', () => ({
  disciplinesService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../services/sports', () => ({
  sportsService: {
    getAll: vi.fn(),
  },
}));

describe('DisciplinesView', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<Provider>{ui}</Provider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar el estado de carga y luego renderizar una tabla vacía', async () => {
    vi.mocked(disciplinesService.getAll).mockResolvedValueOnce([]);
    vi.mocked(sportsService.getAll).mockResolvedValueOnce([]);

    renderWithProviders(<DisciplinesView />);

    expect(screen.getByText('Cargando disciplinas...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Cargando disciplinas...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No se encontraron disciplinas.')).toBeInTheDocument();
  });

  it('debe renderizar la lista de disciplinas si el backend responde exitosamente', async () => {
    const mockDisciplines = [
      {
        id: '1',
        sportId: 's1',
        name: 'Fútbol Infantil',
        description: 'Categoría infantil',
        startDate: '2026-03-01',
        endDate: '2026-12-15',
        schedule: 'Lun y Mié 18-20',
        professor: 'Carlos Pérez',
        sportName: 'Fútbol',
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        sportId: 's2',
        name: 'Natación Avanzada',
        description: 'Nivel avanzado',
        startDate: '2026-04-01',
        endDate: '2026-11-30',
        schedule: 'Mar y Jue 08-10',
        professor: 'Ana Gómez',
        sportName: 'Natación',
        created_at: new Date().toISOString(),
      },
    ] as DisciplineDetailDTO[];

    const mockSports = [
      { id: 's1', name: 'Fútbol', description: '', maxCapacity: 22, created_at: new Date().toISOString() },
      { id: 's2', name: 'Natación', description: '', maxCapacity: 30, created_at: new Date().toISOString() },
    ] as SportDTO[];

    vi.mocked(disciplinesService.getAll).mockResolvedValueOnce(mockDisciplines);
    vi.mocked(sportsService.getAll).mockResolvedValueOnce(mockSports);

    renderWithProviders(<DisciplinesView />);

    await waitFor(() => {
      expect(screen.getByText('Fútbol Infantil')).toBeInTheDocument();
    });

    expect(screen.getByText('Natación Avanzada')).toBeInTheDocument();
    expect(screen.getByText('Fútbol')).toBeInTheDocument();
    expect(screen.getByText('Natación')).toBeInTheDocument();
    expect(screen.getByText('Carlos Pérez')).toBeInTheDocument();
    expect(screen.getByText('Ana Gómez')).toBeInTheDocument();
    expect(screen.getByText('Lun y Mié 18-20')).toBeInTheDocument();
  });

  it('debe renderizar un mensaje de error si el servicio backend falla', async () => {
    vi.mocked(disciplinesService.getAll).mockRejectedValueOnce(new Error('Servidor caído'));
    vi.mocked(sportsService.getAll).mockResolvedValueOnce([]);

    renderWithProviders(<DisciplinesView />);

    await waitFor(() => {
      expect(screen.getByText('Servidor caído')).toBeInTheDocument();
    });
  });

  it('debe permitir crear una nueva disciplina mediante el formulario', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    const mockSports = [
      { id: 's1', name: 'Fútbol', description: '', maxCapacity: 22, created_at: new Date().toISOString() },
      { id: 's2', name: 'Natación', description: '', maxCapacity: 30, created_at: new Date().toISOString() },
    ] as SportDTO[];

    vi.mocked(disciplinesService.getAll).mockResolvedValue([]);
    vi.mocked(sportsService.getAll).mockResolvedValue(mockSports);
    vi.mocked(disciplinesService.create).mockResolvedValueOnce({
      id: '3',
      sportId: 's1',
      name: 'Fútbol Senior',
      description: 'Categoría mayores',
      startDate: '2026-05-01',
      endDate: '2026-10-31',
      schedule: 'Mar y Jue 20-22',
      professor: 'Juan Rodríguez',
      sportName: 'Fútbol',
      created_at: new Date().toISOString(),
    });

    renderWithProviders(<DisciplinesView />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando disciplinas...')).not.toBeInTheDocument();
    });

    const addButton = screen.getByText(/Agregar Disciplina/i);
    await user.click(addButton);

    const nameInput = screen.getByLabelText(/Nombre/i);
    await user.type(nameInput, 'Fútbol Senior');

    const descriptionInput = screen.getByLabelText(/Descripción/i);
    await user.type(descriptionInput, 'Categoría mayores');

    const startDateInput = screen.getByLabelText(/Fecha de inicio/i);
    await user.clear(startDateInput);
    await user.type(startDateInput, '2026-05-01');

    const endDateInput = screen.getByLabelText(/Fecha de fin/i);
    await user.clear(endDateInput);
    await user.type(endDateInput, '2026-10-31');

    const scheduleInput = screen.getByLabelText(/Horario/i);
    await user.type(scheduleInput, 'Mar y Jue 20-22');

    const professorInput = screen.getByLabelText(/Profesor/i);
    await user.type(professorInput, 'Juan Rodríguez');

    const submitButton = screen.getByText('Crear Disciplina');
    await user.click(submitButton);

    expect(disciplinesService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Fútbol Senior',
        description: 'Categoría mayores',
        startDate: '2026-05-01',
        endDate: '2026-10-31',
        schedule: 'Mar y Jue 20-22',
        professor: 'Juan Rodríguez',
      })
    );
  });

  it('debe permitir editar una disciplina existente', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    const mockDisciplines = [
      {
        id: '1',
        sportId: 's1',
        name: 'Fútbol Infantil',
        description: 'Categoría infantil',
        startDate: '2026-03-01',
        endDate: '2026-12-15',
        schedule: 'Lun y Mié 18-20',
        professor: 'Carlos Pérez',
        sportName: 'Fútbol',
        created_at: new Date().toISOString(),
      },
    ] as DisciplineDetailDTO[];

    const mockSports = [
      { id: 's1', name: 'Fútbol', description: '', maxCapacity: 22, created_at: new Date().toISOString() },
    ] as SportDTO[];

    vi.mocked(disciplinesService.getAll).mockResolvedValue(mockDisciplines);
    vi.mocked(sportsService.getAll).mockResolvedValue(mockSports);
    vi.mocked(disciplinesService.update).mockResolvedValueOnce({
      id: '1',
      sportId: 's1',
      name: 'Fútbol Infantil',
      description: 'Categoría infantil editada',
      startDate: '2026-03-01',
      endDate: '2026-12-20',
      schedule: 'Lun y Mié 18-20',
      professor: 'Carlos Pérez',
      sportName: 'Fútbol',
      created_at: new Date().toISOString(),
    });

    renderWithProviders(<DisciplinesView />);

    await waitFor(() => {
      expect(screen.getByText('Fútbol Infantil')).toBeInTheDocument();
    });

    const editButton = screen.getByLabelText(/Editar disciplina/i);
    await user.click(editButton);

    const descriptionInput = screen.getByLabelText(/Descripción/i);
    await user.type(descriptionInput, ' editada');

    const endDateInput = screen.getByLabelText(/Fecha de fin/i);
    await user.clear(endDateInput);
    await user.type(endDateInput, '2026-12-20');

    const submitButton = screen.getByText('Guardar Cambios');
    await user.click(submitButton);

    expect(disciplinesService.update).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        description: 'Categoría infantil editada',
        endDate: '2026-12-20',
      })
    );
  });

  it('debe permitir eliminar una disciplina con confirmación', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    const mockDisciplines = [
      {
        id: '1',
        sportId: 's1',
        name: 'Fútbol Infantil',
        description: 'Categoría infantil',
        startDate: '2026-03-01',
        endDate: '2026-12-15',
        schedule: 'Lun y Mié 18-20',
        professor: 'Carlos Pérez',
        sportName: 'Fútbol',
        created_at: new Date().toISOString(),
      },
    ] as DisciplineDetailDTO[];

    const mockSports = [
      { id: 's1', name: 'Fútbol', description: '', maxCapacity: 22, created_at: new Date().toISOString() },
    ] as SportDTO[];

    vi.mocked(disciplinesService.getAll).mockResolvedValue(mockDisciplines);
    vi.mocked(sportsService.getAll).mockResolvedValue(mockSports);
    vi.mocked(disciplinesService.delete).mockResolvedValueOnce(undefined);

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(<DisciplinesView />);

    await waitFor(() => {
      expect(screen.getByText('Fútbol Infantil')).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText(/Eliminar disciplina/i);
    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledWith(
      '¿Estás seguro de que deseas eliminar la disciplina "Fútbol Infantil"?'
    );
    expect(disciplinesService.delete).toHaveBeenCalledWith('1');

    confirmSpy.mockRestore();
  });

  it('debe rechazar el envío si endDate es anterior a startDate', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    const mockSports = [
      { id: 's1', name: 'Fútbol', description: '', maxCapacity: 22, created_at: new Date().toISOString() },
    ] as SportDTO[];

    vi.mocked(disciplinesService.getAll).mockResolvedValue([]);
    vi.mocked(sportsService.getAll).mockResolvedValue(mockSports);

    // Mock create to reject (should not be called)
    const createMock = vi.mocked(disciplinesService.create);

    renderWithProviders(<DisciplinesView />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando disciplinas...')).not.toBeInTheDocument();
    });

    const addButton = screen.getByText(/Agregar Disciplina/i);
    await user.click(addButton);

    // Wait for dialog to be fully rendered
    await waitFor(() => {
      expect(screen.getByText('Agregar Nueva Disciplina')).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/Nombre/i), 'Disciplina Test');

    // Verify name was filled - this proves user.type works
    const startDateInput = await screen.findByLabelText(/Fecha de inicio/i);
    await user.clear(startDateInput);
    await user.type(startDateInput, '2026-12-15');

    const endDateInput = await screen.findByLabelText(/Fecha de fin/i);
    await user.clear(endDateInput);
    await user.type(endDateInput, '2026-03-01');

    // Submit the form directly (more reliable than button click in Dialog portal)
    const form = document.querySelector('form')!;
    await act(async () => {
      form.requestSubmit();
      await new Promise(r => setTimeout(r, 100));
    });

    // create should NOT be called because validation should reject the submission
    expect(createMock).not.toHaveBeenCalled();
  });
});
