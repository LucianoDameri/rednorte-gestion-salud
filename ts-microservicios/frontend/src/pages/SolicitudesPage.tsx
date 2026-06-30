import { useEffect, useState } from 'react';
import { solicitudApi, pacienteApi } from '../services/api';
import type { Solicitud, Paciente } from '../types';

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
  };

  useEffect(() => { cargar(); }, []);

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
    }
  };

  const handleDelete = async (id: number) => {
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
