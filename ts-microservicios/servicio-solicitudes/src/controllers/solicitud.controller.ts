import { Request, Response } from 'express';
import { solicitudService } from '../services/solicitud.service';

const TIPOS_VALIDOS = ['CONSULTA', 'PROCEDIMIENTO', 'CIRUGIA', 'DIAGNOSTICO'];

<<<<<<< HEAD
export class SolicitudController {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const { pacienteId, especialidadId } = req.query;
      let data;
      if (pacienteId) data = await solicitudService.findByPaciente(Number(pacienteId));
      else if (especialidadId) data = await solicitudService.findByEspecialidad(Number(especialidadId));
      else data = await solicitudService.findAll();
=======
// @types/express v5: req.params y req.query pueden ser string | string[]
const p = (v: unknown): string => (Array.isArray(v) ? v[0] : String(v ?? ''));

export class SolicitudController {
  async listar(req: Request, res: Response): Promise<void> {
    try {
      const pacienteId    = req.query.pacienteId    ? p(req.query.pacienteId)    : undefined;
      const especialidadId = req.query.especialidadId ? p(req.query.especialidadId) : undefined;

      let data;
      if (pacienteId)      data = await solicitudService.findByPaciente(Number(pacienteId));
      else if (especialidadId) data = await solicitudService.findByEspecialidad(Number(especialidadId));
      else                 data = await solicitudService.findAll();
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443

      data.length === 0 ? res.status(204).send() : res.json(data);
    } catch {
      res.status(500).json({ error: 'Error al listar solicitudes' });
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
<<<<<<< HEAD
      if (!TIPOS_VALIDOS.includes(tipoAtencion)) {
=======
      if (!TIPOS_VALIDOS.includes(String(tipoAtencion))) {
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
        res.status(400).json({ error: `tipoAtencion debe ser: ${TIPOS_VALIDOS.join(', ')}` });
        return;
      }

      const solicitud = await solicitudService.create({
<<<<<<< HEAD
        pacienteId: Number(pacienteId),
        especialidadId: Number(especialidadId),
        tipoAtencion,
        descripcion,
=======
        pacienteId:    Number(pacienteId),
        especialidadId: Number(especialidadId),
        tipoAtencion:  String(tipoAtencion),
        descripcion:   descripcion ? String(descripcion) : undefined,
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
      });
      res.status(201).json(solicitud);
    } catch {
      res.status(500).json({ error: 'Error al crear solicitud' });
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
      if (!(await solicitudService.exists(id))) {
        res.status(404).json({ error: 'Solicitud no encontrada' }); return;
      }
      const { especialidadId, tipoAtencion, descripcion } = req.body;
<<<<<<< HEAD
      if (tipoAtencion && !TIPOS_VALIDOS.includes(tipoAtencion)) {
=======
      if (tipoAtencion && !TIPOS_VALIDOS.includes(String(tipoAtencion))) {
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
        res.status(400).json({ error: `tipoAtencion debe ser: ${TIPOS_VALIDOS.join(', ')}` }); return;
      }
      const solicitud = await solicitudService.update(id, {
        especialidadId: especialidadId ? Number(especialidadId) : undefined,
<<<<<<< HEAD
        tipoAtencion, descripcion,
=======
        tipoAtencion:   tipoAtencion   ? String(tipoAtencion)   : undefined,
        descripcion:    descripcion    ? String(descripcion)    : undefined,
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
      });
      res.json(solicitud);
    } catch {
      res.status(500).json({ error: 'Error al actualizar solicitud' });
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
