import prisma from './lib/prisma';

const pacientes = [
  { rut: '11111111-1', nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@email.com', telefono: '+56911111111' },
  { rut: '22222222-2', nombre: 'María', apellido: 'García', email: 'maria.garcia@email.com', telefono: '+56922222222' },
  { rut: '33333333-3', nombre: 'Roberto', apellido: 'Silva', email: 'roberto.silva@email.com', telefono: '+56933333333' },
  { rut: '44444444-4', nombre: 'Carla', apellido: 'Muñoz', email: 'carla.munoz@email.com', telefono: '+56944444444' },
];

async function seed() {
  console.log('🌱 Seed pacientes...');
  for (const p of pacientes) {
    await prisma.paciente.upsert({ where: { rut: p.rut }, update: {}, create: p });
    console.log(`  ✅ ${p.nombre} ${p.apellido}`);
  }
  console.log('🎉 Listo!');
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
