/**
 * Pruebas unitarias: LoginPage
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import { AuthProvider } from '../context/AuthContext';

// Mock de axios para controlar llamadas al BFF
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    ...actual,
    default: {
      ...(actual as any).default,
      post: vi.fn(),
      defaults: { headers: { common: {} } },
    },
  };
});

import axios from 'axios';

function renderLogin() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renderiza el formulario de login', () => {
    renderLogin();
    expect(screen.getByTestId('input-username')).toBeInTheDocument();
    expect(screen.getByTestId('input-password')).toBeInTheDocument();
    expect(screen.getByTestId('btn-login')).toBeInTheDocument();
  });

  it('muestra el título SaludRedNorte', () => {
    renderLogin();
    expect(screen.getByText('SaludRedNorte')).toBeInTheDocument();
  });

  it('muestra los usuarios de prueba', () => {
    renderLogin();
    expect(screen.getByText('recepcionista')).toBeInTheDocument();
    expect(screen.getByText('dr.garcia')).toBeInTheDocument();
  });

  it('muestra error cuando el servidor responde 401', async () => {
    const axiosMock = axios as any;
    axiosMock.post.mockRejectedValueOnce({
      response: { data: { error: 'Credenciales inválidas' } },
    });

    renderLogin();
    fireEvent.change(screen.getByTestId('input-username'), { target: { value: 'malo' } });
    fireEvent.change(screen.getByTestId('input-password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByTestId('btn-login'));

    await waitFor(() => {
      expect(screen.getByTestId('login-error')).toBeInTheDocument();
    });
    expect(screen.getByTestId('login-error')).toHaveTextContent('Credenciales inválidas');
  });

  it('no muestra error inicialmente', () => {
    renderLogin();
    expect(screen.queryByTestId('login-error')).not.toBeInTheDocument();
  });

  it('deshabilita el botón mientras carga', async () => {
    const axiosMock = axios as any;
    // Promesa que nunca resuelve (simula carga)
    axiosMock.post.mockReturnValueOnce(new Promise(() => {}));

    renderLogin();
    fireEvent.change(screen.getByTestId('input-username'), { target: { value: 'recepcionista' } });
    fireEvent.change(screen.getByTestId('input-password'), { target: { value: 'rec123' } });
    fireEvent.click(screen.getByTestId('btn-login'));

    await waitFor(() => {
      expect(screen.getByTestId('btn-login')).toBeDisabled();
    });
  });

  it('llama a login con los valores correctos del form', async () => {
    const axiosMock = axios as any;
    axiosMock.post.mockResolvedValueOnce({
      data: {
        token: 'fake-token-123',
        usuario: { id: 'u1', username: 'recepcionista', nombre: 'María', rol: 'RECEPCIONISTA' },
      },
    });

    renderLogin();
    fireEvent.change(screen.getByTestId('input-username'), { target: { value: 'recepcionista' } });
    fireEvent.change(screen.getByTestId('input-password'), { target: { value: 'rec123' } });
    fireEvent.click(screen.getByTestId('btn-login'));

    await waitFor(() => {
      expect(axiosMock.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        { username: 'recepcionista', password: 'rec123' }
      );
    });
  });
});
