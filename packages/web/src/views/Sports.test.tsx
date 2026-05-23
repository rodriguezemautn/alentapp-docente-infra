import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SportsView } from './Sports';
import { sportsService } from '../services/sports';
import { Provider } from '../components/ui/provider';

import type { SportDetailDTO } from '@alentapp/shared';

vi.mock('../services/sports', () => ({
  sportsService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('SportsView', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<Provider>{ui}</Provider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar el estado de carga y luego renderizar una tabla vacía', async () => {
    vi.mocked(sportsService.getAll).mockResolvedValueOnce([]);

    renderWithProviders(<SportsView />);

    expect(screen.getByText('Cargando deportes...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Cargando deportes...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No se encontraron deportes.')).toBeInTheDocument();
  });

  it('debe renderizar la lista de deportes si el backend responde exitosamente', async () => {
    const mockSports = [
      {
        id: '1',
        name: 'Fútbol',
        description: 'Deporte de equipo',
        maxCapacity: 22,
        disciplineCount: 2,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Natación',
        description: 'Deporte acuático',
        maxCapacity: 30,
        disciplineCount: 0,
        created_at: new Date().toISOString(),
      },
    ] as SportDetailDTO[];

    vi.mocked(sportsService.getAll).mockResolvedValueOnce(mockSports);

    renderWithProviders(<SportsView />);

    await waitFor(() => {
      expect(screen.getByText('Fútbol')).toBeInTheDocument();
    });

    expect(screen.getByText('Natación')).toBeInTheDocument();
    expect(screen.getByText('22')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('Deporte de equipo')).toBeInTheDocument();
    expect(screen.getByText('Deporte acuático')).toBeInTheDocument();
  });

  it('debe renderizar un mensaje de error si el servicio backend falla', async () => {
    vi.mocked(sportsService.getAll).mockRejectedValueOnce(new Error('Servidor caído'));

    renderWithProviders(<SportsView />);

    await waitFor(() => {
      expect(screen.getByText('Servidor caído')).toBeInTheDocument();
    });
  });

  it('debe permitir crear un nuevo deporte mediante el formulario', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    vi.mocked(sportsService.getAll).mockResolvedValue([]);
    vi.mocked(sportsService.create).mockResolvedValueOnce({
      id: '3',
      name: 'Tenis',
      description: 'Deporte de raqueta',
      maxCapacity: 4,
      created_at: new Date().toISOString(),
    });

    renderWithProviders(<SportsView />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando deportes...')).not.toBeInTheDocument();
    });

    const addButton = screen.getByText(/Agregar Deporte/i);
    await user.click(addButton);

    const nameInput = screen.getByLabelText(/Nombre/i);
    await user.type(nameInput, 'Tenis');

    const descriptionInput = screen.getByLabelText(/Descripción/i);
    await user.type(descriptionInput, 'Deporte de raqueta');

    const capacityInput = screen.getByLabelText(/Capacidad Máxima/i);
    await user.clear(capacityInput);
    await user.type(capacityInput, '4');

    const submitButton = screen.getByText('Crear Deporte');
    await user.click(submitButton);

    expect(sportsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Tenis',
        description: 'Deporte de raqueta',
        maxCapacity: 4,
      })
    );
  });

  it('debe permitir editar un deporte existente con el nombre deshabilitado', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    const mockSports = [
      {
        id: '1',
        name: 'Fútbol',
        description: 'Deporte de equipo',
        maxCapacity: 22,
        disciplineCount: 1,
        created_at: new Date().toISOString(),
      },
    ] as SportDetailDTO[];

    vi.mocked(sportsService.getAll).mockResolvedValue(mockSports);
    vi.mocked(sportsService.update).mockResolvedValueOnce({
      id: '1',
      name: 'Fútbol',
      description: 'Deporte de equipo editado',
      maxCapacity: 25,
      created_at: new Date().toISOString(),
    });

    renderWithProviders(<SportsView />);

    await waitFor(() => {
      expect(screen.getByText('Fútbol')).toBeInTheDocument();
    });

    const editButton = screen.getByLabelText(/Editar deporte/i);
    await user.click(editButton);

    const nameInput = screen.getByLabelText(/Nombre/i);
    expect(nameInput).toBeDisabled();

    const descriptionInput = screen.getByLabelText(/Descripción/i);
    await user.type(descriptionInput, ' editado');

    const capacityInput = screen.getByLabelText(/Capacidad Máxima/i);
    await user.clear(capacityInput);
    await user.type(capacityInput, '25');

    const submitButton = screen.getByText('Guardar Cambios');
    await user.click(submitButton);

    expect(sportsService.update).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        description: 'Deporte de equipo editado',
        maxCapacity: 25,
      })
    );
  });

  it('debe permitir eliminar un deporte con confirmación', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    const mockSports = [
      {
        id: '1',
        name: 'Fútbol',
        description: 'Deporte de equipo',
        maxCapacity: 22,
        disciplineCount: 0,
        created_at: new Date().toISOString(),
      },
    ] as SportDetailDTO[];

    vi.mocked(sportsService.getAll).mockResolvedValue(mockSports);
    vi.mocked(sportsService.delete).mockResolvedValueOnce(undefined);

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(<SportsView />);

    await waitFor(() => {
      expect(screen.getByText('Fútbol')).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText(/Eliminar deporte/i);
    await user.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledWith(
      '¿Estás seguro de que deseas eliminar el deporte "Fútbol"? Esta acción no se puede deshacer.'
    );
    expect(sportsService.delete).toHaveBeenCalledWith('1');

    confirmSpy.mockRestore();
  });

  it('debe deshabilitar el botón de eliminar cuando disciplineCount > 0', async () => {
    const mockSports = [
      {
        id: '1',
        name: 'Fútbol',
        description: 'Deporte de equipo',
        maxCapacity: 22,
        disciplineCount: 3,
        created_at: new Date().toISOString(),
      },
    ] as SportDetailDTO[];

    vi.mocked(sportsService.getAll).mockResolvedValue(mockSports);

    renderWithProviders(<SportsView />);

    await waitFor(() => {
      expect(screen.getByText('Fútbol')).toBeInTheDocument();
    });

    const deleteButton = screen.getByLabelText(/Eliminar deporte/i);
    expect(deleteButton).toBeDisabled();
  });
});
