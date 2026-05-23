import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MedicalCertificatesView } from './MedicalCertificates';
import { medicalCertificatesService } from '../services/medical-certificates';
import { membersService } from '../services/members';
import { Provider } from '../components/ui/provider';

import type { MedicalCertificateDTO, MemberDTO } from '@alentapp/shared';

vi.mock('../services/medical-certificates', () => ({
  medicalCertificatesService: {
    getActive: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../services/members', () => ({
  membersService: {
    getAll: vi.fn(),
  },
}));

const mockMembers: MemberDTO[] = [
  {
    id: 'm1',
    name: 'Juan Pérez',
    dni: '12345678',
    email: 'juan@test.com',
    birthdate: '1990-01-01',
    category: 'Pleno',
    status: 'Activo',
    created_at: '',
  },
  {
    id: 'm2',
    name: 'María García',
    dni: '87654321',
    email: 'maria@test.com',
    birthdate: '1995-05-15',
    category: 'Cadete',
    status: 'Activo',
    created_at: '',
  },
];

function createCertificate(
  overrides: Partial<MedicalCertificateDTO> = {},
): MedicalCertificateDTO {
  return {
    id: 'c1',
    memberId: 'm1',
    issueDate: '2026-05-01T00:00:00.000Z',
    expirationDate: '2026-12-31T00:00:00.000Z',
    isActive: true,
    description: 'Certificado de aptitud física',
    doctorName: 'Dr. López',
    created_at: '2026-05-01T00:00:00.000Z',
    ...overrides,
  };
}

async function selectMemberOption(
  user: ReturnType<Awaited<typeof import('@testing-library/user-event')>['default']['setup']>,
) {
  // Chakra UI Select v3 renders a trigger button with role="combobox"
  const trigger = screen.getByRole('combobox', { name: /socio/i });
  await user.click(trigger);

  // Select the first option (Juan Pérez)
  const option = await screen.findByRole('option', { name: 'Juan Pérez' });
  await user.click(option);
}

describe('MedicalCertificatesView', () => {
  const renderWithProviders = (ui: React.ReactElement) => {
    return render(<Provider>{ui}</Provider>);
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe cargar la lista de socios y mostrar el mensaje inicial', async () => {
    vi.mocked(membersService.getAll).mockResolvedValueOnce(mockMembers);

    renderWithProviders(<MedicalCertificatesView />);

    await waitFor(() => {
      expect(membersService.getAll).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.getByText(
        'Seleccioná un socio para ver su certificado médico activo',
      ),
    ).toBeInTheDocument();
  });

  it('debe mostrar "No hay certificado activo" si el socio no tiene uno', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    vi.mocked(membersService.getAll).mockResolvedValueOnce(mockMembers);
    vi.mocked(medicalCertificatesService.getActive).mockResolvedValueOnce(null);

    renderWithProviders(<MedicalCertificatesView />);

    await waitFor(() => {
      expect(membersService.getAll).toHaveBeenCalled();
    });

    await selectMemberOption(user);

    await waitFor(() => {
      expect(
        screen.getByText('No hay certificado activo'),
      ).toBeInTheDocument();
    });
  });

  it('debe mostrar los detalles del certificado activo', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();
    const certificate = createCertificate();

    vi.mocked(membersService.getAll).mockResolvedValueOnce(mockMembers);
    vi.mocked(medicalCertificatesService.getActive).mockResolvedValueOnce(
      certificate,
    );

    renderWithProviders(<MedicalCertificatesView />);

    await waitFor(() => {
      expect(membersService.getAll).toHaveBeenCalled();
    });

    await selectMemberOption(user);

    await waitFor(() => {
      expect(screen.getByText('Certificado Activo')).toBeInTheDocument();
    });

    expect(screen.getByText('Activo')).toBeInTheDocument();
    expect(screen.getByText(/Dr. López/)).toBeInTheDocument();
    expect(
      screen.getByText(/Certificado de aptitud física/),
    ).toBeInTheDocument();
  });

  it('debe mostrar un error si el servicio falla', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    vi.mocked(membersService.getAll).mockResolvedValueOnce(mockMembers);
    vi.mocked(medicalCertificatesService.getActive).mockRejectedValueOnce(
      new Error('Error de conexión'),
    );

    renderWithProviders(<MedicalCertificatesView />);

    await waitFor(() => {
      expect(membersService.getAll).toHaveBeenCalled();
    });

    await selectMemberOption(user);

    await waitFor(() => {
      expect(screen.getByText('Error de conexión')).toBeInTheDocument();
    });
  });

  it('debe abrir el modal de creación al hacer clic en Nuevo Certificado', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    vi.mocked(membersService.getAll).mockResolvedValueOnce(mockMembers);
    vi.mocked(medicalCertificatesService.getActive).mockResolvedValueOnce(null);

    renderWithProviders(<MedicalCertificatesView />);

    await waitFor(() => {
      expect(membersService.getAll).toHaveBeenCalled();
    });

    await selectMemberOption(user);

    await waitFor(() => {
      expect(
        screen.getByText('No hay certificado activo'),
      ).toBeInTheDocument();
    });

    const addButton = screen.getByText(/Nuevo Certificado/i);
    await user.click(addButton);

    expect(
      screen.getByText('Nuevo Certificado Médico'),
    ).toBeInTheDocument();
  });

  it('debe permitir crear un certificado mediante el formulario', async () => {
    const user = (await import('@testing-library/user-event')).default.setup();

    vi.mocked(membersService.getAll).mockResolvedValueOnce(mockMembers);
    vi.mocked(medicalCertificatesService.getActive).mockResolvedValueOnce(null);
    vi.mocked(medicalCertificatesService.create).mockResolvedValueOnce(
      createCertificate({ id: 'new1' }),
    );

    renderWithProviders(<MedicalCertificatesView />);

    await waitFor(() => {
      expect(membersService.getAll).toHaveBeenCalled();
    });

    await selectMemberOption(user);

    await waitFor(() => {
      expect(
        screen.getByText('No hay certificado activo'),
      ).toBeInTheDocument();
    });

    // Open create modal
    const addButton = screen.getByText(/Nuevo Certificado/i);
    await user.click(addButton);

    await waitFor(() => {
      expect(
        screen.getByText('Nuevo Certificado Médico'),
      ).toBeInTheDocument();
    });

    // Fill form
    const descInput = screen.getByPlaceholderText(/aptitud/i);
    await user.type(descInput, 'Nuevo certificado');

    const doctorInput = screen.getByPlaceholderText('Nombre del médico');
    await user.type(doctorInput, 'Dr. García');

    const dateInput = screen.getByLabelText(/Fecha de vencimiento/i);
    await user.clear(dateInput);
    await user.type(dateInput, '2027-01-15');

    // Submit
    const submitButton = screen.getByText('Crear Certificado');
    await user.click(submitButton);

    expect(medicalCertificatesService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        memberId: 'm1',
        description: 'Nuevo certificado',
        doctorName: 'Dr. García',
        expirationDate: '2027-01-15',
      }),
    );
  });
});
