/**
<<<<<<< HEAD
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║              CIRCUIT BREAKER - SaludRedNorte                             ║
 * ║              Usando cockatiel (Resilience4j-like para Node.js)            ║
 * ╠═══════════════════════════════════════════════════════════════════════════╣
 * ║  Patrón Circuit Breaker con 3 estados:                                   ║
 * ║                                                                           ║
 * ║   CLOSED ──(fallos > umbral)──► OPEN ──(timeout)──► HALF-OPEN            ║
 * ║      ▲                                                   │               ║
 * ║      └──────────(éxito en prueba)─────────────────────────               ║
 * ║                                                                           ║
 * ║  Estados:                                                                 ║
 * ║  • CLOSED    → Circuito cerrado. Llamadas pasan normalmente.              ║
 * ║  • OPEN      → Circuito abierto. Llamadas bloqueadas (fallback).          ║
 * ║  • HALF-OPEN → Circuito semiabierto. Se permite 1 llamada de prueba.     ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

import {
  CircuitBreakerPolicy,
  circuitBreaker,
  ConsecutiveBreaker,
  ExponentialBackoff,
  retry,
  handleAll,
  wrap,
  IPolicy,
} from 'cockatiel';
import axios from 'axios';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface EspecialidadResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

interface CircuitBreakerMetrics {
  state: CircuitBreakerState;
  totalCalls: number;
  successCalls: number;
  failedCalls: number;
  rejectedCalls: number;
  lastFailureTime: Date | null;
  lastSuccessTime: Date | null;
}

// ─── Métricas (en memoria) ────────────────────────────────────────────────────

const metrics: CircuitBreakerMetrics = {
  state: 'closed',
  totalCalls: 0,
  successCalls: 0,
  failedCalls: 0,
  rejectedCalls: 0,
  lastFailureTime: null,
  lastSuccessTime: null,
};

// ─── Política de Retry con Backoff Exponencial ────────────────────────────────
// Antes de que el circuit breaker actúe, reintenta hasta 2 veces
// con espera exponencial (100ms, 200ms) ante cualquier error.
=======
 * Circuit Breaker — servicio-paciente (cockatiel v3)
 * Patrón Circuit Breaker con Retry para llamadas a servicios externos.
 *
 *  CLOSED ──(5 fallos)──► OPEN ──(10s)──► HALF-OPEN ──(éxito)──► CLOSED
 */

import { retry, circuitBreaker, ConsecutiveBreaker, ExponentialBackoff, handleAll, wrap } from 'cockatiel';
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443

const retryPolicy = retry(handleAll, {
  maxAttempts: 2,
  backoff: new ExponentialBackoff({ initialDelay: 100, maxDelay: 500 }),
});

<<<<<<< HEAD
retryPolicy.onRetry(({ reason }) => {
  console.warn(`[RetryPolicy] Reintentando llamada. Causa: ${reason?.message}`);
});

// ─── Política de Circuit Breaker ──────────────────────────────────────────────
// Abre el circuito tras 3 fallos consecutivos.
// Espera 10 segundos antes de pasar a HALF-OPEN y probar de nuevo.

const cbPolicy: CircuitBreakerPolicy = circuitBreaker(handleAll, {
  halfOpenAfter: 10_000,          // ms antes de pasar a HALF-OPEN
  breaker: new ConsecutiveBreaker(3), // abre tras 3 fallos consecutivos
});

// Escuchar eventos del circuit breaker para actualizar métricas

cbPolicy.onBreak(() => {
  metrics.state = 'open';
  metrics.lastFailureTime = new Date();
  console.error('[CircuitBreaker] 🔴 CIRCUITO ABIERTO — Servicio Especialidad no disponible');
});

cbPolicy.onReset(() => {
  metrics.state = 'closed';
  metrics.lastSuccessTime = new Date();
  console.log('[CircuitBreaker] 🟢 CIRCUITO CERRADO — Servicio Especialidad recuperado');
});

cbPolicy.onHalfOpen(() => {
  metrics.state = 'half-open';
  console.warn('[CircuitBreaker] 🟡 CIRCUITO SEMI-ABIERTO — Probando Servicio Especialidad');
});

// ─── Política combinada: Retry + Circuit Breaker ──────────────────────────────
// El wrap aplica las políticas en orden: CB envuelve al Retry.
// Primero reintenta; si sigue fallando, el CB cuenta el fallo.

const resilientPolicy: IPolicy = wrap(cbPolicy, retryPolicy);

// ─── URL del servicio ─────────────────────────────────────────────────────────

const ESPECIALIDAD_URL = process.env.ESPECIALIDAD_SERVICE_URL || 'http://localhost:3002';

// ─── Función principal con circuit breaker ────────────────────────────────────

/**
 * Obtiene el nombre de una especialidad desde el microservicio de Especialidades.
 * Aplica el patrón Circuit Breaker + Retry para manejar fallos.
 *
 * @param especialidadId ID de la especialidad a consultar
 * @returns Nombre de la especialidad, o null si el circuito está abierto (fallback)
 */
export async function getEspecialidadConCircuitBreaker(
  especialidadId: number
): Promise<EspecialidadResponse | null> {
  metrics.totalCalls++;

  try {
    const resultado = await resilientPolicy.execute(async () => {
      const response = await axios.get<EspecialidadResponse>(
        `${ESPECIALIDAD_URL}/especialidad/${especialidadId}`,
        { timeout: 3000 }
      );
      return response.data;
    });

    metrics.successCalls++;
    metrics.lastSuccessTime = new Date();
    return resultado;

  } catch (error: any) {
    // Si el circuito está abierto, cockatiel lanza un BrokenCircuitError
    if (error?.name === 'BrokenCircuitError') {
      metrics.rejectedCalls++;
      console.warn(
        `[CircuitBreaker] ⛔ Llamada rechazada para especialidad ${especialidadId} — circuito ABIERTO`
      );
    } else {
      metrics.failedCalls++;
      metrics.lastFailureTime = new Date();
      console.error(
        `[CircuitBreaker] ❌ Fallo al consultar especialidad ${especialidadId}:`,
        error?.message
      );
    }

    // Fallback: devolvemos null para que el controlador maneje la respuesta degradada
    return null;
  }
}

// ─── Obtener métricas del circuit breaker ─────────────────────────────────────

export function getCircuitBreakerStatus(): CircuitBreakerMetrics & { serviceUrl: string } {
  return {
    ...metrics,
    serviceUrl: ESPECIALIDAD_URL,
  };
}

/**
 * Resetea manualmente el circuit breaker (útil para testing/admin).
 */
export function resetCircuitBreaker(): void {
  // cockatiel no expone un método de reset directo en ConsecutiveBreaker,
  // pero podemos loguear para fines de monitoring.
  console.warn('[CircuitBreaker] Reset manual solicitado (solo logging — use reinicio del servicio para reset completo)');
=======
const cbPolicy = circuitBreaker(handleAll, {
  halfOpenAfter: 10_000,
  breaker: new ConsecutiveBreaker(5),
});

cbPolicy.onBreak(()     => console.error('[CircuitBreaker] 🔴 ABIERTO'));
cbPolicy.onReset(()     => console.log('[CircuitBreaker] 🟢 CERRADO'));
cbPolicy.onHalfOpen(()  => console.warn('[CircuitBreaker] 🟡 SEMI-ABIERTO'));

/** Política combinada: el CB envuelve al Retry */
export const resilientPolicy = wrap(cbPolicy, retryPolicy);

/** Ejecuta fn con Retry + Circuit Breaker */
export async function withResilience<T>(fn: () => Promise<T>): Promise<T> {
  return resilientPolicy.execute(fn);
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
}
