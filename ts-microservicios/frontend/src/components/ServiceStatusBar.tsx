import { useEffect, useState } from 'react';
import { healthApi } from '../services/api';
import type { BffHealth } from '../types';

export default function ServiceStatusBar() {
  const [health, setHealth]       = useState<BffHealth | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const check = async () => {
      try { setHealth(await healthApi.check()); setLastUpdate(new Date()); }
      catch { setHealth(null); }
    };
    check();
    const id = setInterval(check, 10_000);
    return () => clearInterval(id);
  }, []);

  if (!health) return (
    <div className="status-bar" style={{ background: '#fef2f2', borderColor: '#fecaca' }}>
      <div className="status-bar-inner">
        <span style={{ color: '#dc2626', fontWeight: 600 }}>
          ⚠️ BFF no disponible
        </span>
        <span style={{ color: '#9ca3af' }}>Verifica que el contenedor BFF esté corriendo en el puerto 3000</span>
      </div>
    </div>
  );

  const { downstream } = health;
  const svcs = [
    { label: 'Pacientes',     up: downstream.paciente.status    === 'UP' },
    { label: 'Solicitudes',   up: downstream.solicitud.status   === 'UP' },
    { label: 'Lista Espera',  up: downstream.listaEspera.status === 'UP' },
  ];
  const allUp = svcs.every(s => s.up);

  return (
    <div className="status-bar" style={{
      background: allUp ? '#f0fdf4' : '#fffbeb',
      borderColor: allUp ? '#bbf7d0' : '#fde68a',
    }}>
      <div className="status-bar-inner" style={{ color: '#374151' }}>
        <span style={{ fontWeight: 700, color: allUp ? '#15803d' : '#92400e' }}>
          BFF {health.status}
        </span>
        {svcs.map(({ label, up }) => (
          <span key={label}>
            <span className={`status-dot ${up ? 'status-dot-up' : 'status-dot-down'}`} />
            {label}
          </span>
        ))}
        {lastUpdate && (
          <span style={{ marginLeft: 'auto', color: '#9ca3af' }}>
            Última verificación: {lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>
    </div>
  );
}
