import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Rol } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Si se indica, solo usuarios con ese rol pueden acceder */
  rol?: Rol;
}

export default function ProtectedRoute({ children, rol }: ProtectedRouteProps) {
  const { isAuthenticated, usuario, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <span style={{ color: '#6b7280' }}>Cargando sesión...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (rol && usuario?.rol !== rol) {
    return (
      <div style={{ padding: 32, textAlign: 'center', color: '#b91c1c' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🚫</div>
        <h2 style={{ margin: 0 }}>Acceso denegado</h2>
        <p style={{ color: '#6b7280' }}>No tienes permisos para ver esta sección.</p>
      </div>
    );
  }

  return <>{children}</>;
}
