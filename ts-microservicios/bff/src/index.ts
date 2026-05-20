import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import pacienteRoutes from './routes/paciente.routes';
import solicitudRoutes from './routes/solicitud.routes';
import listaEsperaRoutes from './routes/listaEspera.routes';
import { pacienteClient, solicitudClient, listaEsperaClient } from './clients/serviceClients';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

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

// ─── Rutas BFF ────────────────────────────────────────────────────────────────
app.use('/bff/paciente', pacienteRoutes);
app.use('/bff/solicitud', solicitudRoutes);
app.use('/bff/lista-espera', listaEsperaRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada en el BFF' }));

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🌐 BFF SaludRedNorte en http://localhost:${PORT}`);
  console.log(`   → /bff/paciente      → servicio-paciente   (:3001)`);
  console.log(`   → /bff/solicitud     → servicio-solicitudes (:3002)`);
  console.log(`   → /bff/lista-espera  → servicio-lista-espera (:3003)`);
  console.log(`   → /health            → estado de todos los servicios`);
});
