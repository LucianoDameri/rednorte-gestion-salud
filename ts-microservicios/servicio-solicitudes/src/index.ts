import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import solicitudRoutes from './routes/solicitud.routes';
import prisma from './lib/prisma';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => res.json({
  service: 'servicio-solicitudes',
  status: 'UP',
  timestamp: new Date().toISOString(),
  port: PORT,
}));

app.use('/solicitud', solicitudRoutes);
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

async function main() {
  await prisma.$connect();
  console.log('✅ BD conectada');
  app.listen(PORT, () => console.log(`📋 servicio-solicitudes en http://localhost:${PORT}`));
}

main().catch(e => { console.error(e); process.exit(1); });
process.on('SIGINT', async () => { await prisma.$disconnect(); process.exit(0); });
