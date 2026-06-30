/**
 * Pruebas de integración: endpoints del BFF
 * Usa supertest para hacer peticiones HTTP reales al servidor Express.
 * Los microservicios downstream se mockean con jest.mock.
 */
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../index';
import { JWT_SECRET } from '../auth/authController';

// Mock de los clientes de microservicios para no necesitar servicios reales
jest.mock('../clients/serviceClients', () => ({
  pacienteClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  solicitudClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  listaEsperaClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  extractError: jest.fn((e: any) => e?.message || 'Error'),
}));

import { pacienteClient } from '../clients/serviceClients';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function tokenParaRol(rol: 'RECEPCIONISTA' | 'MEDICO') {
  return jwt.sign(
    { sub: 'u-test', username: 'test', nombre: 'Test User', rol },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
}

// ─── POST /auth/login ─────────────────────────────────────────────────────────
describe('POST /auth/login', () => {
  it('200 con credenciales válidas (recepcionista)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'recepcionista', password: 'rec123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.usuario.rol).toBe('RECEPCIONISTA');
  });

  it('200 con credenciales válidas (médico)', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'dr.garcia', password: 'med123' });

    expect(res.status).toBe(200);
    expect(res.body.usuario.rol).toBe('MEDICO');
  });

  it('401 con password incorrecta', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'recepcionista', password: 'incorrecta' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it('400 sin body', async () => {
    const res = await request(app).post('/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('401 con usuario inexistente', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'nadie', password: '123' });
    expect(res.status).toBe(401);
  });
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
describe('GET /auth/me', () => {
  it('401 sin token', async () => {
    const res = await request(app).get('/auth/me');
    expect(res.status).toBe(401);
  });

  it('200 con token válido', async () => {
    const token = tokenParaRol('RECEPCIONISTA');
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.usuario.rol).toBe('RECEPCIONISTA');
  });
});

// ─── GET /bff/paciente (protegida) ────────────────────────────────────────────
describe('GET /bff/paciente', () => {
  it('401 sin token', async () => {
    const res = await request(app).get('/bff/paciente');
    expect(res.status).toBe(401);
  });

  it('200 con token de recepcionista', async () => {
    (pacienteClient.get as jest.Mock).mockResolvedValueOnce({
      data: [{ id: 1, rut: '11111111-1', nombre: 'Juan', apellido: 'Pérez' }],
    });

    const token = tokenParaRol('RECEPCIONISTA');
    const res = await request(app)
      .get('/bff/paciente')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('200 con token de médico (solo lectura)', async () => {
    (pacienteClient.get as jest.Mock).mockResolvedValueOnce({
      data: [{ id: 1, rut: '11111111-1', nombre: 'Juan', apellido: 'Pérez' }],
    });

    const token = tokenParaRol('MEDICO');
    const res = await request(app)
      .get('/bff/paciente')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});

// ─── GET /health (público) ────────────────────────────────────────────────────
describe('GET /health', () => {
  it('responde sin token requerido', async () => {
    const { pacienteClient, solicitudClient, listaEsperaClient } = require('../clients/serviceClients');
    pacienteClient.get.mockResolvedValueOnce({ data: {} });
    solicitudClient.get.mockResolvedValueOnce({ data: {} });
    listaEsperaClient.get.mockResolvedValueOnce({ data: {} });

    const res = await request(app).get('/health');
    expect([200, 207]).toContain(res.status);
    expect(res.body.service).toBe('BFF SaludRedNorte');
  });
});
