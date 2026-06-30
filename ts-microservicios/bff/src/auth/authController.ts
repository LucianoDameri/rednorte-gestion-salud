import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { findByUsername } from './users';

export const JWT_SECRET = process.env.JWT_SECRET || 'saludrednorte_secret_2024';
export const JWT_EXPIRES = '8h';

export function login(req: Request, res: Response): void {
  const { username, password } = req.body;

  if (!username || !password) {
    res.status(400).json({ error: 'username y password son requeridos' });
    return;
  }

  const usuario = findByUsername(username);

  if (!usuario || usuario.password !== password) {
    res.status(401).json({ error: 'Credenciales inválidas' });
    return;
  }

  const payload = {
    sub: usuario.id,
    username: usuario.username,
    nombre: usuario.nombre,
    rol: usuario.rol,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });

  res.json({
    token,
    usuario: {
      id: usuario.id,
      username: usuario.username,
      nombre: usuario.nombre,
      rol: usuario.rol,
    },
  });
}
