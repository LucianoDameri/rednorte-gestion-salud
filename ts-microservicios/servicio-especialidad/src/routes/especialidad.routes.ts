import { Router } from 'express';
import { especialidadController } from '../controllers/especialidad.controller';

const router = Router();

/**
 * GET /especialidad        - Listar todas las especialidades
 * GET /especialidad/:id    - Obtener por ID
 * GET /especialidad/codigo/:codigo - Obtener por código
 * POST /especialidad       - Crear nueva especialidad
 * PUT /especialidad/:id    - Actualizar especialidad
 * DELETE /especialidad/:id - Eliminar especialidad
 */

router.get('/', (req, res) => especialidadController.listar(req, res));
router.get('/codigo/:codigo', (req, res) => especialidadController.obtenerPorCodigo(req, res));
router.get('/:id', (req, res) => especialidadController.obtener(req, res));
router.post('/', (req, res) => especialidadController.crear(req, res));
router.put('/:id', (req, res) => especialidadController.actualizar(req, res));
router.delete('/:id', (req, res) => especialidadController.eliminar(req, res));

export default router;
