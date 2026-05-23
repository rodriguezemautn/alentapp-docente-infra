import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentsView } from './Payments';
import { paymentsService } from '../services/payments';
import { membersService } from '../services/members';
import { Provider } from '../components/ui/provider';

import type { PaginatedResponse } from '@alentapp/shared';
import type { PaymentDTO, MemberDTO } from '@alentapp/shared';

vi.mock('../services/payments', () => ({
  paymentsService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    cancel: vi.fn(),
  },
}));

vi.mock('../services/members', () => ({
  membersService: {
    getAll: vi.fn(),
  },
}));

const mockMembers: MemberDTO[] = [
  { id: 'm1', name: 'Juan Pérez', dni: '12345678', email: 'juan@test.com', birthdate: '1990-01-01', category: 'Pleno', status: 'Activo', created_at: '' },
  { id: 'm2', name: 'María García', dni: '87654321', email: 'maria@test.com', birthdate: '1995-05-15', category: 'Cadete', status: 'Activo', created_at: '' },
];

function mockEmptyResponse(): PaginatedResponse<PaymentDTO> {
  return { data: [], total: 0, page: 1, limit: 10 };
}

function createPayment(overrides: Partial<PaymentDTO> = {}): PaymentDTO {
  return {
    id: 'p1',
    memberId: 'm1',
    amount: 150.00,
    paymentDate: '2026-05-01T00:00:00.000Z',
    paymentType: 'Cuota',
    status: 'Completed',
    created_at: '2026-05-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('PaymentsView', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<Provider>{ui}</Provider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe mostrar el estado de carga y luego renderizar una tabla vacía', async () => {
    vi.mocked(membersService.getAll).mockResolvedValueOnce([]);
    vi.mocked(paymentsService.getAll).mockResolvedValueOnce(mockEmptyResponse());

    renderWithProviders(<PaymentsView />);

    expect(screen.getByText('Cargando pagos...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Cargando pagos...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('No se encontraron pagos.')).toBeInTheDocument();
  });

  it('debe renderizar la lista de pagos si el backend responde exitosamente', async () => {
    const payment = createPayment();
    vi.mocked(membersService.getAll).mockResolvedValueOnce(mockMembers);
    vi.mocked(paymentsService.getAll).mockResolvedValueOnce({
      data: [payment],
      total: 1,
      page: 1,
      limit: 10,
    });

    renderWithProviders(<PaymentsView />);

    // Wait for a unique value (amount is only in table cell, not in filter selects)
    await waitFor(() => {
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    // Find the table body cells to scope assertions
    const tableCells = screen.getAllByRole('cell');
    const cellTexts = tableCells.map((cell) => cell.textContent);
    expect(cellTexts).toEqual(
      expect.arrayContaining(['Juan Pérez', '$150.00', 'Cuota', 'Completado'])
    );
  });

  it('debe renderizar un mensaje de error si el servicio falla', async () => {
    vi.mocked(membersService.getAll).mockResolvedValueOnce(mockMembers);
    vi.mocked(paymentsService.getAll).mockRejectedValueOnce(new Error('Error de conexión'));

    renderWithProviders(<PaymentsView />);

    await waitFor(() => {
      expect(screen.getByText('Error de conexión')).toBeInTheDocument();
    });
  });

  it('debe mostrar visualmente distinto un pago cancelado', async () => {
    const canceledPayment = createPayment({ id: 'p2', status: 'Canceled' });
    vi.mocked(membersService.getAll).mockResolvedValueOnce(mockMembers);
    vi.mocked(paymentsService.getAll).mockResolvedValueOnce({
      data: [canceledPayment],
      total: 1,
      page: 1,
      limit: 10,
    });

    renderWithProviders(<PaymentsView />);

    await waitFor(() => {
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    // Find the status badge in the table cells
    const tableCells = screen.getAllByRole('cell');
    const cellTexts = tableCells.map((cell) => cell.textContent);
    expect(cellTexts).toContain('Cancelado');
    expect(cellTexts).not.toContain('Completado');
  });

  it('debe permitir cancelar un pago con confirmación', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    const payment = createPayment();

    vi.mocked(membersService.getAll).mockResolvedValueOnce(mockMembers);
    vi.mocked(paymentsService.getAll).mockResolvedValueOnce({
      data: [payment],
      total: 1,
      page: 1,
      limit: 10,
    });
    vi.mocked(paymentsService.cancel).mockResolvedValueOnce(createPayment({ status: 'Canceled' }));

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    renderWithProviders(<PaymentsView />);

    // Wait for a unique value in the table cell
    await waitFor(() => {
      expect(screen.getByText('$150.00')).toBeInTheDocument();
    });

    const cancelButton = screen.getByLabelText(/Cancelar pago/i);
    await user.click(cancelButton);

    expect(confirmSpy).toHaveBeenCalled();
    expect(paymentsService.cancel).toHaveBeenCalledWith('p1');

    confirmSpy.mockRestore();
  });

  it('debe abrir el modal de creación al hacer clic en Agregar Pago', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    vi.mocked(membersService.getAll).mockResolvedValueOnce(mockMembers);
    vi.mocked(paymentsService.getAll).mockResolvedValueOnce(mockEmptyResponse());

    renderWithProviders(<PaymentsView />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando pagos...')).not.toBeInTheDocument();
    });

    const addButton = screen.getByText(/Agregar Pago/i);
    await user.click(addButton);

    expect(screen.getByText('Agregar Nuevo Pago')).toBeInTheDocument();
  });

  it('debe permitir crear un pago mediante el formulario', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    vi.mocked(membersService.getAll).mockResolvedValueOnce(mockMembers);
    vi.mocked(paymentsService.getAll).mockResolvedValueOnce(mockEmptyResponse());
    vi.mocked(paymentsService.create).mockResolvedValueOnce(
      createPayment({ id: 'new1', amount: 500, paymentDate: '2026-06-01T00:00:00.000Z' })
    );

    renderWithProviders(<PaymentsView />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando pagos...')).not.toBeInTheDocument();
    });

    const addButton = screen.getByText(/Agregar Pago/i);
    await user.click(addButton);

    const amountInput = screen.getByLabelText(/Monto/i);
    await user.clear(amountInput);
    await user.type(amountInput, '500');

    const dateInput = screen.getByLabelText(/Fecha/i);
    await user.clear(dateInput);
    await user.type(dateInput, '2026-06-01');

    const submitButton = screen.getByText('Crear Pago');
    await user.click(submitButton);

    expect(paymentsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 500,
        paymentDate: '2026-06-01',
        paymentType: 'Cuota',
      })
    );
  });

  it('debe aplicar filtros al hacer clic en Filtrar', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    vi.mocked(membersService.getAll).mockResolvedValueOnce(mockMembers);
    vi.mocked(paymentsService.getAll).mockResolvedValueOnce(mockEmptyResponse());
    // Second call after filter
    vi.mocked(paymentsService.getAll).mockResolvedValueOnce(mockEmptyResponse());

    renderWithProviders(<PaymentsView />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando pagos...')).not.toBeInTheDocument();
    });

    // Type a date in from filter
    const fromInput = screen.getByLabelText(/Desde/i);
    await user.clear(fromInput);
    await user.type(fromInput, '2026-01-01');

    const applyButton = screen.getByText('Filtrar');
    await user.click(applyButton);

    expect(paymentsService.getAll).toHaveBeenCalledTimes(2);
    expect(paymentsService.getAll).toHaveBeenLastCalledWith(
      expect.objectContaining({
        from: '2026-01-01',
        page: 1,
        limit: 10,
      })
    );
  });

  it('debe limpiar filtros al hacer clic en Limpiar', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    vi.mocked(membersService.getAll).mockResolvedValueOnce(mockMembers);
    vi.mocked(paymentsService.getAll).mockResolvedValue(mockEmptyResponse());

    renderWithProviders(<PaymentsView />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando pagos...')).not.toBeInTheDocument();
    });

    const fromInput = screen.getByLabelText(/Desde/i);
    await user.clear(fromInput);
    await user.type(fromInput, '2026-01-01');

    const clearButton = screen.getByText('Limpiar');
    await user.click(clearButton);

    // After clear, the from input should be empty
    expect(fromInput).toHaveValue('');
  });

  it('debe navegar entre páginas con los botones de paginación', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    // Create 10 payments to have more than one page (total = 25)
    const payments = Array.from({ length: 10 }, (_, i) =>
      createPayment({ id: `p${i}`, memberId: i < 5 ? 'm1' : 'm2', amount: 100 + i })
    );

    vi.mocked(membersService.getAll).mockResolvedValueOnce(mockMembers);
    vi.mocked(paymentsService.getAll).mockResolvedValueOnce({
      data: payments,
      total: 25,
      page: 1,
      limit: 10,
    });
    // Second call for page 2
    vi.mocked(paymentsService.getAll).mockResolvedValueOnce({
      data: payments.slice(0, 5),
      total: 25,
      page: 2,
      limit: 10,
    });

    renderWithProviders(<PaymentsView />);

    await waitFor(() => {
      expect(screen.queryByText('Cargando pagos...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(/Página 1 de 3/i)).toBeInTheDocument();

    const nextButton = screen.getByText(/Siguiente/i);
    await user.click(nextButton);

    expect(paymentsService.getAll).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 })
    );
  });
});
