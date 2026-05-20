import { useEffect, useState } from 'react';
import { healthApi } from '../services/api';
import type { BffHealth } from '../types';

function ServicePill({ name, status }: { name: string; status: 'UP' | 'DOWN' }) {
  const up = status === 'UP';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '3px 10px', borderRadius: 20,
      background: up ? '#f0fdf4' : '#fef2f2',
      border: `1px solid ${up ? '#bbf7d0' : '#fecaca'}`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: up ? '#16a34a' : '#dc2626',
        display: 'inline-block',
        boxShadow: up ? '0 0 0 2px #dcfce7' : '0 0 0 2px #fee2e2',
      }} />
      <span style={{ fontSize: 11, fontWeight: 500, color: up ? '#15803d' : '#b91c1c' }}>
        {name}
      </span>
    </div>
  );
}

export default function ServiceStatusBar() {
  const [health, setHealth] = useState<BffHealth | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        setHealth(await healthApi.check());
        setLastUpdate(new Date());
      } catch {
        setHealth(null);
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!health) return (
    <div style={{
      background: '#fff7ed', borderBottom: '1px solid #fed7aa',
      padding: '7px 36px', display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f97316', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
      <span style={{ fontSize: 11, color: '#c2410c', fontWeight: 500 }}>
        BFF no disponible — verificando conexión al puerto 3000...
      </span>
    </div>
  );

  const { downstream } = health;
  const allUp = health.status === 'UP';

  return (
    <div style={{
      background: allUp ? '#f8fff8' : '#fff7ed',
      borderBottom: `1px solid ${allUp ? '#d1fae5' : '#fed7aa'}`,
      padding: '7px 36px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      {/* BFF indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '3px 10px', borderRadius: 20,
        background: allUp ? '#ecfdf5' : '#fff7ed',
        border: `1px solid ${allUp ? '#6ee7b7' : '#fbbf24'}`,
        marginRight: 4,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: allUp ? '#059669' : '#d97706', display: 'inline-block' }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: allUp ? '#047857' : '#92400e' }}>BFF</span>
      </div>

      <ServicePill name="Pacientes" status={downstream.paciente.status} />
      <ServicePill name="Solicitudes" status={downstream.solicitud.status} />
      <ServicePill name="Lista de Espera" status={downstream.listaEspera.status} />

      {lastUpdate && (
        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#94a3b8' }}>
          Actualizado: {lastUpdate.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
