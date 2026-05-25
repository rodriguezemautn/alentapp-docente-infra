import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HomeView } from './Home';
import { MemoryRouter } from 'react-router';
import { Provider } from '../components/ui/provider';

describe('HomeView', () => {
    const renderWithProviders = (ui: React.ReactElement) => {
        return render(
            <MemoryRouter>
                <Provider>
                    {ui}
                </Provider>
            </MemoryRouter>
        );
    };

    it('debe renderizar el título de bienvenida', () => {
        renderWithProviders(<HomeView />);
        expect(screen.getByText('Bienvenido a Alentapp')).toBeInTheDocument();
    });

    it('debe contener todas las tarjetas de secciones', () => {
        renderWithProviders(<HomeView />);
        
        // Cards de navegación
        expect(screen.getByText('Miembros')).toBeInTheDocument();
        expect(screen.getByText('Deportes')).toBeInTheDocument();
        expect(screen.getByText('Pagos')).toBeInTheDocument();
        expect(screen.getByText('Certificados Médicos')).toBeInTheDocument();
        expect(screen.getByText('Disciplinas')).toBeInTheDocument();
    });
});
