import { useEffect, useState } from 'react';
<<<<<<< HEAD
import { listaEsperaApi, pacienteApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { ListaEspera, Paciente } from '../types';

const PRIOR_ORDER: Record<string, number> = { URGENTE: 0, ALTA: 1, NORMAL: 2, BAJA: 3 };

const ESTADOS    = ['EN_ESPERA', 'ASIGNADA', 'ATENDIDA', 'CANCELADA'];
const PRIORIDADES = ['URGENTE', 'ALTA', 'NORMAL', 'BAJA'];

const ESTADO_BADGE: Record<string, string> = {
  EN_ESPERA: 'badge-warning',
  ASIGNADA:  'badge-info',
  ATENDIDA:  'badge-success',
  CANCELADA: 'badge-danger',
};

const PRIOR_COLOR: Record<string, string> = {
  URGENTE: '#dc2626', ALTA: '#ea580c', NORMAL: '#16a34a', BAJA: '#94a3b8',
};

export default function ListaEsperaPage() {
  const { isRecepcionista, isMedico, usuario } = useAuth();
  const [lista, setLista]                 = useState<ListaEspera[]>([]);
  const [pacMap, setPacMap]               = useState<Map<number, Paciente>>(new Map());
  const [resumen, setResumen]             = useState<any>(null);
  const [loading, setLoading]             = useState(true);
  const [filtroEstado, setFiltroEstado]   = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [editId, setEditId]               = useState<number | null>(null);
  const [editForm, setEditForm]           = useState<Partial<ListaEspera>>({});

  const cargar = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filtroEstado)    params.estado    = filtroEstado;
      if (filtroPrioridad) params.prioridad = filtroPrioridad;
      const [l, r, pacs] = await Promise.all([
        listaEsperaApi.listar(params).catch(() => []),
        listaEsperaApi.resumen().catch(() => null),
        pacienteApi.listar().catch(() => []),
      ]);
      setLista(Array.isArray(l) ? l : []);
      setResumen(r);
      setPacMap(new Map((Array.isArray(pacs) ? pacs : []).map((p: Paciente) => [p.id, p])));
    } finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, [filtroEstado, filtroPrioridad]);

  const handleActualizar = async (id: number) => {
    try { await listaEsperaApi.actualizar(id, editForm); setEditId(null); setEditForm({}); cargar(); }
    catch (err: any) { alert(err.response?.data?.error || 'Error al actualizar'); }
  };

  const handleAtender = async (item: ListaEspera) => {
    if (!confirm(`¿Marcar turno #${item.numeroTurno || item.id} como ATENDIDA?`)) return;
    try { await listaEsperaApi.actualizar(item.id, { estado: 'ATENDIDA' }); cargar(); }
    catch (err: any) { alert(err.response?.data?.error || 'Error'); }
  };

  const handleCancelar = async (item: ListaEspera) => {
    if (!confirm(`¿Cancelar turno #${item.numeroTurno || item.id}?`)) return;
    try { await listaEsperaApi.actualizar(item.id, { estado: 'CANCELADA' }); cargar(); }
    catch (err: any) { alert(err.response?.data?.error || 'Error'); }
  };

  const stats = resumen ? [
    { label: 'Total',      value: resumen.total,     accent: '#475569' },
    { label: 'En Espera',  value: resumen.enEspera,  accent: '#d97706' },
    { label: 'Asignadas',  value: resumen.asignada,  accent: '#2563eb' },
    { label: 'Atendidas',  value: resumen.atendida,  accent: '#16a34a' },
    { label: 'Canceladas', value: resumen.cancelada, accent: '#dc2626' },
    { label: '🚨 Urgentes',value: resumen.urgentes,  accent: '#dc2626' },
  ] : [];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Lista de Espera</h1>
          <p className="page-subtitle">
            {isMedico
              ? `Vista médico — ${usuario?.nombre} · marcar como Atendida / Cancelada`
              : `${lista.length} entrada${lista.length !== 1 ? 's' : ''} activas`
            }
          </p>
        </div>
        <div className="page-controls">
          <select
            className="form-input"
            value={filtroEstado}
            onChange={e => setFiltroEstado(e.target.value)}
            style={{ width: 160 }}
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map(e => <option key={e}>{e}</option>)}
          </select>
          <select
            className="form-input"
            value={filtroPrioridad}
            onChange={e => setFiltroPrioridad(e.target.value)}
            style={{ width: 170 }}
          >
            <option value="">Todas las prioridades</option>
            {PRIORIDADES.map(p => <option key={p}>{p}</option>)}
          </select>
          {(filtroEstado || filtroPrioridad) && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => { setFiltroEstado(''); setFiltroPrioridad(''); }}
            >
              ✕ Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Stat cards */}
      {resumen && (
        <div className="stat-grid">
          {stats.map(({ label, value, accent }) => (
            <div
              className="stat-card"
              key={label}
              style={{ '--stat-accent': accent } as React.CSSProperties}
            >
              <div className="stat-value">{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabla */}
      {loading
        ? <p className="loading-text">Cargando lista de espera…</p>
        : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  {['Turno', 'Solicitud', 'Paciente', 'Estado', 'Prioridad', 'Fecha Estimada', 'Observaciones', 'Acciones'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lista.length === 0
                  ? <tr><td className="table-empty" colSpan={8}>Sin entradas en la lista</td></tr>
                  : [...lista].sort((a, b) => (PRIOR_ORDER[a.prioridad] ?? 9) - (PRIOR_ORDER[b.prioridad] ?? 9)).map(item => (
                    <tr key={item.id}>
                      <td>
                        <span style={{ fontWeight: 800, fontSize: 16, color: '#2563eb' }}>
                          #{item.numeroTurno || item.id}
                        </span>
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: 12 }}>#{item.solicitudId}</td>
                      <td style={{ fontWeight: 600 }}>
                        {pacMap.has(item.pacienteId)
                          ? `${pacMap.get(item.pacienteId)!.nombre} ${pacMap.get(item.pacienteId)!.apellido}`
                          : <span style={{ color: '#94a3b8' }}>#{item.pacienteId}</span>
                        }
                      </td>

                      {/* Estado */}
                      <td>
                        {editId === item.id && isRecepcionista ? (
                          <select
                            className="form-input"
                            value={editForm.estado || item.estado}
                            onChange={e => setEditForm({ ...editForm, estado: e.target.value as ListaEspera['estado'] })}
                            style={{ padding: '5px 8px', fontSize: 12, width: 'auto' }}
                          >
                            {ESTADOS.map(e => <option key={e}>{e}</option>)}
                          </select>
                        ) : (
                          <span className={`badge ${ESTADO_BADGE[item.estado] ?? 'badge-gray'}`}>
                            {item.estado.replace('_', ' ')}
                          </span>
                        )}
                      </td>

                      {/* Prioridad */}
                      <td>
                        {editId === item.id && isRecepcionista ? (
                          <select
                            className="form-input"
                            value={editForm.prioridad || item.prioridad}
                            onChange={e => setEditForm({ ...editForm, prioridad: e.target.value as ListaEspera['prioridad'] })}
                            style={{ padding: '5px 8px', fontSize: 12, width: 'auto' }}
                          >
                            {PRIORIDADES.map(p => <option key={p}>{p}</option>)}
                          </select>
                        ) : (
                          <span style={{ fontWeight: 700, fontSize: 12, color: PRIOR_COLOR[item.prioridad] ?? '#374151' }}>
                            ● {item.prioridad}
                          </span>
                        )}
                      </td>

                      {/* Fecha */}
                      <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                        {editId === item.id && isRecepcionista ? (
                          <input
                            type="date"
                            className="form-input"
                            value={editForm.fechaEstimada?.split('T')[0] || ''}
                            onChange={e => setEditForm({ ...editForm, fechaEstimada: e.target.value })}
                            style={{ padding: '5px 8px', fontSize: 12 }}
                          />
                        ) : (
                          item.fechaEstimada
                            ? new Date(item.fechaEstimada).toLocaleDateString('es-CL')
                            : <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>

                      {/* Observaciones */}
                      <td style={{ maxWidth: 180 }}>
                        {editId === item.id && isRecepcionista ? (
                          <input
                            className="form-input"
                            value={editForm.observaciones || item.observaciones || ''}
                            onChange={e => setEditForm({ ...editForm, observaciones: e.target.value })}
                            placeholder="Observaciones"
                            style={{ padding: '5px 8px', fontSize: 12 }}
                          />
                        ) : (
                          <span style={{ fontSize: 12, color: item.observaciones ? '#475569' : '#94a3b8' }}>
                            {item.observaciones || '—'}
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td>
                        {isRecepcionista && (
                          editId === item.id ? (
                            <div style={{ display: 'flex', gap: 5 }}>
                              <button onClick={() => handleActualizar(item.id)} className="btn btn-success btn-sm">Guardar</button>
                              <button onClick={() => { setEditId(null); setEditForm({}); }} className="btn btn-secondary btn-sm">✕</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditId(item.id);
                                setEditForm({ estado: item.estado, prioridad: item.prioridad, observaciones: item.observaciones });
                              }}
                              className="btn btn-primary btn-sm"
                            >
                              Editar
                            </button>
                          )
                        )}

                        {isMedico && (
                          <div style={{ display: 'flex', gap: 5 }}>
                            {(item.estado === 'EN_ESPERA' || item.estado === 'ASIGNADA') && (
                              <>
                                <button
                                  data-testid={`btn-atender-${item.id}`}
                                  onClick={() => handleAtender(item)}
                                  className="btn btn-success btn-sm"
                                >
                                  ✓ Atender
                                </button>
                                <button
                                  data-testid={`btn-cancelar-${item.id}`}
                                  onClick={() => handleCancelar(item)}
                                  className="btn btn-danger btn-sm"
                                >
                                  ✗
                                </button>
                              </>
                            )}
                            {(item.estado === 'ATENDIDA' || item.estado === 'CANCELADA') && (
                              <span style={{ fontSize: 11, color: '#94a3b8' }}>Finalizado</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )
      }
    </div>
  );
}
=======
import { listaEsperaApi } from '../services/api';
import type { ListaEspera } from '../types';

const ESTADOS = ['EN_ESPERA', 'ASIGNADA', 'ATENDIDA', 'CANCELADA'] as const;
const PRIORIDADES = ['URGENTE', 'ALTA', 'NORMAL', 'BAJA'] as const;

const ESTADO_META: Record<string, { bg: string; color: string; border: string; icon: string }> = {
  EN_ESPERA: { bg: '#fefce8', color: '#a16207', border: '#fde68a', icon: '⏳' },
  ASIGNADA:  { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe', icon: '📅' },
  ATENDIDA:  { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0', icon: '✅' },
  CANCELADA: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca', icon: '✕' },
};

const PRIORIDAD_META: Record<string, { color: string; bg: string; icon: string }> = {
  URGENTE: { color: '#b91c1c', bg: '#fef2f2', icon: '🚨' },
  ALTA:    { color: '#c2410c', bg: '#fff7ed', icon: '🔴' },
  NORMAL:  { color: '#1d4ed8', bg: '#eff6ff', icon: '🔵' },
  BAJA:    { color: '#64748b', bg: '#f1f5f9', icon: '⚪' },
};

export default function ListaEsperaPage() {
  const [items, setItems] = useState<ListaEspera[]>([]);
  const [resumen, setResumen] = useState({ total: 0, enEspera: 0, asignada: 0, atendida: 0, cancelada: 0, urgentes: 0 });
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('');

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const params: { estado?: string; prioridad?: string } = {};
      if (filtroEstado) params.estado = filtroEstado;
      if (filtroPrioridad) params.prioridad = filtroPrioridad;

      const [listaRes, resumenRes] = await Promise.all([
        listaEsperaApi.listar(params),
        listaEsperaApi.resumen()
      ]);
      setItems(listaRes);
      setResumen(resumenRes);
    } catch {
      // Control de excepciones silencioso
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [filtroEstado, filtroPrioridad]);

  const handleCambiarEstado = async (id: number, nuevoEstado: typeof ESTADOS[number]) => {
    try {
      await listaEsperaApi.actualizar(id, { estado: nuevoEstado });
      cargarDatos();
    } catch (err: any) {
      alert(err.response?.data?.error || 'No se pudo actualizar el estado');
    }
  };

  return (
    <div style={container}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={title}>Panel de Control — Lista de Espera</h1>
        <p style={subtitle}>Monitoreo en tiempo real de prioridades biomédicas, asignación de turnos y estado de la atención</p>
      </div>

      <div style={statsGrid}>
        <div style={{ ...statCard, borderLeft: '4px solid #7c3aed' }}>
          <div style={statLabel}>Total Registros</div>
          <div style={statValue}>{resumen.total}</div>
        </div>
        <div style={{ ...statCard, borderLeft: '4px solid #eab308' }}>
          <div style={statLabel}>En Espera Activa</div>
          <div style={statValue}>{resumen.enEspera}</div>
        </div>
        <div style={{ ...statCard, borderLeft: '4px solid #b91c1c' }}>
          <div style={statLabel}>Prioridad Urgente</div>
          <div style={{ ...statValue, color: '#b91c1c' }}>{resumen.urgentes}</div>
        </div>
        <div style={{ ...statCard, borderLeft: '4px solid #16a34a' }}>
          <div style={statLabel}>Atendidos con Éxito</div>
          <div style={statValue}>{resumen.atendida}</div>
        </div>
      </div>

      <div style={filtersCard}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div>
            <label style={labelStyle}>Filtrar Estado</label>
            <select style={selectStyle} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="">Todos los Estados</option>
              {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Filtrar Prioridad</label>
            <select style={selectStyle} value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value)}>
              <option value="">Todas las Prioridades</option>
              {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <button style={ghostBtn} onClick={() => { setFiltroEstado(''); setFiltroPrioridad(''); }}>Limpiar Filtros</button>
        </div>
      </div>

      <div style={card}>
        {loading ? (
          <p style={{ color: '#64748b' }}>Sincronizando cola de espera...</p>
        ) : items.length === 0 ? (
          <div style={emptyState}>No se registran solicitudes en cola bajo los filtros seleccionados.</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={thStyle}>Turno / Código</th>
                <th style={thStyle}>ID Paciente</th>
                <th style={thStyle}>ID Solicitud</th>
                <th style={thStyle}>Prioridad</th>
                <th style={thStyle}>Estado Clínico</th>
                <th style={thStyle}>Observaciones Internas</th>
                <th style={thStyle}>Acciones de Control</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => {
                const estMeta = ESTADO_META[item.estado] || { bg: '#f8fafc', color: '#0f172a', border: '#cbd5e1', icon: '•' };
                const priMeta = PRIORIDAD_META[item.prioridad];
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={tdStyle}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: '#0f172a' }}>
                        {item.numeroTurno ? `N° ${item.numeroTurno}` : 'S/N'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>ID: {item.pacienteId}</td>
                    <td style={{ ...tdStyle, color: '#64748b' }}>Orden #{item.solicitudId}</td>
                    <td style={tdStyle}>
                      <span style={{ color: priMeta.color, background: priMeta.bg, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                        {priMeta.icon} {item.prioridad}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={{ background: estMeta.bg, color: estMeta.color, border: `1px solid ${estMeta.border}`, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
                        {estMeta.icon} {item.estado}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 13, color: '#475569', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.observaciones || <span style={{ color: '#cbd5e1' }}>Sin comentarios</span>}
                    </td>
                    <td style={tdStyle}>
                      <select 
                        style={{ ...selectStyle, padding: '5px 8px', fontSize: 12 }} 
                        value={item.estado} 
                        onChange={e => handleCambiarEstado(item.id, e.target.value as typeof ESTADOS[number])}
                      >
                        {ESTADOS.map(es => <option key={es} value={es}>{es}</option>)}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Estilos estructurales en CSS-in-JS
const container: React.CSSProperties = { padding: '24px max(24px, (100% - 1200px)/2)', background: '#f8fafc', minHeight: '100vh' };
const title: React.CSSProperties = { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 };
const subtitle: React.CSSProperties = { fontSize: 14, color: '#64748b', margin: '4px 0 0 0' };
const statsGrid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 };
const statCard: React.CSSProperties = { background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.01)' };
const statLabel: React.CSSProperties = { fontSize: 12, color: '#64748b', fontWeight: 500, textTransform: 'uppercase' };
const statValue: React.CSSProperties = { fontSize: 26, fontWeight: 700, color: '#0f172a', marginTop: 4 };
const filtersCard: React.CSSProperties = { background: '#ffffff', borderRadius: 10, border: '1px solid #e2e8f0', padding: 14, marginBottom: 16 };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 };
const card: React.CSSProperties = { background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' };
const selectStyle: React.CSSProperties = { border: '1px solid #e2e8f0', borderRadius: 7, padding: '8px 11px', fontSize: 13, color: '#0f172a', background: '#ffffff' };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const thStyle: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' };
const tdStyle: React.CSSProperties = { padding: '11px 14px', verticalAlign: 'middle' };
const emptyState: React.CSSProperties = { textAlign: 'center', padding: '48px 0', color: '#94a3b8' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 7, padding: '8px 14px', fontSize: 13, cursor: 'pointer', marginTop: 16 };
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
