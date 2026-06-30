/**
 * El frontend SOLO habla con el BFF.
 * El BFF (puerto 3000) coordina con los 3 microservicios internamente.
<<<<<<< HEAD
 * El token JWT se adjunta automáticamente via axios.defaults (seteado en AuthContext).
=======
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
 */
import axios from 'axios';
import type { Paciente, Solicitud, ListaEspera, BffHealth } from '../types';

const bff = axios.create({ baseURL: '/bff' });

<<<<<<< HEAD
// Interceptor: adjunta el token JWT si está disponible en localStorage
bff.interceptors.request.use(config => {
  const token = localStorage.getItem('saludrednorte_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

=======
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
// ─── Pacientes ─────────────────────────────────────────────────────────────────
export const pacienteApi = {
  listar: () => bff.get<Paciente[]>('/paciente').then(r => r.data),
  obtener: (id: number) => bff.get<Paciente>(`/paciente/${id}`).then(r => r.data),
  crear: (data: Omit<Paciente, 'id' | 'createdAt' | 'updatedAt' | 'solicitudes'>) =>
    bff.post<Paciente>('/paciente', data).then(r => r.data),
  actualizar: (id: number, data: Partial<Paciente>) =>
    bff.put<Paciente>(`/paciente/${id}`, data).then(r => r.data),
  eliminar: (id: number) => bff.delete(`/paciente/${id}`).then(r => r.data),
};

// ─── Solicitudes ───────────────────────────────────────────────────────────────
export const solicitudApi = {
  listar: (params?: { pacienteId?: number; especialidadId?: number }) =>
    bff.get<Solicitud[]>('/solicitud', { params }).then(r => r.data),
  obtener: (id: number) => bff.get<Solicitud>(`/solicitud/${id}`).then(r => r.data),
  crear: (data: Omit<Solicitud, 'id' | 'createdAt' | 'updatedAt'> & { prioridad?: string }) =>
    bff.post<Solicitud & { listaEspera: ListaEspera | null }>('/solicitud', data).then(r => r.data),
  actualizar: (id: number, data: Partial<Solicitud>) =>
    bff.put<Solicitud>(`/solicitud/${id}`, data).then(r => r.data),
  eliminar: (id: number) => bff.delete(`/solicitud/${id}`).then(r => r.data),
};

// ─── Lista de Espera ───────────────────────────────────────────────────────────
export const listaEsperaApi = {
  listar: (params?: { estado?: string; prioridad?: string; pacienteId?: number }) =>
    bff.get<ListaEspera[]>('/lista-espera', { params }).then(r => r.data),
  resumen: () =>
    bff.get<{ total: number; enEspera: number; asignada: number; atendida: number; cancelada: number; urgentes: number }>('/lista-espera/resumen').then(r => r.data),
  actualizar: (id: number, data: Partial<ListaEspera>) =>
    bff.put<ListaEspera>(`/lista-espera/${id}`, data).then(r => r.data),
  eliminar: (id: number) => bff.delete(`/lista-espera/${id}`).then(r => r.data),
};

// ─── Health del BFF ────────────────────────────────────────────────────────────
export const healthApi = {
<<<<<<< HEAD
  check: () => axios.get<BffHealth>('/health').then(r => r.data),
=======
  check: () => axios.get<BffHealth>('http://localhost:3000/health').then(r => r.data),
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
};
