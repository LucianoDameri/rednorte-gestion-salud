import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

export type Rol = 'RECEPCIONISTA' | 'MEDICO';

export interface UsuarioAuth {
  id: string;
  username: string;
  nombre: string;
  rol: Rol;
}

interface AuthContextType {
  usuario: UsuarioAuth | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isRecepcionista: boolean;
  isMedico: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'saludrednorte_token';
const USUARIO_KEY = 'saludrednorte_usuario';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioAuth | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión desde localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUsuario = localStorage.getItem(USUARIO_KEY);
    if (storedToken && storedUsuario) {
      try {
        setToken(storedToken);
        setUsuario(JSON.parse(storedUsuario));
        // Poner el token en los headers globales de axios
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USUARIO_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const res = await axios.post('/auth/login', { username, password });
    const { token: newToken, usuario: newUsuario } = res.data;

    setToken(newToken);
    setUsuario(newUsuario);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(newUsuario));
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      loading,
      login,
      logout,
      isAuthenticated: !!token && !!usuario,
      isRecepcionista: usuario?.rol === 'RECEPCIONISTA',
      isMedico: usuario?.rol === 'MEDICO',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
