import { Router } from 'express';
import { listaEsperaController } from '../controllers/listaEspera.controller';

const router = Router();

// GET /lista-espera?estado=EN_ESPERA&prioridad=URGENTE
// GET /lista-espera?pacienteId=1
router.get('/', (req, res) => listaEsperaController.listar(req, res));
router.get('/resumen', (req, res) => listaEsperaController.resumen(req, res));
router.get('/solicitud/:solicitudId', (req, res) => listaEsperaController.obtenerPorSolicitud(req, res));
router.get('/:id', (req, res) => listaEsperaController.obtener(req, res));
router.post('/', (req, res) => listaEsperaController.crear(req, res));
router.put('/:id', (req, res) => listaEsperaController.actualizar(req, res));
router.delete('/:id', (req, res) => listaEsperaController.eliminar(req, res));

export default router;
