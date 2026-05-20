import prisma from './lib/prisma';

const medicos = [
  { rut: '12345678-9', nombre: 'Carlos', apellido: 'Rodríguez', email: 'c.rodriguez@rednorte.cl', telefono: '+56912345678', especialidadId: 1 },
  { rut: '23456789-0', nombre: 'María', apellido: 'González', email: 'm.gonzalez@rednorte.cl', telefono: '+56923456789', especialidadId: 2 },
  { rut: '34567890-1', nombre: 'Pedro', apellido: 'Martínez', email: 'p.martinez@rednorte.cl', telefono: '+56934567890', especialidadId: 3 },
  { rut: '45678901-2', nombre: 'Ana', apellido: 'López', email: 'a.lopez@rednorte.cl', telefono: '+56945678901', especialidadId: 4 },
  { rut: '56789012-3', nombre: 'José', apellido: 'Sánchez', email: 'j.sanchez@rednorte.cl', telefono: '+56956789012', especialidadId: 1 },
];

async function seed() {
  console.log('🌱 Iniciando seed de médicos...');
  for (const m of medicos) {
    await prisma.medico.upsert({
      where: { rut: m.rut },
      update: {},
      create: m,
    });
    console.log(`  ✅ Dr. ${m.nombre} ${m.apellido}`);
  }
  console.log('🎉 Seed completado!');
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
