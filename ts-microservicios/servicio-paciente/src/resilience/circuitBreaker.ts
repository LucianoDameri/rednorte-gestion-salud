/**
 * Circuit Breaker — servicio-paciente (cockatiel v3)
 * Patrón Circuit Breaker con Retry para llamadas a servicios externos.
 *
 *  CLOSED ──(5 fallos)──► OPEN ──(10s)──► HALF-OPEN ──(éxito)──► CLOSED
 */

import { retry, circuitBreaker, ConsecutiveBreaker, ExponentialBackoff, handleAll, wrap } from 'cockatiel';

const retryPolicy = retry(handleAll, {
  maxAttempts: 2,
  backoff: new ExponentialBackoff({ initialDelay: 100, maxDelay: 500 }),
});

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
}
