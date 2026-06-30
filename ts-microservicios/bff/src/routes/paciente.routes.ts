import { Router, Request, Response } from 'express';
import { pacienteClient, solicitudClient, listaEsperaClient, extractError } from '../clients/serviceClients';

const router = Router();

// GET /bff/paciente — lista todos los pacientes
router.get('/', async (_req, res: Response) => {
  try {
    const { data } = await pacienteClient.get('/paciente');
    res.json(data);
  } catch (error) {
    res.status(502).json({ error: 'Error al obtener pacientes', detalle: extractError(error) });
  }
});

// GET /bff/paciente/:id — paciente con sus solicitudes y estado en lista de espera (vista agregada)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Llamadas en paralelo al microservicio de paciente y solicitudes
    const [pacienteRes, solicitudesRes] = await Promise.allSettled([
      pacienteClient.get(`/paciente/${id}`),
      solicitudClient.get(`/solicitud?pacienteId=${id}`),
    ]);

    if (pacienteRes.status === 'rejected') {
      res.status(404).json({ error: 'Paciente no encontrado' });
      return;
    }

    const paciente = pacienteRes.value.data;
    const solicitudes = solicitudesRes.status === 'fulfilled'
      ? (Array.isArray(solicitudesRes.value.data) ? solicitudesRes.value.data : [])
      : [];

    // Para cada solicitud, buscar su turno en lista de espera
    const solicitudesEnriquecidas = await Promise.all(
      solicitudes.map(async (s: any) => {
        try {
          const { data: turno } = await listaEsperaClient.get(`/lista-espera/solicitud/${s.id}`);
          return { ...s, listaEspera: turno };
        } catch {
          return { ...s, listaEspera: null };
        }
      })
    );

    res.json({ ...paciente, solicitudes: solicitudesEnriquecidas });
  } catch (error) {
    res.status(502).json({ error: 'Error al obtener detalle del paciente', detalle: extractError(error) });
  }
});

// POST /bff/paciente
router.post('/', async (req: Request, res: Response) => {
  try {
    const { data } = await pacienteClient.post('/paciente', req.body);
    res.status(201).json(data);
  } catch (error) {
    const status = (error as any)?.response?.status || 502;
    res.status(status).json({ error: 'Error al crear paciente', detalle: extractError(error) });
  }
});

// PUT /bff/paciente/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { data } = await pacienteClient.put(`/paciente/${req.params.id}`, req.body);
    res.json(data);
  } catch (error) {
    const status = (error as any)?.response?.status || 502;
    res.status(status).json({ error: 'Error al actualizar paciente', detalle: extractError(error) });
  }
});

// DELETE /bff/paciente/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { data } = await pacienteClient.delete(`/paciente/${req.params.id}`);
    res.json(data);
  } catch (error) {
    const status = (error as any)?.response?.status || 502;
    res.status(status).json({ error: 'Error al eliminar paciente', detalle: extractError(error) });
  }
});

export default router;
