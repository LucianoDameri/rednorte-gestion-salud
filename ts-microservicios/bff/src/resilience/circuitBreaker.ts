/**
 * Circuit Breaker — BFF SaludRedNorte
 * Patrón: Circuit Breaker (cockatiel v3 — API funcional)
 *
 * Estados del circuito:
 *  CLOSED   → operación normal, peticiones fluyen normalmente
 *  OPEN     → demasiados fallos; las peticiones se rechazan inmediatamente
 *  HALF_OPEN → estado de prueba; se permite una petición para verificar recuperación
 *
 * Configuración por servicio:
 *  - Retry:            2 reintentos con backoff exponencial (100ms base)
 *  - Circuit Breaker:  5 fallos consecutivos abren el circuito
 *  - halfOpenAfter:    10 segundos antes de pasar a HALF_OPEN
 */

import {
  retry,
  circuitBreaker,
  wrap,
  ConsecutiveBreaker,
  ExponentialBackoff,
  handleAll,
} from 'cockatiel';

// ─── Fábrica: combina Retry + Circuit Breaker para un servicio ────────────────
function makePolicy(name: string) {
  const retryPolicy = retry(handleAll, {
    maxAttempts: 2,
    backoff: new ExponentialBackoff({ initialDelay: 100 }),
  });

  const cbPolicy = circuitBreaker(handleAll, {
    halfOpenAfter: 10_000,
    breaker: new ConsecutiveBreaker(5),
  });

  cbPolicy.onBreak(() =>
    console.warn(`[CircuitBreaker] ⚡ ABIERTO  — ${name} no responde`)
  );
  cbPolicy.onReset(() =>
    console.info(`[CircuitBreaker] ✅ CERRADO  — ${name} recuperado`)
  );
  cbPolicy.onHalfOpen(() =>
    console.info(`[CircuitBreaker] 🔁 SEMI-ABIERTO — probando ${name}...`)
  );

  // wrap: el retry está dentro del circuit breaker
  return wrap(cbPolicy, retryPolicy);
}

// ─── Políticas por servicio ───────────────────────────────────────────────────
export const pacientePolicy    = makePolicy('servicio-paciente');
export const solicitudPolicy   = makePolicy('servicio-solicitudes');
export const listaEsperaPolicy = makePolicy('servicio-lista-espera');

// ─── Helper de ejecución con resiliencia ─────────────────────────────────────
export async function withResilience<T>(
  policy: ReturnType<typeof makePolicy>,
  fn: () => Promise<T>
): Promise<T> {
  return policy.execute(fn);
}
