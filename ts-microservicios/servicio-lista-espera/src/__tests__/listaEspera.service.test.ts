/**
 * Tests unitarios — ListaEsperaService
 * Patrón: Repository (Prisma como repositorio de datos)
 * Incluye tests del método resumen() y la generación automática de número de turno.
 */

import { ListaEsperaService, CreateListaEsperaDto } from '../services/listaEspera.service';

jest.mock('../lib/prisma', () => ({
  __esModule: true,
  default: {
    listaEspera: {
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

const entradaEjemplo = {
  id: 1,
  solicitudId: 1,
  pacienteId: 1,
  prioridad: 'NORMAL',
  estado: 'EN_ESPERA',
  numeroTurno: 1,
  fechaEstimada: null,
  observaciones: null,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
};

describe('ListaEsperaService', () => {
  let service: ListaEsperaService;

  beforeEach(() => {
    service = new ListaEsperaService();
    jest.clearAllMocks();
  });

  // ── findAll ───────────────────────────────────────────────────────────────
  describe('findAll()', () => {
    it('debe retornar todas las entradas sin filtros', async () => {
      (mockPrisma.listaEspera.findMany as jest.Mock).mockResolvedValue([entradaEjemplo]);

      const resultado = await service.findAll();

      expect(mockPrisma.listaEspera.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: [{ prioridad: 'asc' }, { createdAt: 'asc' }],
      });
      expect(resultado).toHaveLength(1);
    });

    it('debe aplicar filtro por estado', async () => {
      (mockPrisma.listaEspera.findMany as jest.Mock).mockResolvedValue([entradaEjemplo]);

      const resultado = await service.findAll({ estado: 'EN_ESPERA' });

      expect(mockPrisma.listaEspera.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { estado: 'EN_ESPERA' } })
      );
      expect(resultado[0].estado).toBe('EN_ESPERA');
    });

    it('debe aplicar filtro por prioridad', async () => {
      const urgente = { ...entradaEjemplo, prioridad: 'URGENTE' };
      (mockPrisma.listaEspera.findMany as jest.Mock).mockResolvedValue([urgente]);

      const resultado = await service.findAll({ prioridad: 'URGENTE' });

      expect(mockPrisma.listaEspera.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { prioridad: 'URGENTE' } })
      );
      expect(resultado[0].prioridad).toBe('URGENTE');
    });

    it('debe retornar arreglo vacío cuando no hay entradas', async () => {
      (mockPrisma.listaEspera.findMany as jest.Mock).mockResolvedValue([]);

      expect(await service.findAll()).toEqual([]);
    });
  });

  // ── findById ──────────────────────────────────────────────────────────────
  describe('findById()', () => {
    it('debe retornar una entrada por ID', async () => {
      (mockPrisma.listaEspera.findUnique as jest.Mock).mockResolvedValue(entradaEjemplo);

      const resultado = await service.findById(1);

      expect(resultado?.id).toBe(1);
    });

    it('debe retornar null si no existe', async () => {
      (mockPrisma.listaEspera.findUnique as jest.Mock).mockResolvedValue(null);

      expect(await service.findById(999)).toBeNull();
    });
  });

  // ── findBySolicitud ───────────────────────────────────────────────────────
  describe('findBySolicitud()', () => {
    it('debe encontrar entrada por solicitudId', async () => {
      (mockPrisma.listaEspera.findUnique as jest.Mock).mockResolvedValue(entradaEjemplo);

      const resultado = await service.findBySolicitud(1);

      expect(mockPrisma.listaEspera.findUnique).toHaveBeenCalledWith({
        where: { solicitudId: 1 },
      });
      expect(resultado?.solicitudId).toBe(1);
    });
  });

  // ── create ────────────────────────────────────────────────────────────────
  describe('create()', () => {
    it('debe asignar numeroTurno automáticamente (totalEnEspera + 1)', async () => {
      // Hay 3 registros EN_ESPERA → nuevo turno debe ser 4
      (mockPrisma.listaEspera.count as jest.Mock).mockResolvedValue(3);
      (mockPrisma.listaEspera.create as jest.Mock).mockResolvedValue({
        ...entradaEjemplo,
        numeroTurno: 4,
      });

      const dto: CreateListaEsperaDto = { solicitudId: 2, pacienteId: 1 };
      const resultado = await service.create(dto);

      expect(mockPrisma.listaEspera.count).toHaveBeenCalledWith({
        where: { estado: 'EN_ESPERA' },
      });
      expect(mockPrisma.listaEspera.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          numeroTurno: 4,
          estado: 'EN_ESPERA',
        },
      });
      expect(resultado.numeroTurno).toBe(4);
    });

    it('debe asignar turno 1 cuando la lista está vacía', async () => {
      (mockPrisma.listaEspera.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.listaEspera.create as jest.Mock).mockResolvedValue({
        ...entradaEjemplo,
        numeroTurno: 1,
      });

      const dto: CreateListaEsperaDto = { solicitudId: 5, pacienteId: 2 };
      const resultado = await service.create(dto);

      expect(resultado.numeroTurno).toBe(1);
    });

    it('debe crear entrada con estado EN_ESPERA por defecto', async () => {
      (mockPrisma.listaEspera.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.listaEspera.create as jest.Mock).mockResolvedValue(entradaEjemplo);

      await service.create({ solicitudId: 1, pacienteId: 1 });

      expect(mockPrisma.listaEspera.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ estado: 'EN_ESPERA' }),
        })
      );
    });
  });

  // ── update ────────────────────────────────────────────────────────────────
  describe('update()', () => {
    it('debe actualizar el estado de una entrada', async () => {
      const actualizado = { ...entradaEjemplo, estado: 'ASIGNADA' };
      (mockPrisma.listaEspera.update as jest.Mock).mockResolvedValue(actualizado);

      const resultado = await service.update(1, { estado: 'ASIGNADA' });

      expect(mockPrisma.listaEspera.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { estado: 'ASIGNADA' },
      });
      expect(resultado.estado).toBe('ASIGNADA');
    });

    it('debe actualizar la prioridad de una entrada', async () => {
      const actualizado = { ...entradaEjemplo, prioridad: 'URGENTE' };
      (mockPrisma.listaEspera.update as jest.Mock).mockResolvedValue(actualizado);

      const resultado = await service.update(1, { prioridad: 'URGENTE' });

      expect(resultado.prioridad).toBe('URGENTE');
    });
  });

  // ── delete ────────────────────────────────────────────────────────────────
  describe('delete()', () => {
    it('debe eliminar una entrada de la lista', async () => {
      (mockPrisma.listaEspera.delete as jest.Mock).mockResolvedValue(entradaEjemplo);

      const resultado = await service.delete(1);

      expect(mockPrisma.listaEspera.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(resultado.id).toBe(1);
    });
  });

  // ── exists ────────────────────────────────────────────────────────────────
  describe('exists()', () => {
    it('debe retornar true si la entrada existe', async () => {
      (mockPrisma.listaEspera.count as jest.Mock).mockResolvedValue(1);

      expect(await service.exists(1)).toBe(true);
    });

    it('debe retornar false si la entrada no existe', async () => {
      (mockPrisma.listaEspera.count as jest.Mock).mockResolvedValue(0);

      expect(await service.exists(999)).toBe(false);
    });
  });

  // ── resumen ───────────────────────────────────────────────────────────────
  describe('resumen()', () => {
    it('debe retornar estadísticas correctas de la cola', async () => {
      // Simular las 6 llamadas a count en orden
      (mockPrisma.listaEspera.count as jest.Mock)
        .mockResolvedValueOnce(10)  // total
        .mockResolvedValueOnce(5)   // EN_ESPERA
        .mockResolvedValueOnce(2)   // ASIGNADA
        .mockResolvedValueOnce(2)   // ATENDIDA
        .mockResolvedValueOnce(1)   // CANCELADA
        .mockResolvedValueOnce(3);  // URGENTES

      const resultado = await service.resumen();

      expect(resultado).toEqual({
        total: 10,
        enEspera: 5,
        asignada: 2,
        atendida: 2,
        cancelada: 1,
        urgentes: 3,
      });
      expect(mockPrisma.listaEspera.count).toHaveBeenCalledTimes(6);
    });

    it('debe retornar ceros cuando la lista está vacía', async () => {
      (mockPrisma.listaEspera.count as jest.Mock).mockResolvedValue(0);

      const resultado = await service.resumen();

      expect(resultado.total).toBe(0);
      expect(resultado.urgentes).toBe(0);
    });
  });
});
