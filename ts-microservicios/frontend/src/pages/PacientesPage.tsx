import { useEffect, useState } from 'react';
import { pacienteApi } from '../services/api';
import type { Paciente } from '../types';

const emptyForm = { rut: '', nombre: '', apellido: '', email: '', telefono: '' };

interface PacientesPageProps {
  soloLectura?: boolean;
}

export default function PacientesPage({ soloLectura = false }: PacientesPageProps) {
  const [pacientes, setPacientes]   = useState<Paciente[]>([]);
  const [loading, setLoading]       = useState(true);
  const [form, setForm]             = useState(emptyForm);
  const [editId, setEditId]         = useState<number | null>(null);
  const [showForm, setShowForm]     = useState(false);
  const [error, setError]           = useState('');
  const [busqueda, setBusqueda]     = useState('');

  const cargar = async () => {
    try { setLoading(true); setPacientes(await pacienteApi.listar()); }
    catch { setPacientes([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { cargar(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try {
      if (editId) await pacienteApi.actualizar(editId, form);
      else        await pacienteApi.crear(form);
      setForm(emptyForm); setEditId(null); setShowForm(false); cargar();
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.detalle || 'Error al guardar');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este paciente?')) return;
    try { await pacienteApi.eliminar(id); cargar(); }
    catch (err: any) { alert(err.response?.data?.error || 'Error al eliminar'); }
  };

  const openEdit = (p: Paciente) => {
    setForm({ rut: p.rut, nombre: p.nombre, apellido: p.apellido, email: p.email || '', telefono: p.telefono || '' });
    setEditId(p.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelForm = () => { setShowForm(false); setEditId(null); setForm(emptyForm); setError(''); };

  const filtrados = pacientes.filter(p =>
    busqueda === '' ||
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.rut.includes(busqueda)
  );

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Pacientes</h1>
          <p className="page-subtitle">
            {soloLectura
              ? 'Modo solo lectura — acceso de médico'
              : `${pacientes.length} paciente${pacientes.length !== 1 ? 's' : ''} registrado${pacientes.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        <div className="page-controls">
          <input
            className="form-input"
            placeholder="Buscar por nombre, apellido o RUT…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ width: 280 }}
          />
          {!soloLectura && (
            <button
              data-testid="btn-nuevo-paciente"
              onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}
              className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`}
            >
              {showForm ? '✕ Cancelar' : '+ Nuevo paciente'}
            </button>
          )}
        </div>
      </div>

      {/* Formulario */}
      {!soloLectura && showForm && (
        <div className="form-section">
          <h3 className="form-section-title">
            {editId ? 'Editar paciente' : 'Nuevo paciente'}
          </h3>
          {error && <div className="alert alert-error" style={{ marginBottom: 14 }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid-2">
              <input className="form-input" placeholder="RUT (ej: 11.111.111-1)" value={form.rut}      required onChange={e => setForm({ ...form, rut: e.target.value })} />
              <input className="form-input" placeholder="Email"                  value={form.email}    type="email" onChange={e => setForm({ ...form, email: e.target.value })} />
              <input className="form-input" placeholder="Nombre"                 value={form.nombre}   required onChange={e => setForm({ ...form, nombre: e.target.value })} />
              <input className="form-input" placeholder="Apellido"               value={form.apellido} required onChange={e => setForm({ ...form, apellido: e.target.value })} />
              <input className="form-input" placeholder="Teléfono"               value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
            </div>
            <div className="form-actions" style={{ marginTop: 14 }}>
              <button type="submit"  className="btn btn-success">{editId ? 'Actualizar' : 'Crear paciente'}</button>
              <button type="button"  className="btn btn-secondary" onClick={cancelForm}>Cancelar</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla */}
      {loading
        ? <p className="loading-text">Cargando pacientes…</p>
        : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  {['ID', 'RUT', 'Nombre', 'Apellido', 'Email', 'Teléfono', ...(soloLectura ? [] : ['Acciones'])].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0
                  ? <tr><td className="table-empty" colSpan={soloLectura ? 6 : 7}>
                      {busqueda ? 'Sin resultados para esa búsqueda' : 'No hay pacientes registrados'}
                    </td></tr>
                  : filtrados.map(p => (
                    <tr key={p.id}>
                      <td style={{ color: '#94a3b8', fontSize: 12 }}>{p.id}</td>
                      <td><span className="mono">{p.rut}</span></td>
                      <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                      <td>{p.apellido}</td>
                      <td style={{ color: '#64748b' }}>{p.email || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                      <td style={{ color: '#64748b' }}>{p.telefono || <span style={{ color: '#94a3b8' }}>—</span>}</td>
                      {!soloLectura && (
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => openEdit(p)}        className="btn btn-outline btn-sm">Editar</button>
                            <button onClick={() => handleDelete(p.id)} className="btn btn-danger  btn-sm">Eliminar</button>
                          </div>
                        </td>
                      )}
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
