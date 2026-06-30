import { Request, Response } from 'express';
import { solicitudService } from '../services/solicitud.service';

const TIPOS_VALIDOS = ['CONSULTA', 'PROCEDIMIENTO', 'CIRUGIA', 'DIAGNOSTICO'];

export class SolicitudController {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { pacienteId, especialidadId } = req.query;
      let data;
      if (pacienteId) data = await solicitudService.findByPaciente(Number(pacienteId));
      else if (especialidadId) data = await solicitudService.findByEspecialidad(Number(especialidadId));
      else data = await solicitudService.findAll();

      data.length === 0 ? res.status(204).send() : res.json(data);
    } catch {
      res.status(500).json({ error: 'Error al listar solicitudes' });
    }
  }

  async obtener(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return; }
      const solicitud = await solicitudService.findById(id);
      solicitud ? res.json(solicitud) : res.status(404).json({ error: 'Solicitud no encontrada' });
    } catch {
      res.status(500).json({ error: 'Error al obtener solicitud' });
    }
  }

  async crear(req: Request, res: Response): Promise<void> {
    try {
      const { pacienteId, especialidadId, tipoAtencion, descripcion } = req.body;

      if (!pacienteId || !especialidadId || !tipoAtencion) {
        res.status(400).json({ error: 'pacienteId, especialidadId y tipoAtencion son obligatorios' });
        return;
      }
      if (!TIPOS_VALIDOS.includes(tipoAtencion)) {
        res.status(400).json({ error: `tipoAtencion debe ser: ${TIPOS_VALIDOS.join(', ')}` });
        return;
      }

      const solicitud = await solicitudService.create({
        pacienteId: Number(pacienteId),
        especialidadId: Number(especialidadId),
        tipoAtencion,
        descripcion,
      });
      res.status(201).json(solicitud);
    } catch {
      res.status(500).json({ error: 'Error al crear solicitud' });
    }
  }

  async actualizar(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return; }
      if (!(await solicitudService.exists(id))) {
        res.status(404).json({ error: 'Solicitud no encontrada' }); return;
      }
      const { especialidadId, tipoAtencion, descripcion } = req.body;
      if (tipoAtencion && !TIPOS_VALIDOS.includes(tipoAtencion)) {
        res.status(400).json({ error: `tipoAtencion debe ser: ${TIPOS_VALIDOS.join(', ')}` }); return;
      }
      const solicitud = await solicitudService.update(id, {
        especialidadId: especialidadId ? Number(especialidadId) : undefined,
        tipoAtencion, descripcion,
      });
      res.json(solicitud);
    } catch {
      res.status(500).json({ error: 'Error al actualizar solicitud' });
    }
  }

  async eliminar(req: Request<{ id: string }>, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) { res.status(400).json({ error: 'ID inválido' }); return; }
      if (!(await solicitudService.exists(id))) {
        res.status(404).json({ error: 'Solicitud no encontrada' }); return;
      }
      await solicitudService.delete(id);
      res.status(200).json({ message: 'Solicitud eliminada' });
    } catch {
      res.status(500).json({ error: 'Error al eliminar solicitud' });
    }
  }
}

export const solicitudController = new SolicitudController();
