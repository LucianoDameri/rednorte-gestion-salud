import prisma from './lib/prisma';

const especialidades = [
  { codigo: 'CARD', nombre: 'Cardiología', descripcion: 'Diagnóstico y tratamiento de enfermedades del corazón y sistema cardiovascular' },
  { codigo: 'OFTAL', nombre: 'Oftalmología', descripcion: 'Diagnóstico y tratamiento de enfermedades oculares' },
  { codigo: 'TRAUMA', nombre: 'Traumatología', descripcion: 'Tratamiento de lesiones del sistema musculoesquelético' },
  { codigo: 'NEURO', nombre: 'Neurología', descripcion: 'Diagnóstico y tratamiento de enfermedades del sistema nervioso' },
  { codigo: 'DERMA', nombre: 'Dermatología', descripcion: 'Diagnóstico y tratamiento de enfermedades de la piel' },
  { codigo: 'GINE', nombre: 'Ginecología', descripcion: 'Salud del sistema reproductor femenino' },
  { codigo: 'PEDIA', nombre: 'Pediatría', descripcion: 'Atención médica de niños y adolescentes' },
  { codigo: 'PSIQ', nombre: 'Psiquiatría', descripcion: 'Diagnóstico y tratamiento de trastornos mentales' },
];

async function seed() {
  console.log('🌱 Iniciando seed de especialidades...');
  for (const esp of especialidades) {
    await prisma.especialidad.upsert({
      where: { codigo: esp.codigo },
      update: {},
      create: esp,
    });
    console.log(`  ✅ ${esp.nombre} (${esp.codigo})`);
  }
  console.log('🎉 Seed completado!');
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
