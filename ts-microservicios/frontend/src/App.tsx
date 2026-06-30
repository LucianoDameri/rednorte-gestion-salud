import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import PacientesPage from './pages/PacientesPage';
import SolicitudesPage from './pages/SolicitudesPage';
import ListaEsperaPage from './pages/ListaEsperaPage';

const NAV_RECEPCIONISTA = [
  { to: '/',             label: 'Pacientes',        exact: true,  icon: '👥' },
  { to: '/solicitudes',  label: 'Solicitudes',      exact: false, icon: '📋' },
  { to: '/lista-espera', label: 'Lista de Espera',  exact: false, icon: '⏳' },
];

const NAV_MEDICO = [
  { to: '/',          label: 'Lista de Espera', exact: true,  icon: '⏳' },
  { to: '/pacientes', label: 'Ver Pacientes',   exact: false, icon: '👥' },
];

const PAGE_TITLES: Record<string, string> = {
  '/':             'Panel Principal',
  '/solicitudes':  'Solicitudes Médicas',
  '/lista-espera': 'Lista de Espera',
  '/pacientes':    'Pacientes',
};

// SVG icon for the logo — looks much better than an emoji
function MedIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
      <line x1="12" y1="6" x2="12" y2="14"/>
      <line x1="8" y1="10" x2="16" y2="10"/>
    </svg>
  );
}

function AppInner() {
  const { isAuthenticated, usuario, logout, isRecepcionista, isMedico } = useAuth();
  const location = useLocation();
  const navLinks = isRecepcionista ? NAV_RECEPCIONISTA : NAV_MEDICO;

  // Resolve page title for topbar
  const pageTitle = (() => {
    if (!isAuthenticated) return '';
    if (isRecepcionista) {
      if (location.pathname === '/')             return 'Pacientes';
      if (location.pathname === '/solicitudes')  return 'Solicitudes Médicas';
      if (location.pathname === '/lista-espera') return 'Lista de Espera';
    }
    if (isMedico) {
      if (location.pathname === '/')          return 'Lista de Espera';
      if (location.pathname === '/pacientes') return 'Pacientes (Solo lectura)';
    }
    return '';
  })();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <div className="app-layout">
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <MedIcon />
          </div>
          <div>
            <div className="sidebar-logo-name">SaludRedNorte</div>
            <div className="sidebar-logo-sub">Centro Médico</div>
          </div>
        </div>

        {/* Nav */}
        <div className="sidebar-nav">
          <div className="sidebar-section-label">Módulos</div>
          {navLinks.map(({ to, label, exact, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
            >
              <span className="nav-item-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Footer: user + logout */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {isRecepcionista ? '👩‍💼' : '👨‍⚕️'}
            </div>
            <div>
              <div className="sidebar-user-name">{usuario?.nombre}</div>
              <div className="sidebar-user-role">
                {isRecepcionista ? 'Recepcionista' : 'Médico'}
              </div>
            </div>
          </div>
          <button
            data-testid="btn-logout"
            onClick={logout}
            className="sidebar-logout"
          >
            <span style={{ fontSize: 14 }}>🚪</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="main-area">
        {/* Topbar */}
        <div className="topbar">
          <span className="topbar-title">{pageTitle}</span>
          <div className="topbar-right">
            <span style={{ fontSize: 12, color: '#64748b' }}>
              {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Page content */}
        <main className="page-content">
          <Routes>
            {isRecepcionista && <>
              <Route path="/" element={<ProtectedRoute><PacientesPage /></ProtectedRoute>} />
              <Route path="/solicitudes" element={<ProtectedRoute><SolicitudesPage /></ProtectedRoute>} />
              <Route path="/lista-espera" element={<ProtectedRoute><ListaEsperaPage /></ProtectedRoute>} />
            </>}
            {isMedico && <>
              <Route path="/" element={<ProtectedRoute><ListaEsperaPage /></ProtectedRoute>} />
              <Route path="/pacientes" element={<ProtectedRoute><PacientesPage soloLectura /></ProtectedRoute>} />
            </>}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppInner />
      </BrowserRouter>
    </AuthProvider>
  );
}
