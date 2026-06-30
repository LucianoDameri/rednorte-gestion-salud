import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import especialidadRoutes from './routes/especialidad.routes';
import prisma from './lib/prisma';

const app = express();
const PORT = process.env.PORT || 3002;

// ─── Middlewares ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    service: 'servicio-especialidad',
    status: 'UP',
    timestamp: new Date().toISOString(),
    port: PORT,
  });
});

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/especialidad', especialidadRoutes);

// ─── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ─── Start Server ──────────────────────────────────────────────────────────────
async function main() {
  try {
    await prisma.$connect();
    console.log('✅ Conexión a base de datos establecida');

    app.listen(PORT, () => {
      console.log(`🏥 Servicio Especialidad corriendo en http://localhost:${PORT}`);
      console.log(`📋 Endpoints disponibles:`);
      console.log(`   GET    http://localhost:${PORT}/especialidad`);
      console.log(`   GET    http://localhost:${PORT}/especialidad/:id`);
      console.log(`   GET    http://localhost:${PORT}/especialidad/codigo/:codigo`);
      console.log(`   POST   http://localhost:${PORT}/especialidad`);
      console.log(`   PUT    http://localhost:${PORT}/especialidad/:id`);
      console.log(`   DELETE http://localhost:${PORT}/especialidad/:id`);
      console.log(`   GET    http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error);
    process.exit(1);
  }
}

main();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('\n🔌 Conexión a BD cerrada. Servidor detenido.');
  process.exit(0);
});
