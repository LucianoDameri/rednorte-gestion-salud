import { Router, Request, Response } from 'express';
import { listaEsperaClient, extractError } from '../clients/serviceClients';

const router = Router();

// GET /bff/lista-espera?estado=EN_ESPERA&prioridad=URGENTE&pacienteId=X
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data } = await listaEsperaClient.get('/lista-espera', { params: req.query });
    res.json(data);
  } catch (error) {
    res.status(502).json({ error: 'Error al obtener lista de espera', detalle: extractError(error) });
  }
});

// GET /bff/lista-espera/resumen
router.get('/resumen', async (_req, res: Response) => {
  try {
    const { data } = await listaEsperaClient.get('/lista-espera/resumen');
    res.json(data);
  } catch (error) {
    res.status(502).json({ error: 'Error al obtener resumen', detalle: extractError(error) });
  }
});

// GET /bff/lista-espera/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { data } = await listaEsperaClient.get(`/lista-espera/${req.params.id}`);
    res.json(data);
  } catch (error) {
    const status = (error as any)?.response?.status || 502;
    res.status(status).json({ error: 'Error al obtener entrada', detalle: extractError(error) });
  }
});

// PUT /bff/lista-espera/:id — cambiar estado, prioridad, turno
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { data } = await listaEsperaClient.put(`/lista-espera/${req.params.id}`, req.body);
    res.json(data);
  } catch (error) {
    const status = (error as any)?.response?.status || 502;
    res.status(status).json({ error: 'Error al actualizar entrada', detalle: extractError(error) });
  }
});

// DELETE /bff/lista-espera/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { data } = await listaEsperaClient.delete(`/lista-espera/${req.params.id}`);
    res.json(data);
  } catch (error) {
    const status = (error as any)?.response?.status || 502;
    res.status(status).json({ error: 'Error al eliminar entrada', detalle: extractError(error) });
  }
});

export default router;
