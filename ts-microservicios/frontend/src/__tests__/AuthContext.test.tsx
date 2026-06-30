/**
 * Pruebas unitarias: AuthContext
 */
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';

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

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('estado inicial: no autenticado', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.usuario).toBeNull();
    expect(result.current.token).toBeNull();
  });

  it('login exitoso actualiza el estado', async () => {
    const axiosMock = axios as any;
    axiosMock.post.mockResolvedValueOnce({
      data: {
        token: 'jwt-abc123',
        usuario: { id: 'u1', username: 'recepcionista', nombre: 'María', rol: 'RECEPCIONISTA' },
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('recepcionista', 'rec123');
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('jwt-abc123');
    expect(result.current.usuario?.rol).toBe('RECEPCIONISTA');
    expect(result.current.isRecepcionista).toBe(true);
    expect(result.current.isMedico).toBe(false);
  });

  it('login con rol MEDICO actualiza isMedico', async () => {
    const axiosMock = axios as any;
    axiosMock.post.mockResolvedValueOnce({
      data: {
        token: 'jwt-medico',
        usuario: { id: 'u2', username: 'dr.garcia', nombre: 'Dr. García', rol: 'MEDICO' },
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.login('dr.garcia', 'med123'); });

    expect(result.current.isMedico).toBe(true);
    expect(result.current.isRecepcionista).toBe(false);
  });

  it('login guarda token en localStorage', async () => {
    const axiosMock = axios as any;
    axiosMock.post.mockResolvedValueOnce({
      data: {
        token: 'jwt-stored',
        usuario: { id: 'u1', username: 'recepcionista', nombre: 'María', rol: 'RECEPCIONISTA' },
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.login('recepcionista', 'rec123'); });

    expect(localStorage.getItem('saludrednorte_token')).toBe('jwt-stored');
  });

  it('logout limpia el estado y localStorage', async () => {
    const axiosMock = axios as any;
    axiosMock.post.mockResolvedValueOnce({
      data: {
        token: 'jwt-abc',
        usuario: { id: 'u1', username: 'recepcionista', nombre: 'María', rol: 'RECEPCIONISTA' },
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => { await result.current.login('recepcionista', 'rec123'); });
    act(() => { result.current.logout(); });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.token).toBeNull();
    expect(result.current.usuario).toBeNull();
    expect(localStorage.getItem('saludrednorte_token')).toBeNull();
  });

  it('login fallido lanza excepción', async () => {
    const axiosMock = axios as any;
    axiosMock.post.mockRejectedValueOnce({ response: { data: { error: 'Credenciales inválidas' } } });

    const { result } = renderHook(() => useAuth(), { wrapper });
    await expect(act(async () => { await result.current.login('x', 'wrong'); })).rejects.toBeDefined();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('restaura sesión desde localStorage', async () => {
    const usuario = { id: 'u1', username: 'recepcionista', nombre: 'María', rol: 'RECEPCIONISTA' };
    localStorage.setItem('saludrednorte_token', 'jwt-stored');
    localStorage.setItem('saludrednorte_usuario', JSON.stringify(usuario));

    const { result } = renderHook(() => useAuth(), { wrapper });

    // Esperar a que se resuelva el useEffect inicial
    await act(async () => { await new Promise(r => setTimeout(r, 10)); });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.usuario?.nombre).toBe('María');
  });

  it('lanza error si useAuth se usa fuera de AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow();
  });
});
