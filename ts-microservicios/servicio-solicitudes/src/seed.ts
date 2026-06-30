import prisma from './lib/prisma';

const solicitudes = [
  { pacienteId: 1, especialidadId: 1, tipoAtencion: 'CONSULTA', descripcion: 'Dolor en el pecho al esfuerzo' },
  { pacienteId: 1, especialidadId: 3, tipoAtencion: 'PROCEDIMIENTO', descripcion: 'Revisión rodilla derecha' },
  { pacienteId: 2, especialidadId: 2, tipoAtencion: 'CONSULTA', descripcion: 'Control de vista anual' },
  { pacienteId: 3, especialidadId: 4, tipoAtencion: 'DIAGNOSTICO', descripcion: 'Cefaleas frecuentes' },
  { pacienteId: 4, especialidadId: 5, tipoAtencion: 'CONSULTA', descripcion: 'Revisión lunar sospechosa' },
];

async function seed() {
  console.log('🌱 Seed solicitudes...');
  for (const s of solicitudes) {
    const created = await prisma.solicitud.create({ data: s });
    console.log(`  ✅ Solicitud #${created.id} — paciente ${s.pacienteId}, tipo ${s.tipoAtencion}`);
  }
  console.log('🎉 Listo!');
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
