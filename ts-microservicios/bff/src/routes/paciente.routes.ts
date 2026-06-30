import { Router, Request, Response } from 'express';
import { pacienteClient, solicitudClient, listaEsperaClient, extractError } from '../clients/serviceClients';
<<<<<<< HEAD
=======
import { withResilience, pacientePolicy, solicitudPolicy, listaEsperaPolicy } from '../resilience/circuitBreaker';
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443

const router = Router();

// GET /bff/paciente — lista todos los pacientes
router.get('/', async (_req, res: Response) => {
  try {
<<<<<<< HEAD
    const { data } = await pacienteClient.get('/paciente');
=======
    const { data } = await withResilience(pacientePolicy, () =>
      pacienteClient.get('/paciente')
    );
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
    res.json(data);
  } catch (error) {
    res.status(502).json({ error: 'Error al obtener pacientes', detalle: extractError(error) });
  }
});

<<<<<<< HEAD
// GET /bff/paciente/:id — paciente con sus solicitudes y estado en lista de espera (vista agregada)
=======
// GET /bff/paciente/:id — paciente con solicitudes y estado en lista de espera (vista agregada)
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

<<<<<<< HEAD
    // Llamadas en paralelo al microservicio de paciente y solicitudes
    const [pacienteRes, solicitudesRes] = await Promise.allSettled([
      pacienteClient.get(`/paciente/${id}`),
      solicitudClient.get(`/solicitud?pacienteId=${id}`),
=======
    const [pacienteRes, solicitudesRes] = await Promise.allSettled([
      withResilience(pacientePolicy,  () => pacienteClient.get(`/paciente/${id}`)),
      withResilience(solicitudPolicy, () => solicitudClient.get(`/solicitud?pacienteId=${id}`)),
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
    ]);

    if (pacienteRes.status === 'rejected') {
      res.status(404).json({ error: 'Paciente no encontrado' });
      return;
    }

    const paciente = pacienteRes.value.data;
    const solicitudes = solicitudesRes.status === 'fulfilled'
      ? (Array.isArray(solicitudesRes.value.data) ? solicitudesRes.value.data : [])
      : [];

<<<<<<< HEAD
    // Para cada solicitud, buscar su turno en lista de espera
    const solicitudesEnriquecidas = await Promise.all(
      solicitudes.map(async (s: any) => {
        try {
          const { data: turno } = await listaEsperaClient.get(`/lista-espera/solicitud/${s.id}`);
=======
    const solicitudesEnriquecidas = await Promise.all(
      solicitudes.map(async (s: any) => {
        try {
          const { data: turno } = await withResilience(listaEsperaPolicy, () =>
            listaEsperaClient.get(`/lista-espera/solicitud/${s.id}`)
          );
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
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
<<<<<<< HEAD
    const { data } = await pacienteClient.post('/paciente', req.body);
=======
    const { data } = await withResilience(pacientePolicy, () =>
      pacienteClient.post('/paciente', req.body)
    );
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
    res.status(201).json(data);
  } catch (error) {
    const status = (error as any)?.response?.status || 502;
    res.status(status).json({ error: 'Error al crear paciente', detalle: extractError(error) });
  }
});

// PUT /bff/paciente/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    const { data } = await pacienteClient.put(`/paciente/${req.params.id}`, req.body);
=======
    const { data } = await withResilience(pacientePolicy, () =>
      pacienteClient.put(`/paciente/${req.params.id}`, req.body)
    );
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
    res.json(data);
  } catch (error) {
    const status = (error as any)?.response?.status || 502;
    res.status(status).json({ error: 'Error al actualizar paciente', detalle: extractError(error) });
  }
});

// DELETE /bff/paciente/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    const { data } = await pacienteClient.delete(`/paciente/${req.params.id}`);
=======
    const { data } = await withResilience(pacientePolicy, () =>
      pacienteClient.delete(`/paciente/${req.params.id}`)
    );
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
    res.json(data);
  } catch (error) {
    const status = (error as any)?.response?.status || 502;
    res.status(status).json({ error: 'Error al eliminar paciente', detalle: extractError(error) });
  }
});

export default router;
