import { useEffect, useState } from 'react';
import { especialidadService } from '../services/api';
import type { Especialidad } from '../types';

const emptyForm = { codigo: '', nombre: '', descripcion: '', activo: true };

export default function EspecialidadesPage() {
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const data = await especialidadService.listar();
      setEspecialidades(Array.isArray(data) ? data : []);
    } catch {
      setEspecialidades([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) {
        await especialidadService.actualizar(editId, form);
      } else {
        await especialidadService.crear({ ...form, activo: true });
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      cargar();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleEdit = (esp: Especialidad) => {
    setForm({ codigo: esp.codigo, nombre: esp.nombre, descripcion: esp.descripcion || '', activo: esp.activo });
    setEditId(esp.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta especialidad?')) return;
    try {
      await especialidadService.eliminar(id);
      cargar();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, color: '#1e40af' }}>🏥 Especialidades Médicas</h2>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm); }}
          style={btnStyle('#1e40af')}>
          {showForm ? 'Cancelar' : '+ Nueva Especialidad'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={formStyle}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, color: '#374151' }}>
            {editId ? 'Editar Especialidad' : 'Nueva Especialidad'}
          </h3>
          {error && <div style={errorStyle}>{error}</div>}
          <div style={gridStyle}>
            <input placeholder="Código (ej: CARD)" value={form.codigo} required
              onChange={e => setForm({ ...form, codigo: e.target.value })} style={inputStyle} />
            <input placeholder="Nombre" value={form.nombre} required
              onChange={e => setForm({ ...form, nombre: e.target.value })} style={inputStyle} />
          </div>
          <input placeholder="Descripción" value={form.descripcion}
            onChange={e => setForm({ ...form, descripcion: e.target.value })} style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button type="submit" style={btnStyle('#16a34a')}>{editId ? 'Actualizar' : 'Crear'}</button>
            <button type="button" onClick={() => { setShowForm(false); setForm(emptyForm); setEditId(null); }} style={btnStyle('#6b7280')}>Cancelar</button>
          </div>
        </form>
      )}

      {loading ? <p style={{ color: '#6b7280' }}>Cargando...</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr style={{ background: '#eff6ff' }}>
                {['ID', 'Código', 'Nombre', 'Descripción', 'Activo', 'Acciones'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {especialidades.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>Sin especialidades registradas</td></tr>
              ) : especialidades.map(esp => (
                <tr key={esp.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={tdStyle}>{esp.id}</td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontWeight: 600, color: '#1e40af' }}>{esp.codigo}</td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>{esp.nombre}</td>
                  <td style={{ ...tdStyle, color: '#6b7280', fontSize: 13 }}>{esp.descripcion || '—'}</td>
                  <td style={tdStyle}>
                    <span style={{ color: esp.activo ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{esp.activo ? '✓' : '✗'}</span>
                  </td>
                  <td style={tdStyle}>
                    <button onClick={() => handleEdit(esp)} style={smallBtn('#1e40af')}>Editar</button>{' '}
                    <button onClick={() => handleDelete(esp.id)} style={smallBtn('#dc2626')}>Eliminar</button>
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

// Estilos inline compartidos
const btnStyle = (color: string): React.CSSProperties => ({
  background: color, color: 'white', border: 'none', borderRadius: 6,
  padding: '8px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
});
const smallBtn = (color: string): React.CSSProperties => ({
  ...btnStyle(color), padding: '4px 10px', fontSize: 12,
});
const formStyle: React.CSSProperties = {
  background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8,
  padding: 16, marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 10,
};
const errorStyle: React.CSSProperties = {
  background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626',
  borderRadius: 6, padding: '8px 12px', fontSize: 13,
};
const gridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 8 };
const inputStyle: React.CSSProperties = {
  border: '1px solid #d1d5db', borderRadius: 6, padding: '8px 10px', fontSize: 13,
};
const tableStyle: React.CSSProperties = {
  width: '100%', borderCollapse: 'collapse', fontSize: 13, background: 'white',
  border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden',
};
const thStyle: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: 12 };
const tdStyle: React.CSSProperties = { padding: '10px 12px' };
