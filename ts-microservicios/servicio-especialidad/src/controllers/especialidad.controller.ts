import { Request, Response } from 'express';
import { especialidadService } from '../services/especialidad.service';
import { Prisma } from '@prisma/client';

export class EspecialidadController {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const especialidades = await especialidadService.findAll();
      if (especialidades.length === 0) {
        res.status(204).send();
        return;
      }
      res.json(especialidades);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar especialidades' });
    }
  }

  async obtener(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const especialidad = await especialidadService.findById(id);
      if (!especialidad) {
        res.status(404).json({ error: 'Especialidad no encontrada' });
        return;
      }

      res.json(especialidad);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener especialidad' });
    }
  }

  async obtenerPorCodigo(req: Request, res: Response): Promise<void> {
    try {
      const { codigo } = req.params;
      const especialidad = await especialidadService.findByCodigo(codigo.toUpperCase());
      if (!especialidad) {
        res.status(404).json({ error: 'Especialidad no encontrada' });
        return;
      }
      res.json(especialidad);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener especialidad por código' });
    }
  }

  async crear(req: Request, res: Response): Promise<void> {
    try {
      const { codigo, nombre, descripcion, activo } = req.body;

      if (!codigo || !nombre) {
        res.status(400).json({ error: 'Los campos código y nombre son obligatorios' });
        return;
      }

      const especialidad = await especialidadService.create({
        codigo: codigo.toUpperCase(),
        nombre,
        descripcion,
        activo,
      });

      res.status(201).json(especialidad);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        res.status(409).json({ error: 'Ya existe una especialidad con ese código' });
        return;
      }
      res.status(500).json({ error: 'Error al crear especialidad' });
    }
  }

  async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const existe = await especialidadService.exists(id);
      if (!existe) {
        res.status(404).json({ error: 'Especialidad no encontrada' });
        return;
      }

      const { codigo, nombre, descripcion, activo } = req.body;
      const especialidad = await especialidadService.update(id, {
        codigo: codigo?.toUpperCase(),
        nombre,
        descripcion,
        activo,
      });

      res.json(especialidad);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        res.status(409).json({ error: 'Ya existe una especialidad con ese código' });
        return;
      }
      res.status(500).json({ error: 'Error al actualizar especialidad' });
    }
  }

  async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const existe = await especialidadService.exists(id);
      if (!existe) {
        res.status(404).json({ error: 'Especialidad no encontrada' });
        return;
      }

      await especialidadService.delete(id);
      res.status(200).json({ message: 'Especialidad eliminada correctamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar especialidad' });
    }
  }
}

export const especialidadController = new EspecialidadController();
