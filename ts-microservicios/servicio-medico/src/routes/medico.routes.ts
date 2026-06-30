import { Router } from 'express';
import { medicoController } from '../controllers/medico.controller';

const router = Router();

/**
 * GET    /medico                     - Listar todos (acepta ?especialidadId=X)
 * GET    /medico/:id                 - Obtener por ID
 * GET    /medico/rut/:rut            - Obtener por RUT
 * POST   /medico                     - Crear nuevo médico
 * PUT    /medico/:id                 - Actualizar médico
 * DELETE /medico/:id                 - Eliminar médico
 */

router.get('/', (req, res) => medicoController.listar(req, res));
router.get('/rut/:rut', (req, res) => medicoController.obtenerPorRut(req, res));
router.get('/:id', (req, res) => medicoController.obtener(req, res));
router.post('/', (req, res) => medicoController.crear(req, res));
router.put('/:id', (req, res) => medicoController.actualizar(req, res));
router.delete('/:id', (req, res) => medicoController.eliminar(req, res));

export default router;
