import prisma from './lib/prisma';

// Asume que el seed de solicitudes ya se ejecutó (solicitudId 1-5)
const entradas = [
  { solicitudId: 1, pacienteId: 1, prioridad: 'NORMAL', numeroTurno: 1 },
  { solicitudId: 2, pacienteId: 1, prioridad: 'ALTA', numeroTurno: 2 },
  { solicitudId: 3, pacienteId: 2, prioridad: 'URGENTE', numeroTurno: 3 },
  { solicitudId: 4, pacienteId: 3, prioridad: 'NORMAL', numeroTurno: 4 },
  { solicitudId: 5, pacienteId: 4, prioridad: 'BAJA', numeroTurno: 5 },
];

async function seed() {
  console.log('🌱 Seed lista de espera...');
  for (const e of entradas) {
    await prisma.listaEspera.upsert({
      where: { solicitudId: e.solicitudId },
      update: {},
      create: { ...e, estado: 'EN_ESPERA' },
    });
    console.log(`  ✅ Turno #${e.numeroTurno} — solicitud ${e.solicitudId}, prioridad ${e.prioridad}`);
  }
  console.log('🎉 Listo!');
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
