import { useEffect, useState } from 'react';
import { solicitudApi, pacienteApi } from '../services/api';
import type { Solicitud, Paciente } from '../types';

<<<<<<< HEAD
const TIPOS = ['CONSULTA', 'PROCEDIMIENTO', 'CIRUGIA', 'DIAGNOSTICO'];
const PRIORIDADES = ['URGENTE', 'ALTA', 'NORMAL', 'BAJA'];
const ESPECIALIDADES: Record<number, string> = {
  1: 'Cardiología', 2: 'Oftalmología', 3: 'Traumatología',
  4: 'Neurología',  5: 'Dermatología', 6: 'Ginecología',  7: 'Pediatría',
};

const emptyForm = { pacienteId: 0, especialidadId: 1, tipoAtencion: 'CONSULTA', descripcion: '', prioridad: 'NORMAL' };

const TIPO_BADGE: Record<string, string> = {
  CONSULTA:      'badge-primary',
  PROCEDIMIENTO: 'badge-success',
  CIRUGIA:       'badge-purple',
  DIAGNOSTICO:   'badge-warning',
};


export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [pacientes, setPacientes]     = useState<Paciente[]>([]);
  const [loading, setLoading]         = useState(true);
  const [form, setForm]               = useState(emptyForm);
  const [showForm, setShowForm]       = useState(false);
  const [error, setError]             = useState('');
  const [filtro, setFiltro]           = useState<number | ''>('');

  const cargar = async (pacienteId?: number) => {
    try {
      setLoading(true);
      const [solic, pacs] = await Promise.all([
        solicitudApi.listar(pacienteId ? { pacienteId } : undefined).catch(() => []),
        pacienteApi.listar().catch(() => []),
      ]);
      setSolicitudes(Array.isArray(solic) ? solic : []);
      setPacientes(Array.isArray(pacs)   ? pacs  : []);
    } finally { setLoading(false); }
=======
type TipoAtencion = Solicitud['tipoAtencion'];

const TIPOS: TipoAtencion[] = ['CONSULTA', 'PROCEDIMIENTO', 'CIRUGIA', 'DIAGNOSTICO'];
const PRIORIDADES = ['URGENTE', 'ALTA', 'NORMAL', 'BAJA'];
const ESPECIALIDADES: Record<number, string> = {
  1: 'Cardiología', 2: 'Oftalmología', 3: 'Traumatología',
  4: 'Neurología', 5: 'Dermatología', 6: 'Ginecología', 7: 'Pediatría',
};

const TIPO_META: Record<TipoAtencion, { color: string; bg: string; icon: string }> = {
  CONSULTA:     { color: '#1d4ed8', bg: '#eff6ff', icon: '🩺' },
  PROCEDIMIENTO:{ color: '#0f766e', bg: '#f0fdfa', icon: '🔬' },
  CIRUGIA:      { color: '#7c3aed', bg: '#f5f3ff', icon: '🏥' },
  DIAGNOSTICO:  { color: '#b45309', bg: '#fffbeb', icon: '📊' },
};

const emptyForm = {
  pacienteId: 0,
  especialidadId: 1,
  tipoAtencion: 'CONSULTA' as TipoAtencion,
  descripcion: '',
  prioridad: 'NORMAL'
};

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const cargar = async () => {
    try {
      setLoading(true);
      const [sRes, pRes] = await Promise.all([solicitudApi.listar(), pacienteApi.listar()]);
      setSolicitudes(sRes);
      setPacientes(pRes);
    } catch {
      // Manejo silencioso
    } finally {
      setLoading(false);
    }
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
  };

  useEffect(() => { cargar(); }, []);

<<<<<<< HEAD
  const handleFiltro = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value ? Number(e.target.value) : '';
    setFiltro(v);
    cargar(v || undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      await solicitudApi.crear({ ...form, pacienteId: Number(form.pacienteId), especialidadId: Number(form.especialidadId) });
      setForm(emptyForm); setShowForm(false); cargar(filtro || undefined);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.detalle || 'Error al crear');
=======
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError('');
    if (Number(form.pacienteId) === 0) {
      setError('Debe seleccionar un paciente válido');
      return;
    }

    try {
      await solicitudApi.crear({
        pacienteId: Number(form.pacienteId),
        especialidadId: Number(form.especialidadId),
        tipoAtencion: form.tipoAtencion,
        descripcion: form.descripcion,
        prioridad: form.prioridad
      });
      setForm(emptyForm);
      setShowForm(false);
      cargar();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al ingresar solicitud');
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
    }
  };

  const handleDelete = async (id: number) => {
<<<<<<< HEAD
    if (!confirm('¿Eliminar esta solicitud?')) return;
    try { await solicitudApi.eliminar(id); cargar(filtro || undefined); }
    catch (err: any) { alert(err.response?.data?.error || 'Error al eliminar'); }
  };

  const getNombre = (id: number) => {
    const p = pacientes.find(x => x.id === id);
    return p ? `${p.nombre} ${p.apellido}` : `Paciente #${id}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Solicitudes Médicas</h1>
          <p className="page-subtitle">{solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''}</p>
        </div>
        <div className="page-controls">
          <select
            className="form-input"
            value={filtro}
            onChange={handleFiltro}
            style={{ width: 220 }}
          >
            <option value="">Todos los pacientes</option>
            {pacientes.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
            ))}
          </select>
          <button
            onClick={() => { setShowForm(!showForm); setError(''); }}
            className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`}
          >
            {showForm ? '✕ Cancelar' : '+ Nueva solicitud'}
          </button>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="form-section">
          <h3 className="form-section-title">Nueva Solicitud Médica</h3>
          {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <select className="form-input" value={form.pacienteId} required onChange={e => setForm({ ...form, pacienteId: Number(e.target.value) })}>
                <option value={0}>— Seleccionar Paciente —</option>
                {pacientes.map(p => <option key={p.id} value={p.id}>{p.nombre} {p.apellido} ({p.rut})</option>)}
              </select>
              <select className="form-input" value={form.especialidadId} onChange={e => setForm({ ...form, especialidadId: Number(e.target.value) })}>
                {Object.entries(ESPECIALIDADES).map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}
              </select>
              <select className="form-input" value={form.tipoAtencion} onChange={e => setForm({ ...form, tipoAtencion: e.target.value })}>
                {TIPOS.map(t => <option key={t}>{t}</option>)}
              </select>
              <select className="form-input" value={form.prioridad} onChange={e => setForm({ ...form, prioridad: e.target.value })}>
                {PRIORIDADES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <textarea
              className="form-input"
              placeholder="Descripción / motivo de consulta…"
              value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })}
              style={{ minHeight: 80, resize: 'vertical', marginBottom: 12 }}
            />
            <div className="alert alert-info" style={{ marginBottom: 14 }}>
              Al crear la solicitud se agrega automáticamente a la lista de espera con la prioridad indicada.
            </div>
            <div className="form-actions">
              <button type="submit"  className="btn btn-success">Crear solicitud</button>
              <button type="button"  className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      {loading
        ? <p className="loading-text">Cargando solicitudes…</p>
        : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  {['ID', 'Paciente', 'Especialidad', 'Tipo', 'Descripción', 'Fecha', 'Acciones'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {solicitudes.length === 0
                  ? <tr><td className="table-empty" colSpan={7}>Sin solicitudes registradas</td></tr>
                  : solicitudes.map(s => (
                    <tr key={s.id}>
                      <td style={{ color: '#94a3b8', fontSize: 12 }}>{s.id}</td>
                      <td style={{ fontWeight: 600 }}>{getNombre(s.pacienteId)}</td>
                      <td style={{ fontSize: 12 }}>{ESPECIALIDADES[s.especialidadId] || `Esp. #${s.especialidadId}`}</td>
                      <td><span className={`badge ${TIPO_BADGE[s.tipoAtencion] ?? 'badge-gray'}`}>{s.tipoAtencion}</span></td>
                      <td style={{ color: '#64748b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>
                        {s.descripcion || <span style={{ color: '#94a3b8' }}>—</span>}
                      </td>
                      <td style={{ color: '#94a3b8', fontSize: 12, whiteSpace: 'nowrap' }}>
                        {new Date(s.createdAt).toLocaleDateString('es-CL')}
                      </td>
                      <td>
                        <button onClick={() => handleDelete(s.id)} className="btn btn-danger btn-sm">Eliminar</button>
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
    if (!window.confirm('¿Eliminar esta solicitud médica?')) return;
    try {
      await solicitudApi.eliminar(id);
      cargar();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  const getNombrePaciente = (pId: number) => {
    const p = pacientes.find(x => x.id === pId);
    return p ? `${p.nombre} ${p.apellido} (${p.rut})` : `ID Paciente: ${pId}`;
  };

  return (
    <div style={container}>
      <div style={header}>
        <div>
          <h1 style={title}>Solicitudes de Interconsulta</h1>
          <p style={subtitle}>Ingreso de derivaciones a especialidades y asignación de prioridad inicial</p>
        </div>
        <button style={primaryBtn} onClick={() => { setShowForm(!showForm); setForm(emptyForm); }}>
          {showForm ? '✕ Cancelar' : '＋ Nueva Solicitud'}
        </button>
      </div>

      {error && <div style={errorBox}>⚠️ {error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={card}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>Nueva Orden Médica</h3>
          <div style={grid}>
            <div>
              <label style={labelStyle}>Paciente Beneficiario *</label>
              <select style={inputStyle} value={form.pacienteId} onChange={e => setForm({...form, pacienteId: Number(e.target.value)})}>
                <option value={0}>-- Seleccione un Paciente --</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.apellido}, {p.nombre} ({p.rut})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Especialidad de Destino *</label>
              <select style={inputStyle} value={form.especialidadId} onChange={e => setForm({...form, especialidadId: Number(e.target.value)})}>
                {Object.entries(ESPECIALIDADES).map(([id, nom]) => (
                  <option key={id} value={id}>{nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Tipo de Atención *</label>
              <select style={inputStyle} value={form.tipoAtencion} onChange={e => setForm({...form, tipoAtencion: e.target.value as TipoAtencion})}>
                {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Prioridad de Triaje Inicial</label>
              <select style={inputStyle} value={form.prioridad} onChange={e => setForm({...form, prioridad: e.target.value})}>
                {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop: 14 }}>
            <label style={labelStyle}>Descripción Diagnóstica / Observaciones</label>
            <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} placeholder="Detalle sintomatología, sospecha clínica o derivación..." />
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
            <button type="button" style={ghostBtn} onClick={() => setShowForm(false)}>Cerrar</button>
            <button type="submit" style={successBtn}>Ingresar Solicitud</button>
          </div>
        </form>
      )}

      <div style={card}>
        {loading ? (
          <p style={{ color: '#64748b' }}>Cargando derivaciones...</p>
        ) : solicitudes.length === 0 ? (
          <div style={emptyState}>No hay solicitudes registradas actualmente en el sistema.</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Paciente</th>
                <th style={thStyle}>Especialidad</th>
                <th style={thStyle}>Tipo</th>
                <th style={thStyle}>Descripción / Fecha</th>
                <th style={thStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map(s => {
                const meta = TIPO_META[s.tipoAtencion];
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ ...tdStyle, color: '#64748b', fontSize: 13 }}>#{s.id}</td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{getNombrePaciente(s.pacienteId)}</td>
                    <td style={tdStyle}>{ESPECIALIDADES[s.especialidadId] || `ID: ${s.especialidadId}`}</td>
                    <td style={tdStyle}>
                      <span style={{ background: meta.bg, color: meta.color, padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        {meta.icon} {s.tipoAtencion}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <div style={{ fontSize: 13, color: '#0f172a', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.descripcion || '—'}</div>
                      <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Registrado el: {new Date(s.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td style={tdStyle}>
                      <button style={{ ...actionBtn, color: '#ef4444' }} onClick={() => handleDelete(s.id)}>🗑️</button>
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
const header: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 };
const title: React.CSSProperties = { fontSize: 24, fontWeight: 700, color: '#0f172a', margin: 0 };
const subtitle: React.CSSProperties = { fontSize: 14, color: '#64748b', margin: '4px 0 0 0' };
const grid: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 };
const inputStyle: React.CSSProperties = { width: '100%', border: '1px solid #cbd5e1', borderRadius: 6, padding: '9px 12px', fontSize: 14, background: '#ffffff', color: '#0f172a', boxSizing: 'border-box' };
const card: React.CSSProperties = { background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24, marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.02)' };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse' };
const thStyle: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' };
const tdStyle: React.CSSProperties = { padding: '12px 14px', verticalAlign: 'middle' };
const errorBox: React.CSSProperties = { background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: 7, padding: '10px 14px', fontSize: 13, marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' };
const emptyState: React.CSSProperties = { textAlign: 'center', padding: '48px 0', color: '#94a3b8' };

const primaryBtn: React.CSSProperties = { background: '#1d4ed8', color: 'white', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, boxShadow: '0 1px 4px rgba(29,78,216,0.3)', cursor: 'pointer' };
const successBtn: React.CSSProperties = { background: '#16a34a', color: 'white', border: 'none', borderRadius: 7, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 7, padding: '9px 16px', fontSize: 13, cursor: 'pointer' };
const actionBtn: React.CSSProperties = { background: '#f1f5f9', border: 'none', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
