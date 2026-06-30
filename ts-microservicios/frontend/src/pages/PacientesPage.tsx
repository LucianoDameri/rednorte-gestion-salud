import { useEffect, useState } from 'react';
import { pacienteApi } from '../services/api';
import type { Paciente } from '../types';

const emptyForm = { rut: '', nombre: '', apellido: '', email: '', telefono: '' };

<<<<<<< HEAD
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
=======
export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const cargar = async () => {
    try { 
      setLoading(true); 
      const res = await pacienteApi.listar();
      setPacientes(res); 
    } catch { 
      setPacientes([]); 
    } finally { 
      setLoading(false); 
    }
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
  };

  useEffect(() => { cargar(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
<<<<<<< HEAD
    e.preventDefault(); setError('');
    try {
      if (editId) await pacienteApi.actualizar(editId, form);
      else        await pacienteApi.crear(form);
      setForm(emptyForm); setEditId(null); setShowForm(false); cargar();
=======
    e.preventDefault(); 
    setError('');
    try {
      if (editId) {
        await pacienteApi.actualizar(editId, form);
      } else {
        await pacienteApi.crear(form);
      }
      setForm(emptyForm); 
      setEditId(null); 
      setShowForm(false); 
      cargar();
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.detalle || 'Error al guardar');
    }
  };

<<<<<<< HEAD
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
=======
  const handleEdit = (p: Paciente) => {
    setForm({ 
      rut: p.rut, 
      nombre: p.nombre, 
      apellido: p.apellido, 
      email: p.email || '', 
      telefono: p.telefono || '' 
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Eliminar este paciente?')) return;
    try { 
      await pacienteApi.eliminar(id); 
      cargar(); 
    } catch (err: any) { 
      alert(err.response?.data?.error || 'Error al eliminar'); 
    }
  };

  const filtrados = pacientes.filter(p => 
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.apellido.toLowerCase().includes(search.toLowerCase()) ||
    p.rut.includes(search)
  );

  return (
    <div style={container}>
      <div style={header}>
        <div>
          <h1 style={title}>Registro de Pacientes</h1>
          <p style={subtitle}>Gestión de información demográfica y de contacto</p>
        </div>
        <button 
          style={primaryBtn} 
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}
        >
          {showForm ? '✕ Cerrar' : '＋ Nuevo Paciente'}
        </button>
      </div>

      {error && <div style={errorBox}>⚠️ {error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} style={card}>
          <h3 style={{ marginTop: 0, marginBottom: 16 }}>{editId ? 'Editar Paciente' : 'Nuevo Paciente'}</h3>
          <div style={grid}>
            <div>
              <label style={labelStyle}>RUT *</label>
              <input style={inputStyle} type="text" required value={form.rut} onChange={e => setForm({...form, rut: e.target.value})} placeholder="12.345.678-9" />
            </div>
            <div>
              <label style={labelStyle}>Nombre *</label>
              <input style={inputStyle} type="text" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} />
            </div>
            <div>
              <label style={labelStyle}>Apellido *</label>
              <input style={inputStyle} type="text" required value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
            </div>
            <div>
              <label style={labelStyle}>Teléfono</label>
              <input style={inputStyle} type="text" value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})} placeholder="+569..." />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'flex-end' }}>
            <button type="button" style={ghostBtn} onClick={() => setShowForm(false)}>Cancelar</button>
            <button type="submit" style={successBtn}>{editId ? 'Guardar Cambios' : 'Registrar'}</button>
          </div>
        </form>
      )}

      <div style={{ marginBottom: 16 }}>
        <input style={{ ...inputStyle, maxWidth: 320 }} type="text" placeholder="🔍 Buscar por nombre, apellido o RUT..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={card}>
        {loading ? (
          <p style={{ color: '#64748b' }}>Cargando pacientes...</p>
        ) : filtrados.length === 0 ? (
          <p style={{ color: '#64748b' }}>No se encontraron pacientes.</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                <th style={thStyle}>RUT</th>
                <th style={thStyle}>Nombre Completo</th>
                <th style={thStyle}>Contacto</th>
                <th style={thStyle}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{p.rut}</td>
                  <td style={tdStyle}>{p.nombre} {p.apellido}</td>
                  <td style={tdStyle}>
                    <div style={{ fontSize: 13, color: '#0f172a' }}>{p.email || '—'}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{p.telefono || '—'}</div>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={actionBtn} onClick={() => handleEdit(p)}>✏️</button>
                      <button style={{ ...actionBtn, color: '#ef4444' }} onClick={() => handleDelete(p.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
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

const primaryBtn: React.CSSProperties = { background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 13, fontWeight: 600, boxShadow: '0 1px 4px rgba(124,58,237,0.3)', cursor: 'pointer' };
const successBtn: React.CSSProperties = { background: '#16a34a', color: 'white', border: 'none', borderRadius: 7, padding: '9px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' };
const ghostBtn: React.CSSProperties = { background: 'transparent', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 7, padding: '9px 16px', fontSize: 13, cursor: 'pointer' };
const actionBtn: React.CSSProperties = { background: '#f1f5f9', border: 'none', borderRadius: 6, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' };
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
