/**
 * Pruebas unitarias: auth (login + middleware)
 */
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { login, JWT_SECRET } from '../auth/authController';
import { requireAuth, requireRol } from '../middleware/authMiddleware';
import { findByUsername } from '../auth/users';

// ─── Helpers para mock de req/res ────────────────────────────────────────────
function mockRes() {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

function mockReq(body = {}, headers: Record<string, string> = {}): Partial<Request> {
  return { body, headers } as Partial<Request>;
}

// ─── findByUsername ───────────────────────────────────────────────────────────
describe('findByUsername', () => {
  it('retorna usuario existente', () => {
    const u = findByUsername('recepcionista');
    expect(u).toBeDefined();
    expect(u?.rol).toBe('RECEPCIONISTA');
  });

  it('retorna undefined para usuario inexistente', () => {
    expect(findByUsername('no-existe')).toBeUndefined();
  });

  it('retorna médico correctamente', () => {
    const u = findByUsername('dr.garcia');
    expect(u?.rol).toBe('MEDICO');
    expect(u?.nombre).toBe('Dr. Carlos García');
  });
});

// ─── login controller ─────────────────────────────────────────────────────────
describe('login controller', () => {
  it('retorna 400 si faltan credenciales', () => {
    const req = mockReq({});
    const res = mockRes();
    login(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });

  it('retorna 401 con credenciales incorrectas', () => {
    const req = mockReq({ username: 'recepcionista', password: 'wrong' });
    const res = mockRes();
    login(req as Request, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('retorna token JWT con credenciales válidas (recepcionista)', () => {
    const req = mockReq({ username: 'recepcionista', password: 'rec123' });
    const res = mockRes();
    login(req as Request, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: expect.any(String),
        usuario: expect.objectContaining({ rol: 'RECEPCIONISTA' }),
      })
    );
  });

  it('retorna token JWT con credenciales válidas (médico)', () => {
    const req = mockReq({ username: 'dr.garcia', password: 'med123' });
    const res = mockRes();
    login(req as Request, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: expect.any(String),
        usuario: expect.objectContaining({ rol: 'MEDICO' }),
      })
    );
  });

  it('el token contiene el rol correcto en el payload', () => {
    const req = mockReq({ username: 'dr.lopez', password: 'med456' });
    const res = mockRes();
    login(req as Request, res);

    const callArg = (res.json as jest.Mock).mock.calls[0][0];
    const decoded = jwt.verify(callArg.token, JWT_SECRET) as any;
    expect(decoded.rol).toBe('MEDICO');
    expect(decoded.username).toBe('dr.lopez');
  });
});

// ─── requireAuth middleware ───────────────────────────────────────────────────
describe('requireAuth middleware', () => {
  const next = jest.fn();

  beforeEach(() => next.mockClear());

  it('rechaza request sin header Authorization', () => {
    const req = mockReq({}, {});
    const res = mockRes();
    requireAuth(req as Request, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('rechaza token mal formado', () => {
    const req = mockReq({}, { authorization: 'Bearer token_invalido' });
    const res = mockRes();
    requireAuth(req as Request, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('acepta token válido y llama next()', () => {
    const token = jwt.sign(
      { sub: 'u1', username: 'recepcionista', nombre: 'María', rol: 'RECEPCIONISTA' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    const req = mockReq({}, { authorization: `Bearer ${token}` });
    const res = mockRes();
    requireAuth(req as Request, res, next);
    expect(next).toHaveBeenCalled();
    expect((req as any).usuario?.rol).toBe('RECEPCIONISTA');
  });

  it('rechaza token expirado', () => {
    const token = jwt.sign(
      { sub: 'u1', username: 'recepcionista', nombre: 'María', rol: 'RECEPCIONISTA' },
      JWT_SECRET,
      { expiresIn: '-1s' }
    );
    const req = mockReq({}, { authorization: `Bearer ${token}` });
    const res = mockRes();
    requireAuth(req as Request, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

// ─── requireRol middleware ────────────────────────────────────────────────────
describe('requireRol middleware', () => {
  const next = jest.fn();

  beforeEach(() => next.mockClear());

  function reqConRol(rol: string): Partial<Request> {
    return { usuario: { sub: 'u1', username: 'x', nombre: 'X', rol: rol as any, iat: 0, exp: 9999999999 } } as any;
  }

  it('permite acceso si el rol es correcto', () => {
    const req = reqConRol('RECEPCIONISTA');
    const res = mockRes();
    requireRol('RECEPCIONISTA')(req as Request, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('rechaza si el rol no coincide', () => {
    const req = reqConRol('MEDICO');
    const res = mockRes();
    requireRol('RECEPCIONISTA')(req as Request, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('acepta múltiples roles válidos', () => {
    const req = reqConRol('MEDICO');
    const res = mockRes();
    requireRol('RECEPCIONISTA', 'MEDICO')(req as Request, res, next);
    expect(next).toHaveBeenCalled();
  });
});
