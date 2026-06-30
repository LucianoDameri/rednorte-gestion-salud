<<<<<<< HEAD
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
=======
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import PacientesPage from './pages/PacientesPage';
import SolicitudesPage from './pages/SolicitudesPage';
import ListaEsperaPage from './pages/ListaEsperaPage';
import ServiceStatusBar from './components/ServiceStatusBar';

const NAV = [
  { to: '/', label: 'Pacientes', icon: '👤', exact: true, color: '#7c3aed' },
  { to: '/solicitudes', label: 'Solicitudes', icon: '📋', exact: false, color: '#1d4ed8' },
  { to: '/lista-espera', label: 'Lista de Espera', icon: '⏳', exact: false, color: '#0369a1' },
];

const GlobalStyles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body {
      font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f1f5f9;
      color: #0f172a;
      -webkit-font-smoothing: antialiased;
    }
    input, select, textarea, button { font-family: inherit; }
    input, select, textarea {
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    input:focus, select:focus, textarea:focus {
      border-color: #3b82f6 !important;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.12);
    }
    button { cursor: pointer; transition: opacity 0.15s, transform 0.1s; }
    button:active { transform: scale(0.97); }
    tr { transition: background 0.1s; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
  `}</style>
);

export default function App() {
  return (
    <BrowserRouter>
      <GlobalStyles />
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside style={{
          width: 224,
          background: 'linear-gradient(180deg, #0f2554 0%, #1e3a8a 60%, #1d4ed8 100%)',
          display: 'flex', flexDirection: 'column',
          position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100,
          boxShadow: '2px 0 20px rgba(0,0,0,0.18)',
        }}>
          {/* Brand */}
          <div style={{ padding: '28px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, backdropFilter: 'blur(4px)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>🏥</div>
              <div>
                <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>SaludRed</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 500, letterSpacing: '0.5px' }}>NORTE · Sistema de Salud</div>
              </div>
            </div>
          </div>

          {/* Nav Label */}
          <div style={{ padding: '20px 20px 8px', color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Módulos
          </div>

          {/* Nav Links */}
          <nav style={{ padding: '0 10px', flex: 1 }}>
            {NAV.map(({ to, label, icon, exact }) => (
              <NavLink key={to} to={to} end={exact}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 8,
                  textDecoration: 'none', marginBottom: 3,
                  background: isActive ? 'rgba(255,255,255,0.14)' : 'transparent',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.55)',
                  fontSize: 13.5, fontWeight: isActive ? 600 : 400,
                  borderLeft: isActive ? '3px solid #93c5fd' : '3px solid transparent',
                  transition: 'all 0.15s',
                })}>
                <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{icon}</span>
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, lineHeight: 1.7 }}>
              Arquitectura Microservicios<br />
              BFF · Prisma · MySQL · Docker
            </div>
          </div>
        </aside>

        {/* ── Main area ──────────────────────────────────────── */}
        <div style={{ marginLeft: 224, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <ServiceStatusBar />
          <main style={{ flex: 1, padding: '32px 36px' }}>
            <Routes>
              <Route path="/" element={<PacientesPage />} />
              <Route path="/solicitudes" element={<SolicitudesPage />} />
              <Route path="/lista-espera" element={<ListaEsperaPage />} />
            </Routes>
          </main>
          <footer style={{
            padding: '12px 36px',
            color: '#94a3b8', fontSize: 11,
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>SaludRedNorte · DSY1106 — Desarrollo Fullstack III</span>
            <span>React + Vite · TypeScript · Express · Prisma · MySQL</span>
          </footer>
        </div>

      </div>
    </BrowserRouter>
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
  );
}
