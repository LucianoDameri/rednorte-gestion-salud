import { Request, Response } from 'express';
import { pacienteService } from '../services/paciente.service';
import { Prisma } from '@prisma/client';

<<<<<<< HEAD
=======
// @types/express v5 tipea req.params como string | string[]
// p() fuerza el primer valor a string
const p = (v: unknown): string => (Array.isArray(v) ? v[0] : String(v ?? ''));

>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
export class PacienteController {
  async listar(_req: Request, res: Response): Promise<void> {
    try {
      const pacientes = await pacienteService.findAll();
      pacientes.length === 0 ? res.status(204).send() : res.json(pacientes);
    } catch {
      res.status(500).json({ error: 'Error al listar pacientes' });
    }
  }

<<<<<<< HEAD
  async obtener(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
=======
  async obtener(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(p(req.params.id));
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
      if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return; }
      const paciente = await pacienteService.findById(id);
      paciente ? res.json(paciente) : res.status(404).json({ error: 'Paciente no encontrado' });
    } catch {
      res.status(500).json({ error: 'Error al obtener paciente' });
    }
  }

<<<<<<< HEAD
  async obtenerPorRut(req: Request<{ rut: string }>, res: Response): Promise<void> {
    try {
      const paciente = await pacienteService.findByRut(req.params.rut);
=======
  async obtenerPorRut(req: Request, res: Response): Promise<void> {
    try {
      const paciente = await pacienteService.findByRut(p(req.params.rut));
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
      paciente ? res.json(paciente) : res.status(404).json({ error: 'Paciente no encontrado' });
    } catch {
      res.status(500).json({ error: 'Error al obtener paciente por RUT' });
    }
  }

  async crear(req: Request, res: Response): Promise<void> {
    try {
      const { rut, nombre, apellido, telefono, email } = req.body;
      if (!rut || !nombre || !apellido) {
        res.status(400).json({ error: 'rut, nombre y apellido son obligatorios' });
        return;
      }
      const paciente = await pacienteService.create({ rut, nombre, apellido, telefono, email });
      res.status(201).json(paciente);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        res.status(409).json({ error: 'Ya existe un paciente con ese RUT' });
        return;
      }
      res.status(500).json({ error: 'Error al crear paciente' });
    }
  }

<<<<<<< HEAD
  async actualizar(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
=======
  async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(p(req.params.id));
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
      if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return; }
      if (!(await pacienteService.exists(id))) {
        res.status(404).json({ error: 'Paciente no encontrado' }); return;
      }
      const { nombre, apellido, telefono, email } = req.body;
      const paciente = await pacienteService.update(id, { nombre, apellido, telefono, email });
      res.json(paciente);
    } catch {
      res.status(500).json({ error: 'Error al actualizar paciente' });
    }
  }

<<<<<<< HEAD
  async eliminar(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
=======
  async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(p(req.params.id));
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
      if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return; }
      if (!(await pacienteService.exists(id))) {
        res.status(404).json({ error: 'Paciente no encontrado' }); return;
      }
      await pacienteService.delete(id);
      res.status(200).json({ message: 'Paciente eliminado' });
    } catch {
      res.status(500).json({ error: 'Error al eliminar paciente' });
    }
  }
}

export const pacienteController = new PacienteController();
