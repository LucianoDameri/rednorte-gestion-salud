import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';

function CrossIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="35" y="5" width="30" height="90" rx="6" fill="#ef4444"/>
      <rect x="5" y="35" width="90" height="30" rx="6" fill="#ef4444"/>
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error de conexión. Verifica que el BFF esté activo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ── Panel izquierdo (branding) ─────────────────────── */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">
            <CrossIcon />
          </div>
          <h1 className="login-brand-title">Red Norte</h1>
        </div>
      </div>

      {/* ── Panel derecho (formulario) ─────────────────────── */}
      <div className="login-right">
        <div className="login-form-card">
          <h2 className="login-form-title">Iniciar sesión</h2>
          <p className="login-form-sub">Ingresa tus credenciales para continuar</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form-inner">
            <div className="form-group">
              <label className="form-label">Usuario</label>
              <input
                data-testid="input-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Usuario"
                required
                autoFocus
                className="form-input"
                style={{ fontSize: 14 }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                data-testid="input-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="form-input"
                style={{ fontSize: 14 }}
              />
            </div>

            {error && (
              <div data-testid="login-error" className="alert alert-error">
                ⚠️ {error}
              </div>
            )}

            <button
              data-testid="btn-login"
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg btn-full"
            >
              {loading ? '⏳ Verificando…' : 'Ingresar al sistema →'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
