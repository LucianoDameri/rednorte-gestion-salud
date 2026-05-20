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
  );
}
