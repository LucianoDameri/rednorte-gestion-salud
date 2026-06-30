import { useEffect, useState } from 'react';
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
