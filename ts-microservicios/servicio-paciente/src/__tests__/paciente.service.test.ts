/**
 * Tests unitarios — PacienteService
 * Patrón: Repository (Prisma como repositorio de datos)
 * Se mockea Prisma para aislar la lógica del servicio de la base de datos.
 */

import { PacienteService, CreatePacienteDto } from '../services/paciente.service';

// Mock del módulo Prisma para no necesitar base de datos en los tests
jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    paciente: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import prisma from '../lib/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Datos de prueba reutilizables
const pacienteEjemplo = {
  id: 1,
  rut: '12345678-9',
  nombre: 'Juan',
  apellido: 'Pérez',
  email: 'juan@test.com',
  telefono: '+56911111111',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('PacienteService', () => {
  let service: PacienteService;

  beforeEach(() => {
    service = new PacienteService();
    jest.clearAllMocks();
  });

  // ── findAll ───────────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('debe retornar lista de pacientes ordenada por apellido', async () => {
      const lista = [pacienteEjemplo];
      (mockPrisma.paciente.findMany as jest.Mock).mockResolvedValue(lista);

      const resultado = await service.findAll();

      expect(mockPrisma.paciente.findMany).toHaveBeenCalledWith({
        orderBy: { apellido: 'asc' },
      });
      expect(resultado).toEqual(lista);
      expect(resultado).toHaveLength(1);
    });

    it('debe retornar arreglo vacío cuando no hay pacientes', async () => {
      (mockPrisma.paciente.findMany as jest.Mock).mockResolvedValue([]);

      const resultado = await service.findAll();

      expect(resultado).toEqual([]);
    });
  });

  // ── findById ──────────────────────────────────────────────────────────────
  describe('findById()', () => {
    it('debe retornar un paciente por su ID', async () => {
      (mockPrisma.paciente.findUnique as jest.Mock).mockResolvedValue(pacienteEjemplo);

      const resultado = await service.findById(1);

      expect(mockPrisma.paciente.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(resultado).toEqual(pacienteEjemplo);
    });

    it('debe retornar null si el paciente no existe', async () => {
      (mockPrisma.paciente.findUnique as jest.Mock).mockResolvedValue(null);

      const resultado = await service.findById(999);

      expect(resultado).toBeNull();
    });
  });

  // ── findByRut ─────────────────────────────────────────────────────────────
  describe('findByRut()', () => {
    it('debe retornar un paciente por RUT', async () => {
      (mockPrisma.paciente.findUnique as jest.Mock).mockResolvedValue(pacienteEjemplo);

      const resultado = await service.findByRut('12345678-9');

      expect(mockPrisma.paciente.findUnique).toHaveBeenCalledWith({
        where: { rut: '12345678-9' },
      });
      expect(resultado?.rut).toBe('12345678-9');
    });

    it('debe retornar null para RUT inexistente', async () => {
      (mockPrisma.paciente.findUnique as jest.Mock).mockResolvedValue(null);

      const resultado = await service.findByRut('00000000-0');

      expect(resultado).toBeNull();
    });
  });

  // ── create ────────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('debe crear un nuevo paciente con los datos correctos', async () => {
      const dto: CreatePacienteDto = {
        rut: '12345678-9',
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan@test.com',
        telefono: '+56911111111',
      };
      (mockPrisma.paciente.create as jest.Mock).mockResolvedValue({ id: 1, ...dto, createdAt: new Date(), updatedAt: new Date() });

      const resultado = await service.create(dto);

      expect(mockPrisma.paciente.create).toHaveBeenCalledWith({ data: dto });
      expect(resultado.rut).toBe(dto.rut);
      expect(resultado.nombre).toBe(dto.nombre);
    });

    it('debe crear paciente sin campos opcionales', async () => {
      const dto: CreatePacienteDto = { rut: '98765432-1', nombre: 'Ana', apellido: 'López' };
      (mockPrisma.paciente.create as jest.Mock).mockResolvedValue({
        id: 2, ...dto, email: null, telefono: null, createdAt: new Date(), updatedAt: new Date(),
      });

      const resultado = await service.create(dto);

      expect(resultado.id).toBe(2);
      expect(resultado.nombre).toBe('Ana');
    });
  });

  // ── update ────────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('debe actualizar un paciente existente', async () => {
      const actualizado = { ...pacienteEjemplo, nombre: 'Juan Carlos' };
      (mockPrisma.paciente.update as jest.Mock).mockResolvedValue(actualizado);

      const resultado = await service.update(1, { nombre: 'Juan Carlos' });

      expect(mockPrisma.paciente.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { nombre: 'Juan Carlos' },
      });
      expect(resultado.nombre).toBe('Juan Carlos');
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────
  describe('delete()', () => {
    it('debe eliminar un paciente por ID', async () => {
      (mockPrisma.paciente.delete as jest.Mock).mockResolvedValue(pacienteEjemplo);

      const resultado = await service.delete(1);

      expect(mockPrisma.paciente.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(resultado).toEqual(pacienteEjemplo);
    });
  });

  // ── exists ────────────────────────────────────────────────────────────────
  describe('exists()', () => {
    it('debe retornar true si el paciente existe', async () => {
      (mockPrisma.paciente.count as jest.Mock).mockResolvedValue(1);

      const resultado = await service.exists(1);

      expect(mockPrisma.paciente.count).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(resultado).toBe(true);
    });

    it('debe retornar false si el paciente no existe', async () => {
      (mockPrisma.paciente.count as jest.Mock).mockResolvedValue(0);

      const resultado = await service.exists(999);

      expect(resultado).toBe(false);
    });
  });
});
