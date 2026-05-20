/**
 * Tests unitarios — PacienteController
 * Se mockea el servicio para probar la lógica del controlador de forma aislada.
 */

import { Request, Response } from 'express';
import { PacienteController } from '../controllers/paciente.controller';
import { pacienteService } from '../services/paciente.service';

// Mock del servicio
jest.mock('../services/paciente.service', () => ({
  pacienteService: {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByRut: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
  },
}));

const mockService = pacienteService as jest.Mocked<typeof pacienteService>;

// Helper para crear mocks de Request/Response de Express
const mockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  params: {},
  body: {},
  query: {},
  ...overrides,
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

const pacienteEjemplo = {
  id: 1,
  rut: '12345678-9',
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan@test.com',
  telefono: '+56911111111',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('PacienteController', () => {
  let controller: PacienteController;

  beforeEach(() => {
    controller = new PacienteController();
    jest.clearAllMocks();
  });

  // ── listar ────────────────────────────────────────────────────────────────
  describe('listar()', () => {
    it('debe responder 200 con lista de pacientes', async () => {
      mockService.findAll.mockResolvedValue([pacienteEjemplo]);
      const req = mockRequest();
      const res = mockResponse();

      await controller.listar(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith([pacienteEjemplo]);
    });

    it('debe responder 204 cuando no hay pacientes', async () => {
      mockService.findAll.mockResolvedValue([]);
      const req = mockRequest();
      const res = mockResponse();

      await controller.listar(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('debe responder 500 si el servicio lanza error', async () => {
      mockService.findAll.mockRejectedValue(new Error('DB error'));
      const req = mockRequest();
      const res = mockResponse();

      await controller.listar(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Error al listar pacientes' });
    });
  });

  // ── obtener ───────────────────────────────────────────────────────────────
  describe('obtener()', () => {
    it('debe responder 200 con el paciente si existe', async () => {
      mockService.findById.mockResolvedValue(pacienteEjemplo);
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      await controller.obtener(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(pacienteEjemplo);
    });

    it('debe responder 404 si el paciente no existe', async () => {
      mockService.findById.mockResolvedValue(null);
      const req = mockRequest({ params: { id: '999' } });
      const res = mockResponse();

      await controller.obtener(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Paciente no encontrado' });
    });

    it('debe responder 400 si el ID no es un número', async () => {
      const req = mockRequest({ params: { id: 'abc' } });
      const res = mockResponse();

      await controller.obtener(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'ID inválido' });
    });
  });

  // ── crear ─────────────────────────────────────────────────────────────────
  describe('crear()', () => {
    it('debe responder 201 con el paciente creado', async () => {
      mockService.create.mockResolvedValue(pacienteEjemplo);
      const req = mockRequest({
        body: { rut: '12345678-9', nombre: 'Juan', apellido: 'Pérez' },
      });
      const res = mockResponse();

      await controller.crear(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(pacienteEjemplo);
    });

    it('debe responder 400 si faltan campos obligatorios', async () => {
      const req = mockRequest({ body: { rut: '12345678-9' } }); // falta nombre y apellido
      const res = mockResponse();

      await controller.crear(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'rut, nombre y apellido son obligatorios',
      });
    });
  });

  // ── actualizar ────────────────────────────────────────────────────────────
  describe('actualizar()', () => {
    it('debe responder 200 con el paciente actualizado', async () => {
      mockService.exists.mockResolvedValue(true);
      mockService.update.mockResolvedValue({ ...pacienteEjemplo, nombre: 'Juan C.' });
      const req = mockRequest({ params: { id: '1' }, body: { nombre: 'Juan C.' } });
      const res = mockResponse();

      await controller.actualizar(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ nombre: 'Juan C.' }));
    });

    it('debe responder 404 si el paciente no existe', async () => {
      mockService.exists.mockResolvedValue(false);
      const req = mockRequest({ params: { id: '999' }, body: { nombre: 'X' } });
      const res = mockResponse();

      await controller.actualizar(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ── eliminar ──────────────────────────────────────────────────────────────
  describe('eliminar()', () => {
    it('debe responder 200 al eliminar exitosamente', async () => {
      mockService.exists.mockResolvedValue(true);
      mockService.delete.mockResolvedValue(pacienteEjemplo);
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      await controller.eliminar(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Paciente eliminado' });
    });

    it('debe responder 404 si el paciente no existe', async () => {
      mockService.exists.mockResolvedValue(false);
      const req = mockRequest({ params: { id: '999' } });
      const res = mockResponse();

      await controller.eliminar(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('debe responder 400 si el ID no es numérico', async () => {
      const req = mockRequest({ params: { id: 'xyz' } });
      const res = mockResponse();

      await controller.eliminar(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
