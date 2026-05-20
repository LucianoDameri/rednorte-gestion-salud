import prisma from '../lib/prisma';

export type CreateMedicoDto = {
  rut: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  email: string;
  especialidadId: number;
  activo?: boolean;
};

export type UpdateMedicoDto = Partial<CreateMedicoDto>;

export class MedicoService {
  async findAll() {
    return prisma.medico.findMany({
      orderBy: { apellido: 'asc' },
    });
  }

  async findByEspecialidad(especialidadId: number) {
    return prisma.medico.findMany({
      where: { especialidadId, activo: true },
      orderBy: { apellido: 'asc' },
    });
  }

  async findById(id: number) {
    return prisma.medico.findUnique({
      where: { id },
    });
  }

  async findByRut(rut: string) {
    return prisma.medico.findUnique({
      where: { rut },
    });
  }

  async create(data: CreateMedicoDto) {
    return prisma.medico.create({ data });
  }

  async update(id: number, data: UpdateMedicoDto) {
    return prisma.medico.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return prisma.medico.delete({
      where: { id },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await prisma.medico.count({ where: { id } });
    return count > 0;
  }
}

export const medicoService = new MedicoService();
