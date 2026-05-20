import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import pacienteRoutes from './routes/paciente.routes';
import prisma from './lib/prisma';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (_req, res) => res.json({
  service: 'servicio-paciente',
  status: 'UP',
  timestamp: new Date().toISOString(),
  port: PORT,
}));

app.use('/paciente', pacienteRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

async function main() {
  await prisma.$connect();
  console.log('✅ BD conectada');
  app.listen(PORT, () => console.log(`🧑‍🤝‍🧑 servicio-paciente en http://localhost:${PORT}`));
}

main().catch(e => { console.error(e); process.exit(1); });
process.on('SIGINT', async () => { await prisma.$disconnect(); process.exit(0); });
