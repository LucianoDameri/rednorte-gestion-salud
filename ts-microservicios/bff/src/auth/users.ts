/**
 * Base de usuarios en memoria.
 * En producción esto vendría de una BD o de Keycloak.
 */

export type Rol = 'RECEPCIONISTA' | 'MEDICO';

export interface Usuario {
  id: string;
  username: string;
  password: string; // plain-text para la evaluación; en prod usar bcrypt
  nombre: string;
  rol: Rol;
}

export const USUARIOS: Usuario[] = [
  {
    id: 'u1',
    username: 'recepcionista',
    password: 'rec123',
    nombre: 'María González',
    rol: 'RECEPCIONISTA',
  },
  {
    id: 'u2',
    username: 'dr.garcia',
    password: 'med123',
    nombre: 'Dr. Carlos García',
    rol: 'MEDICO',
  },
  {
    id: 'u3',
    username: 'dr.lopez',
    password: 'med456',
    nombre: 'Dra. Ana López',
    rol: 'MEDICO',
  },
];

export function findByUsername(username: string): Usuario | undefined {
  return USUARIOS.find(u => u.username === username);
}
