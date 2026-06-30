import { Router, Request, Response } from 'express';
import { solicitudClient, listaEsperaClient, extractError } from '../clients/serviceClients';
<<<<<<< HEAD
=======
import { withResilience, solicitudPolicy, listaEsperaPolicy } from '../resilience/circuitBreaker';
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443

const router = Router();

// GET /bff/solicitud?pacienteId=X
router.get('/', async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    const { data } = await solicitudClient.get('/solicitud', { params: req.query });
=======
    const { data } = await withResilience(solicitudPolicy, () =>
      solicitudClient.get('/solicitud', { params: req.query })
    );
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
    res.json(data);
  } catch (error) {
    res.status(502).json({ error: 'Error al obtener solicitudes', detalle: extractError(error) });
  }
});

// GET /bff/solicitud/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    const { data } = await solicitudClient.get(`/solicitud/${req.params.id}`);
=======
    const { data } = await withResilience(solicitudPolicy, () =>
      solicitudClient.get(`/solicitud/${req.params.id}`)
    );
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
    res.json(data);
  } catch (error) {
    const status = (error as any)?.response?.status || 502;
    res.status(status).json({ error: 'Error al obtener solicitud', detalle: extractError(error) });
  }
});

// POST /bff/solicitud — crea solicitud y la ingresa automáticamente a lista de espera
router.post('/', async (req: Request, res: Response) => {
  try {
    const { prioridad, ...solicitudData } = req.body;

<<<<<<< HEAD
    // 1. Crear la solicitud
    const { data: solicitud } = await solicitudClient.post('/solicitud', solicitudData);

    // 2. Ingresar automáticamente a lista de espera
    let listaEspera = null;
    try {
      const { data: turno } = await listaEsperaClient.post('/lista-espera', {
        solicitudId: solicitud.id,
        pacienteId: solicitud.pacienteId,
        prioridad: prioridad || 'NORMAL',
      });
=======
    const { data: solicitud } = await withResilience(solicitudPolicy, () =>
      solicitudClient.post('/solicitud', solicitudData)
    );

    let listaEspera = null;
    try {
      const { data: turno } = await withResilience(listaEsperaPolicy, () =>
        listaEsperaClient.post('/lista-espera', {
          solicitudId: solicitud.id,
          pacienteId: solicitud.pacienteId,
          prioridad: prioridad || 'NORMAL',
        })
      );
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
      listaEspera = turno;
    } catch (leError) {
      console.warn('⚠️ Solicitud creada pero no pudo ingresarse a lista de espera:', extractError(leError));
    }

    res.status(201).json({ ...solicitud, listaEspera });
  } catch (error) {
    const status = (error as any)?.response?.status || 502;
    res.status(status).json({ error: 'Error al crear solicitud', detalle: extractError(error) });
  }
});

// PUT /bff/solicitud/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    const { data } = await solicitudClient.put(`/solicitud/${req.params.id}`, req.body);
=======
    const { data } = await withResilience(solicitudPolicy, () =>
      solicitudClient.put(`/solicitud/${req.params.id}`, req.body)
    );
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
    res.json(data);
  } catch (error) {
    const status = (error as any)?.response?.status || 502;
    res.status(status).json({ error: 'Error al actualizar solicitud', detalle: extractError(error) });
  }
});

// DELETE /bff/solicitud/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    const { data } = await solicitudClient.delete(`/solicitud/${req.params.id}`);
=======
    const { data } = await withResilience(solicitudPolicy, () =>
      solicitudClient.delete(`/solicitud/${req.params.id}`)
    );
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
    res.json(data);
  } catch (error) {
    const status = (error as any)?.response?.status || 502;
    res.status(status).json({ error: 'Error al eliminar solicitud', detalle: extractError(error) });
  }
});

export default router;
