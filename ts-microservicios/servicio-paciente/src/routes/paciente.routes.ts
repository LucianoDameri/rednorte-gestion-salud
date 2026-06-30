import { Router } from 'express';
import { pacienteController } from '../controllers/paciente.controller';

const router = Router();

router.get('/', (req, res) => pacienteController.listar(req, res));
router.get('/rut/:rut', (req, res) => pacienteController.obtenerPorRut(req, res));
router.get('/:id', (req, res) => pacienteController.obtener(req, res));
router.post('/', (req, res) => pacienteController.crear(req, res));
router.put('/:id', (req, res) => pacienteController.actualizar(req, res));
router.delete('/:id', (req, res) => pacienteController.eliminar(req, res));

export default router;
