/**
 * Clientes HTTP para cada microservicio.
 * El BFF usa estos clientes para llamar a los servicios downstream.
 * El Circuit Breaker (cockatiel) se agregará aquí cuando se defina la estrategia.
 */
import axios from 'axios';

const TIMEOUT = 5000; // 5 segundos

export const pacienteClient = axios.create({
  baseURL: process.env.PACIENTE_SERVICE_URL || 'http://localhost:3001',
  timeout: TIMEOUT,
});

export const solicitudClient = axios.create({
  baseURL: process.env.SOLICITUD_SERVICE_URL || 'http://localhost:3002',
  timeout: TIMEOUT,
});

export const listaEsperaClient = axios.create({
  baseURL: process.env.LISTA_ESPERA_SERVICE_URL || 'http://localhost:3003',
  timeout: TIMEOUT,
});

// Helper para manejar errores de axios de forma uniforme
export function extractError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || error.message;
  }
  return 'Error interno';
}
