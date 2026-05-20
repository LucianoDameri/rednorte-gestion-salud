import { Request, Response } from 'express';
import { listaEsperaService } from '../services/listaEspera.service';

const ESTADOS_VALIDOS    = ['EN_ESPERA', 'ASIGNADA', 'ATENDIDA', 'CANCELADA'];
const PRIORIDADES_VALIDAS = ['URGENTE', 'ALTA', 'NORMAL', 'BAJA'];

// @types/express v5: req.params y req.query pueden ser string | string[]
const p = (v: unknown): string => (Array.isArray(v) ? v[0] : String(v ?? ''));

export class ListaEsperaController {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const estado     = req.query.estado     ? p(req.query.estado)     : undefined;
      const prioridad  = req.query.prioridad  ? p(req.query.prioridad)  : undefined;
      const pacienteId = req.query.pacienteId ? p(req.query.pacienteId) : undefined;

      let data;
      if (pacienteId) {
        data = await listaEsperaService.findByPaciente(Number(pacienteId));
      } else {
        data = await listaEsperaService.findAll({ estado, prioridad });
      }

      data.length === 0 ? res.status(204).send() : res.json(data);
    } catch {
      res.status(500).json({ error: 'Error al listar lista de espera' });
    }
  }

  async resumen(_req: Request, res: Response): Promise<void> {
    try {
      const data = await listaEsperaService.resumen();
      res.json(data);
    } catch {
      res.status(500).json({ error: 'Error al obtener resumen' });
    }
  }

  async obtener(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(p(req.params.id));
      if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return; }
      const item = await listaEsperaService.findById(id);
      item ? res.json(item) : res.status(404).json({ error: 'Entrada no encontrada' });
    } catch {
      res.status(500).json({ error: 'Error al obtener entrada' });
    }
  }

  async obtenerPorSolicitud(req: Request, res: Response): Promise<void> {
    try {
      const solicitudId = parseInt(p(req.params.solicitudId));
      if (isNaN(solicitudId)) { res.status(400).json({ error: 'ID inválido' }); return; }
      const item = await listaEsperaService.findBySolicitud(solicitudId);
      item ? res.json(item) : res.status(404).json({ error: 'Solicitud no está en lista de espera' });
    } catch {
      res.status(500).json({ error: 'Error al buscar por solicitud' });
    }
  }

  async crear(req: Request, res: Response): Promise<void> {
    try {
      const { solicitudId, pacienteId, prioridad, fechaEstimada, observaciones } = req.body;

      if (!solicitudId || !pacienteId) {
        res.status(400).json({ error: 'solicitudId y pacienteId son obligatorios' }); return;
      }
      if (prioridad && !PRIORIDADES_VALIDAS.includes(String(prioridad))) {
        res.status(400).json({ error: `prioridad debe ser: ${PRIORIDADES_VALIDAS.join(', ')}` }); return;
      }

      const item = await listaEsperaService.create({
        solicitudId:   Number(solicitudId),
        pacienteId:    Number(pacienteId),
        prioridad:     prioridad     ? String(prioridad)              : undefined,
        fechaEstimada: fechaEstimada ? new Date(String(fechaEstimada)) : undefined,
        observaciones: observaciones ? String(observaciones)          : undefined,
      });
      res.status(201).json(item);
    } catch (error: any) {
      if (error?.code === 'P2002') {
        res.status(409).json({ error: 'Esta solicitud ya está en la lista de espera' }); return;
      }
      res.status(500).json({ error: 'Error al crear entrada en lista de espera' });
    }
  }

  async actualizar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(p(req.params.id));
      if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return; }
      if (!(await listaEsperaService.exists(id))) {
        res.status(404).json({ error: 'Entrada no encontrada' }); return;
      }

      const { prioridad, estado, numeroTurno, fechaEstimada, observaciones } = req.body;

      if (estado    && !ESTADOS_VALIDOS.includes(String(estado))) {
        res.status(400).json({ error: `estado debe ser: ${ESTADOS_VALIDOS.join(', ')}` }); return;
      }
      if (prioridad && !PRIORIDADES_VALIDAS.includes(String(prioridad))) {
        res.status(400).json({ error: `prioridad debe ser: ${PRIORIDADES_VALIDAS.join(', ')}` }); return;
      }

      const item = await listaEsperaService.update(id, {
        prioridad:     prioridad     ? String(prioridad)              : undefined,
        estado:        estado        ? String(estado)                 : undefined,
        numeroTurno:   numeroTurno   ? Number(numeroTurno)            : undefined,
        fechaEstimada: fechaEstimada ? new Date(String(fechaEstimada)) : undefined,
        observaciones: observaciones ? String(observaciones)          : undefined,
      });
      res.json(item);
    } catch {
      res.status(500).json({ error: 'Error al actualizar entrada' });
    }
  }

  async eliminar(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(p(req.params.id));
      if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return; }
      if (!(await listaEsperaService.exists(id))) {
        res.status(404).json({ error: 'Entrada no encontrada' }); return;
      }
      await listaEsperaService.delete(id);
      res.status(200).json({ message: 'Entrada eliminada de la lista de espera' });
    } catch {
      res.status(500).json({ error: 'Error al eliminar entrada' });
    }
  }
}

export const listaEsperaController = new ListaEsperaController();
