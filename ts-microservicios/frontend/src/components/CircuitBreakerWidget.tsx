import { useEffect, useState, useCallback } from 'react';
import { circuitBreakerService } from '../services/api';
import type { CircuitBreakerStatus } from '../types';

const STATE_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  closed:      { bg: '#f0fdf4', border: '#16a34a', text: '#15803d', dot: '#16a34a' },
  open:        { bg: '#fef2f2', border: '#dc2626', text: '#b91c1c', dot: '#dc2626' },
  'half-open': { bg: '#fefce8', border: '#ca8a04', text: '#a16207', dot: '#ca8a04' },
};

const STATE_ICONS: Record<string, string> = {
  closed: '🟢',
  open: '🔴',
  'half-open': '🟡',
};

export default function CircuitBreakerWidget() {
  const [status, setStatus] = useState<CircuitBreakerStatus | null>(null);
  const [error, setError] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const data = await circuitBreakerService.status();
      setStatus(data);
      setLastUpdate(new Date());
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Refresca cada 5s
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (error) {
    return (
      <div style={{ padding: '12px 16px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 16 }}>
        <span style={{ color: '#6b7280', fontSize: 13 }}>⚠️ No se puede conectar al servicio de pacientes para obtener estado del Circuit Breaker</span>
      </div>
    );
  }

  if (!status) return <div style={{ padding: 12, fontSize: 13, color: '#6b7280' }}>Cargando Circuit Breaker...</div>;

  const colors = STATE_COLORS[status.state] || STATE_COLORS['closed'];
  const successRate = status.totalCalls > 0
    ? Math.round((status.successCalls / status.totalCalls) * 100)
    : 100;

  return (
    <div style={{
      background: colors.bg,
      border: `2px solid ${colors.border}`,
      borderRadius: 10,
      padding: '14px 18px',
      marginBottom: 20,
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{STATE_ICONS[status.state]}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: colors.text }}>
              Circuit Breaker — {status.state.toUpperCase()}
            </div>
            <div style={{ fontSize: 12, color: colors.text, opacity: 0.85 }}>
              {status.description}
            </div>
          </div>
        </div>
        <button
          onClick={fetchStatus}
          title="Actualizar"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 16, color: colors.text }}
        >
          ↻
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 10 }}>
        {[
          { label: 'Total', value: status.totalCalls, color: '#374151' },
          { label: 'Éxitos', value: status.successCalls, color: '#16a34a' },
          { label: 'Fallos', value: status.failedCalls, color: '#dc2626' },
          { label: 'Rechazadas', value: status.rejectedCalls, color: '#ca8a04' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ textAlign: 'center', background: 'white', borderRadius: 6, padding: '6px 4px', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Barra de éxito */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6b7280', marginBottom: 3 }}>
          <span>Tasa de éxito</span>
          <span>{successRate}%</span>
        </div>
        <div style={{ height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${successRate}%`,
            background: successRate > 70 ? '#16a34a' : successRate > 40 ? '#ca8a04' : '#dc2626',
            borderRadius: 3,
            transition: 'width 0.4s ease',
          }} />
        </div>
      </div>

      <div style={{ fontSize: 11, color: '#6b7280', display: 'flex', justifyContent: 'space-between' }}>
        <span>🌐 {status.serviceUrl}</span>
        {lastUpdate && <span>Actualizado: {lastUpdate.toLocaleTimeString()}</span>}
      </div>
    </div>
  );
}
