/**
 * Pruebas unitarias: servicios API (interceptor de token)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock del módulo axios antes de importar api.ts
vi.mock('axios', async () => {
  const mockInstance = {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn((fn) => { (mockInstance as any)._reqInterceptor = fn; }) },
    },
  };
  return {
    default: {
      create: vi.fn(() => mockInstance),
      get: vi.fn(),
      defaults: { headers: { common: {} } },
    },
    __mockInstance: mockInstance,
  };
});

import axios from 'axios';
import { pacienteApi, solicitudApi, listaEsperaApi } from '../services/api';

const mockInstance = (axios as any).__mockInstance ||
  (axios.create as ReturnType<typeof vi.fn>).mock.results[0]?.value;

describe('pacienteApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('listar llama GET /paciente', async () => {
    mockInstance.get.mockResolvedValueOnce({ data: [] });
    await pacienteApi.listar();
    expect(mockInstance.get).toHaveBeenCalledWith('/paciente');
  });

  it('obtener llama GET /paciente/:id', async () => {
    mockInstance.get.mockResolvedValueOnce({ data: { id: 1 } });
    await pacienteApi.obtener(1);
    expect(mockInstance.get).toHaveBeenCalledWith('/paciente/1');
  });

  it('crear llama POST /paciente con datos correctos', async () => {
    const datos = { rut: '11111111-1', nombre: 'Juan', apellido: 'Pérez', email: '', telefono: '' };
    mockInstance.post.mockResolvedValueOnce({ data: { id: 1, ...datos } });
    await pacienteApi.crear(datos);
    expect(mockInstance.post).toHaveBeenCalledWith('/paciente', datos);
  });

  it('actualizar llama PUT /paciente/:id', async () => {
    mockInstance.put.mockResolvedValueOnce({ data: { id: 1, nombre: 'Nuevo' } });
    await pacienteApi.actualizar(1, { nombre: 'Nuevo' });
    expect(mockInstance.put).toHaveBeenCalledWith('/paciente/1', { nombre: 'Nuevo' });
  });

  it('eliminar llama DELETE /paciente/:id', async () => {
    mockInstance.delete.mockResolvedValueOnce({ data: { message: 'Eliminado' } });
    await pacienteApi.eliminar(1);
    expect(mockInstance.delete).toHaveBeenCalledWith('/paciente/1');
  });
});

describe('solicitudApi', () => {
  it('listar sin parámetros', async () => {
    mockInstance.get.mockResolvedValueOnce({ data: [] });
    await solicitudApi.listar();
    expect(mockInstance.get).toHaveBeenCalledWith('/solicitud', { params: undefined });
  });

  it('listar con filtro de pacienteId', async () => {
    mockInstance.get.mockResolvedValueOnce({ data: [] });
    await solicitudApi.listar({ pacienteId: 5 });
    expect(mockInstance.get).toHaveBeenCalledWith('/solicitud', { params: { pacienteId: 5 } });
  });
});

describe('listaEsperaApi', () => {
  it('resumen llama GET /lista-espera/resumen', async () => {
    mockInstance.get.mockResolvedValueOnce({ data: { total: 10 } });
    await listaEsperaApi.resumen();
    expect(mockInstance.get).toHaveBeenCalledWith('/lista-espera/resumen');
  });

  it('actualizar llama PUT /lista-espera/:id', async () => {
    mockInstance.put.mockResolvedValueOnce({ data: {} });
    await listaEsperaApi.actualizar(3, { estado: 'ATENDIDA' });
    expect(mockInstance.put).toHaveBeenCalledWith('/lista-espera/3', { estado: 'ATENDIDA' });
  });
});
