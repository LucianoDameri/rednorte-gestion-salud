import { useEffect, useState } from 'react';
import { medicoService, especialidadService } from '../services/api';
import type { Medico, Especialidad } from '../types';

const emptyForm = { rut: '', nombre: '', apellido: '', email: '', telefono: '', especialidadId: 0, activo: true };

export default function MedicosPage() {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const [meds, esps] = await Promise.all([
        medicoService.listar().catch(() => []),
        especialidadService.listar().catch(() => []),
      ]);
      setMedicos(Array.isArray(meds) ? meds : []);
      setEspecialidades(Array.isArray(esps) ? esps : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, especialidadId: Number(form.especialidadId) };
      if (editId) {
        await medicoService.actualizar(editId, payload);
      } else {
        await medicoService.crear(payload);
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      cargar();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEdit = (m: Medico) => {
    setForm({ rut: m.rut, nombre: m.nombre, apellido: m.apellido, email: m.email, telefono: m.telefono || '', especialidadId: m.especialidadId, activo: m.activo });
    setEditId(m.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este médico?')) return;
    try { await medicoService.eliminar(id); cargar(); }
    catch (err: any) { alert(err.response?.data?.error || 'Error al eliminar'); }
  };

  const getNombreEspecialidad = (id: number) =>
    especialidades.find(e => e.id === id)?.nombre || `ID ${id}`;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: '#065f46' }}>👨‍⚕️ Médicos</h2>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }} style={btn('#065f46')}>
          {showForm ? 'Cancelar' : '+ Nuevo Médico'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={formStyle}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, color: '#374151' }}>{editId ? 'Editar Médico' : 'Nuevo Médico'}</h3>
          {error && <div style={errorStyle}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <input placeholder="RUT (ej: 12345678-9)" value={form.rut} required onChange={e => setForm({ ...form, rut: e.target.value })} style={inputStyle} />
            <input placeholder="Email" type="email" value={form.email} required onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
            <input placeholder="Nombre" value={form.nombre} required onChange={e => setForm({ ...form, nombre: e.target.value })} style={inputStyle} />
            <input placeholder="Apellido" value={form.apellido} required onChange={e => setForm({ ...form, apellido: e.target.value })} style={inputStyle} />
            <input placeholder="Teléfono" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} style={inputStyle} />
            <select value={form.especialidadId} required onChange={e => setForm({ ...form, especialidadId: Number(e.target.value) })} style={inputStyle}>
              <option value={0}>-- Seleccionar Especialidad --</option>
              {especialidades.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={btn('#16a34a')}>{editId ? 'Actualizar' : 'Crear'}</button>
            <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); setEditId(null); }} style={btn('#6b7280')}>Cancelar</button>
          </div>
        </form>
      )}

      {loading ? <p style={{ color: '#6b7280' }}>Cargando...</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: '#ecfdf5' }}>
                {['ID', 'RUT', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'Especialidad', 'Activo', 'Acciones'].map(h =>
                  <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {medicos.length === 0
                ? <tr><td colSpan={9} style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>Sin médicos registrados</td></tr>
                : medicos.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={tdStyle}>{m.id}</td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: 12 }}>{m.rut}</td>
                    <td style={tdStyle}>{m.nombre}</td>
                    <td style={{ ...tdStyle, fontWeight: 500 }}>{m.apellido}</td>
                    <td style={{ ...tdStyle, color: '#6b7280', fontSize: 12 }}>{m.email}</td>
                    <td style={{ ...tdStyle, fontSize: 12 }}>{m.telefono || '—'}</td>
                    <td style={{ ...tdStyle, color: '#065f46', fontWeight: 500, fontSize: 12 }}>{getNombreEspecialidad(m.especialidadId)}</td>
                    <td style={tdStyle}><span style={{ color: m.activo ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{m.activo ? '✓' : '✗'}</span></td>
                    <td style={tdStyle}>
                      <button onClick={() => handleEdit(m)} style={smallBtn('#065f46')}>Editar</button>{' '}
                      <button onClick={() => handleDelete(m.id)} style={smallBtn('#dc2626')}>Eliminar</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const btn = (color: string): React.CSSProperties => ({ background: color, color: 'white', border: 'none', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600 });
const smallBtn = (color: string): React.CSSProperties => ({ ...btn(color), padding: '4px 10px', fontSize: 12 });
const formStyle: React.CSSProperties = { background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10 };
const errorStyle: React.CSSProperties = { background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 6, padding: '8px 12px', fontSize: 13 };
const inputStyle: React.CSSProperties = { border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', fontSize: 13 };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: 13, background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' };
const thStyle: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 12 };
const tdStyle: React.CSSProperties = { padding: '10px 12px' };
