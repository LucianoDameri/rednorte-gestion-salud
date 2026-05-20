import prisma from '../lib/prisma';

export type CreateSolicitudDto = {
  pacienteId: number;
  especialidadId: number;
  tipoAtencion: string;
  descripcion?: string;
};

export type UpdateSolicitudDto = Partial<Omit<CreateSolicitudDto, 'pacienteId'>>;

export class SolicitudService {
  findAll() {
    return prisma.solicitud.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findById(id: number) {
    return prisma.solicitud.findUnique({ where: { id } });
  }

  findByPaciente(pacienteId: number) {
    return prisma.solicitud.findMany({
      where: { pacienteId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByEspecialidad(especialidadId: number) {
    return prisma.solicitud.findMany({
      where: { especialidadId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: CreateSolicitudDto) {
    return prisma.solicitud.create({ data });
  }

  update(id: number, data: UpdateSolicitudDto) {
    return prisma.solicitud.update({ where: { id }, data });
  }

  delete(id: number) {
    return prisma.solicitud.delete({ where: { id } });
  }

  async exists(id: number): Promise<boolean> {
    return (await prisma.solicitud.count({ where: { id } })) > 0;
  }
}

export const solicitudService = new SolicitudService();
