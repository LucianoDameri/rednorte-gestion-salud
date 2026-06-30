import { Router } from 'express';
import { solicitudController } from '../controllers/solicitud.controller';

const router = Router();

// GET /solicitud?pacienteId=X   - filtrar por paciente
// GET /solicitud?especialidadId=X - filtrar por especialidad
router.get('/', (req, res) => solicitudController.listar(req, res));
router.get('/:id', (req, res) => solicitudController.obtener(req, res));
router.post('/', (req, res) => solicitudController.crear(req, res));
router.put('/:id', (req, res) => solicitudController.actualizar(req, res));
router.delete('/:id', (req, res) => solicitudController.eliminar(req, res));

export default router;
