import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import pacienteRoutes from './routes/paciente.routes';
import solicitudRoutes from './routes/solicitud.routes';
import listaEsperaRoutes from './routes/listaEspera.routes';
import { pacienteClient, solicitudClient, listaEsperaClient } from './clients/serviceClients';
import { login } from './auth/authController';
import { requireAuth, requireRol } from './middleware/authMiddleware';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ─── Auth (público) ──────────────────────────────────────────────────────────
app.post('/auth/login', login);

// ─── Health Check del BFF + estado de microservicios downstream ──────────────
app.get('/health', async (_req, res) => {
  const checkService = async (client: typeof pacienteClient, name: string) => {
    try {
      await client.get('/health');
      return { name, status: 'UP' };
    } catch {
      return { name, status: 'DOWN' };
    }
  };

  const [paciente, solicitud, listaEspera] = await Promise.all([
    checkService(pacienteClient, 'servicio-paciente'),
    checkService(solicitudClient, 'servicio-solicitudes'),
    checkService(listaEsperaClient, 'servicio-lista-espera'),
  ]);

  const allUp = [paciente, solicitud, listaEspera].every(s => s.status === 'UP');

  res.status(allUp ? 200 : 207).json({
    service: 'BFF SaludRedNorte',
    status: allUp ? 'UP' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    port: PORT,
    downstream: { paciente, solicitud, listaEspera },
  });
});

// ─── Rutas BFF protegidas con JWT ─────────────────────────────────────────────
// Pacientes: CRUD completo para RECEPCIONISTA, solo GET para MEDICO
app.use('/bff/paciente', requireAuth, pacienteRoutes);

// Solicitudes: CRUD completo para RECEPCIONISTA, solo GET para MEDICO
app.use('/bff/solicitud', requireAuth, solicitudRoutes);

// Lista de Espera: ambos roles pueden ver y actualizar estado
app.use('/bff/lista-espera', requireAuth, listaEsperaRoutes);

// ─── Endpoint: info del usuario autenticado ───────────────────────────────────
app.get('/auth/me', requireAuth, (req, res) => {
  res.json({ usuario: req.usuario });
});

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada en el BFF' }));

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🌐 BFF SaludRedNorte en http://localhost:${PORT}`);
  console.log(`   → POST /auth/login           → autenticación JWT`);
  console.log(`   → /bff/paciente      → servicio-paciente   (:3001)`);
  console.log(`   → /bff/solicitud     → servicio-solicitudes (:3002)`);
  console.log(`   → /bff/lista-espera  → servicio-lista-espera (:3003)`);
  console.log(`   → /health            → estado de todos los servicios`);
});

export { app };
