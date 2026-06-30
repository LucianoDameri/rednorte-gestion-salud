/**
 * Tests unitarios — SolicitudService
 * Patrón: Repository (Prisma como repositorio de datos)
 * Se mockea Prisma para aislar la lógica del servicio.
 */

import { SolicitudService, CreateSolicitudDto } from '../services/solicitud.service';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    solicitud: {
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

const solicitudEjemplo = {
  id: 1,
  pacienteId: 1,
  especialidadId: 1,
  tipoAtencion: 'CONSULTA',
  descripcion: 'Dolor de cabeza frecuente',
  prioridad: 'NORMAL',
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

describe('SolicitudService', () => {
  let service: SolicitudService;

  beforeEach(() => {
    service = new SolicitudService();
    jest.clearAllMocks();
  });

  // ── findAll ───────────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('debe retornar todas las solicitudes ordenadas por fecha descendente', async () => {
      (mockPrisma.solicitud.findMany as jest.Mock).mockResolvedValue([solicitudEjemplo]);

      const resultado = await service.findAll();

      expect(mockPrisma.solicitud.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(resultado).toHaveLength(1);
      expect(resultado[0].tipoAtencion).toBe('CONSULTA');
    });

    it('debe retornar arreglo vacío si no hay solicitudes', async () => {
      (mockPrisma.solicitud.findMany as jest.Mock).mockResolvedValue([]);

      const resultado = await service.findAll();

      expect(resultado).toEqual([]);
    });
  });

  // ── findById ──────────────────────────────────────────────────────────────
  describe('findById()', () => {
    it('debe retornar una solicitud por ID', async () => {
      (mockPrisma.solicitud.findUnique as jest.Mock).mockResolvedValue(solicitudEjemplo);

      const resultado = await service.findById(1);

      expect(mockPrisma.solicitud.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(resultado?.id).toBe(1);
    });

    it('debe retornar null si no existe', async () => {
      (mockPrisma.solicitud.findUnique as jest.Mock).mockResolvedValue(null);

      expect(await service.findById(999)).toBeNull();
    });
  });

  // ── findByPaciente ────────────────────────────────────────────────────────
  describe('findByPaciente()', () => {
    it('debe retornar solicitudes de un paciente específico', async () => {
      const lista = [solicitudEjemplo, { ...solicitudEjemplo, id: 2 }];
      (mockPrisma.solicitud.findMany as jest.Mock).mockResolvedValue(lista);

      const resultado = await service.findByPaciente(1);

      expect(mockPrisma.solicitud.findMany).toHaveBeenCalledWith({
        where: { pacienteId: 1 },
        orderBy: { createdAt: 'desc' },
      });
      expect(resultado).toHaveLength(2);
    });

    it('debe retornar arreglo vacío si el paciente no tiene solicitudes', async () => {
      (mockPrisma.solicitud.findMany as jest.Mock).mockResolvedValue([]);

      expect(await service.findByPaciente(999)).toEqual([]);
    });
  });

  // ── findByEspecialidad ────────────────────────────────────────────────────
  describe('findByEspecialidad()', () => {
    it('debe retornar solicitudes de una especialidad específica', async () => {
      (mockPrisma.solicitud.findMany as jest.Mock).mockResolvedValue([solicitudEjemplo]);

      const resultado = await service.findByEspecialidad(1);

      expect(mockPrisma.solicitud.findMany).toHaveBeenCalledWith({
        where: { especialidadId: 1 },
        orderBy: { createdAt: 'desc' },
      });
      expect(resultado[0].especialidadId).toBe(1);
    });
  });

  // ── create ────────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('debe crear una solicitud con datos válidos', async () => {
      const dto: CreateSolicitudDto = {
        pacienteId: 1,
        especialidadId: 2,
        tipoAtencion: 'PROCEDIMIENTO',
        descripcion: 'Control rutinario de vista',
      };
      (mockPrisma.solicitud.create as jest.Mock).mockResolvedValue({ id: 3, ...dto, prioridad: 'NORMAL', createdAt: new Date(), updatedAt: new Date() });

      const resultado = await service.create(dto);

      expect(mockPrisma.solicitud.create).toHaveBeenCalledWith({ data: dto });
      expect(resultado.tipoAtencion).toBe('PROCEDIMIENTO');
    });

    it('debe crear solicitud sin descripción (campo opcional)', async () => {
      const dto: CreateSolicitudDto = { pacienteId: 2, especialidadId: 3, tipoAtencion: 'CONSULTA' };
      (mockPrisma.solicitud.create as jest.Mock).mockResolvedValue({
        id: 4, ...dto, descripcion: null, prioridad: 'NORMAL', createdAt: new Date(), updatedAt: new Date(),
      });

      const resultado = await service.create(dto);

      expect(resultado.id).toBe(4);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('debe actualizar una solicitud existente', async () => {
      const actualizado = { ...solicitudEjemplo, descripcion: 'Nueva descripción' };
      (mockPrisma.solicitud.update as jest.Mock).mockResolvedValue(actualizado);

      const resultado = await service.update(1, { descripcion: 'Nueva descripción' });

      expect(mockPrisma.solicitud.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { descripcion: 'Nueva descripción' },
      });
      expect(resultado.descripcion).toBe('Nueva descripción');
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────
  describe('delete()', () => {
    it('debe eliminar una solicitud por ID', async () => {
      (mockPrisma.solicitud.delete as jest.Mock).mockResolvedValue(solicitudEjemplo);

      const resultado = await service.delete(1);

      expect(mockPrisma.solicitud.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(resultado.id).toBe(1);
    });
  });

  // ── exists ────────────────────────────────────────────────────────────────
  describe('exists()', () => {
    it('debe retornar true si la solicitud existe', async () => {
      (mockPrisma.solicitud.count as jest.Mock).mockResolvedValue(1);

      expect(await service.exists(1)).toBe(true);
    });

    it('debe retornar false si la solicitud no existe', async () => {
      (mockPrisma.solicitud.count as jest.Mock).mockResolvedValue(0);

      expect(await service.exists(999)).toBe(false);
    });
  });
});
