import prisma from '../lib/prisma';

export type CreateListaEsperaDto = {
  solicitudId: number;
  pacienteId: number;
  prioridad?: string;
  fechaEstimada?: Date;
  observaciones?: string;
};

export type UpdateListaEsperaDto = {
  prioridad?: string;
  estado?: string;
  numeroTurno?: number;
  fechaEstimada?: Date | null;
  observaciones?: string;
};

export class ListaEsperaService {
  findAll(filtros?: { estado?: string; prioridad?: string }) {
    return prisma.listaEspera.findMany({
      where: filtros,
      orderBy: [
        // Orden por prioridad: URGENTE primero
        { prioridad: 'asc' },
        { createdAt: 'asc' },
      ],
    });
  }

  findById(id: number) {
    return prisma.listaEspera.findUnique({ where: { id } });
  }

  findBySolicitud(solicitudId: number) {
    return prisma.listaEspera.findUnique({ where: { solicitudId } });
  }

  findByPaciente(pacienteId: number) {
    return prisma.listaEspera.findMany({
      where: { pacienteId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateListaEsperaDto) {
    // Generar número de turno automático basado en cuántos hay en espera
    const totalEnEspera = await prisma.listaEspera.count({
      where: { estado: 'EN_ESPERA' },
    });

    return prisma.listaEspera.create({
      data: {
        ...data,
        numeroTurno: totalEnEspera + 1,
        estado: 'EN_ESPERA',
      },
    });
  }

  update(id: number, data: UpdateListaEsperaDto) {
    return prisma.listaEspera.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.listaEspera.delete({ where: { id } });
  }

  async exists(id: number): Promise<boolean> {
    return (await prisma.listaEspera.count({ where: { id } })) > 0;
  }

  // Resumen estadístico de la lista
  async resumen() {
    const [total, enEspera, asignada, atendida, cancelada, urgentes] = await Promise.all([
      prisma.listaEspera.count(),
      prisma.listaEspera.count({ where: { estado: 'EN_ESPERA' } }),
      prisma.listaEspera.count({ where: { estado: 'ASIGNADA' } }),
      prisma.listaEspera.count({ where: { estado: 'ATENDIDA' } }),
      prisma.listaEspera.count({ where: { estado: 'CANCELADA' } }),
      prisma.listaEspera.count({ where: { prioridad: 'URGENTE', estado: 'EN_ESPERA' } }),
    ]);
    return { total, enEspera, asignada, atendida, cancelada, urgentes };
  }
}

export const listaEsperaService = new ListaEsperaService();
