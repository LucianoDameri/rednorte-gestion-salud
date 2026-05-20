import prisma from '../lib/prisma';

export type CreatePacienteDto = {
  rut: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  email?: string;
};

export type UpdatePacienteDto = Partial<CreatePacienteDto>;

export class PacienteService {
  async findAll() {
    return prisma.paciente.findMany({ orderBy: { apellido: 'asc' } });
  }

  async findById(id: number) {
    return prisma.paciente.findUnique({ where: { id } });
  }

  async findByRut(rut: string) {
    return prisma.paciente.findUnique({ where: { rut } });
  }

  async create(data: CreatePacienteDto) {
    return prisma.paciente.create({ data });
  }

  async update(id: number, data: UpdatePacienteDto) {
    return prisma.paciente.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.paciente.delete({ where: { id } });
  }

  async exists(id: number): Promise<boolean> {
    return (await prisma.paciente.count({ where: { id } })) > 0;
  }
}

export const pacienteService = new PacienteService();
