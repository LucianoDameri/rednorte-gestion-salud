import { Request, Response } from 'express';
import { medicoService } from '../services/medico.service';
import { Prisma } from '@prisma/client';

export class MedicoController {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { especialidadId } = req.query;

      let medicos;
      if (especialidadId) {
        const espId = parseInt(especialidadId as string);
        if (isNaN(espId)) {
          res.status(400).json({ error: 'especialidadId inválido' });
          return;
        }
        medicos = await medicoService.findByEspecialidad(espId);
      } else {
        medicos = await medicoService.findAll();
      }

      if (medicos.length === 0) {
        res.status(204).send();
        return;
      }
      res.json(medicos);
    } catch (error) {
      res.status(500).json({ error: 'Error al listar médicos' });
    }
  }

  async obtener(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const medico = await medicoService.findById(id);
      if (!medico) {
        res.status(404).json({ error: 'Médico no encontrado' });
        return;
      }
      res.json(medico);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener médico' });
    }
  }

  async obtenerPorRut(req: Request, res: Response): Promise<void> {
    try {
      const medico = await medicoService.findByRut(req.params.rut);
      if (!medico) {
        res.status(404).json({ error: 'Médico no encontrado' });
        return;
      }
      res.json(medico);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener médico por RUT' });
    }
  }

  async crear(req: Request, res: Response): Promise<void> {
    try {
      const { rut, nombre, apellido, telefono, email, especialidadId, activo } = req.body;

      if (!rut || !nombre || !apellido || !email || !especialidadId) {
        res.status(400).json({
          error: 'Los campos rut, nombre, apellido, email y especialidadId son obligatorios',
        });
        return;
      }

      const medico = await medicoService.create({
        rut,
        nombre,
        apellido,
        telefono,
        email,
        especialidadId: parseInt(especialidadId),
        activo,
      });

      res.status(201).json(medico);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        res.status(409).json({ error: 'Ya existe un médico con ese RUT o email' });
        return;
      }
      res.status(500).json({ error: 'Error al crear médico' });
    }
  }

  async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const existe = await medicoService.exists(id);
      if (!existe) {
        res.status(404).json({ error: 'Médico no encontrado' });
        return;
      }

      const { rut, nombre, apellido, telefono, email, especialidadId, activo } = req.body;
      const medico = await medicoService.update(id, {
        rut,
        nombre,
        apellido,
        telefono,
        email,
        especialidadId: especialidadId ? parseInt(especialidadId) : undefined,
        activo,
      });

      res.json(medico);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        res.status(409).json({ error: 'Ya existe un médico con ese RUT o email' });
        return;
      }
      res.status(500).json({ error: 'Error al actualizar médico' });
    }
  }

  async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ error: 'ID inválido' });
        return;
      }

      const existe = await medicoService.exists(id);
      if (!existe) {
        res.status(404).json({ error: 'Médico no encontrado' });
        return;
      }

      await medicoService.delete(id);
      res.status(200).json({ message: 'Médico eliminado correctamente' });
    } catch (error) {
      res.status(500).json({ error: 'Error al eliminar médico' });
    }
  }
}

export const medicoController = new MedicoController();
