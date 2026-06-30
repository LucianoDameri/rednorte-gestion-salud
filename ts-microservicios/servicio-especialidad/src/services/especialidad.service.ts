import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export type CreateEspecialidadDto = {
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
};

export type UpdateEspecialidadDto = Partial<CreateEspecialidadDto>;

export class EspecialidadService {
  async findAll() {
    return prisma.especialidad.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async findById(id: number) {
    return prisma.especialidad.findUnique({
      where: { id },
    });
  }

  async findByCodigo(codigo: string) {
    return prisma.especialidad.findUnique({
      where: { codigo },
    });
  }

  async create(data: CreateEspecialidadDto) {
    return prisma.especialidad.create({ data });
  }

  async update(id: number, data: UpdateEspecialidadDto) {
    return prisma.especialidad.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return prisma.especialidad.delete({
      where: { id },
    });
  }

  async exists(id: number): Promise<boolean> {
    const count = await prisma.especialidad.count({ where: { id } });
    return count > 0;
  }
}

export const especialidadService = new EspecialidadService();
