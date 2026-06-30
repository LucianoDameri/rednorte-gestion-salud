# SaludRedNorte — Arquitectura de Microservicios

```
Frontend (React+Vite :5173)
    │  Bearer JWT
    ▼
BFF (:3000)  ─── POST /auth/login (público)
    │              GET  /auth/me   (protegido)
    ├── /bff/paciente      → servicio-paciente    (:3001) → MySQL
    ├── /bff/solicitud     → servicio-solicitudes  (:3002) → MySQL
    └── /bff/lista-espera  → servicio-lista-espera (:3003) → MySQL
```

## Stack

| Capa | Tecnología |
|---|---|
| Runtime | Node.js + TypeScript |
| HTTP | Express |
| ORM | Prisma |
| Base de datos | MySQL 8 (Docker) |
| Frontend | React + Vite + TypeScript |
| Auth | JWT (jsonwebtoken) |
| Tests unitarios/integración | Jest + Supertest (BFF) · Vitest + Testing Library (Frontend) |
| Tests E2E | Playwright |

## Roles y permisos

| Función                        | Recepcionista | Médico |
|--------------------------------|:---:|:---:|
| Crear / editar / eliminar pacientes | ✅ | ❌ |
| Ver pacientes                  | ✅ | ✅ (solo lectura) |
| Crear / eliminar solicitudes   | ✅ | ❌ |
| Ver solicitudes                | ✅ | ❌ |
| Ver lista de espera            | ✅ | ✅ |
| Editar lista completa          | ✅ | ❌ |
| Marcar ATENDIDA / CANCELADA    | ✅ | ✅ |

## Credenciales de prueba

| Usuario         | Contraseña | Rol            |
|-----------------|-----------|----------------|
| `recepcionista` | `rec123`  | RECEPCIONISTA  |
| `dr.garcia`     | `med123`  | MEDICO         |
| `dr.lopez`      | `med456`  | MEDICO         |

---

## Arranque

### Paso 1 — MySQL
```bash
cd ts-microservicios
docker compose up -d
# Espera ~15 segundos a que MySQL esté listo
docker compose ps   # debe aparecer "healthy"
```

### Paso 2 — Microservicios (una terminal por servicio)
```bash
# Terminal 1
cd servicio-paciente && npm install && npx prisma migrate dev --name init && npm run prisma:seed && npm run dev

# Terminal 2
cd servicio-solicitudes && npm install && npx prisma migrate dev --name init && npm run prisma:seed && npm run dev

# Terminal 3
cd servicio-lista-espera && npm install && npx prisma migrate dev --name init && npm run prisma:seed && npm run dev
```

### Paso 3 — BFF
```bash
cd bff && npm install && npm run dev
```

### Paso 4 — Frontend
```bash
cd frontend && npm install && npm run dev
# → http://localhost:5173
```

---

## Pruebas

### BFF — Unitarias + Integración (Jest + Supertest)
```bash
cd bff
npm install
npm test
# Genera reporte en /coverage
```
Archivos:
- `src/__tests__/auth.test.ts` — login controller, requireAuth, requireRol (22 pruebas)
- `src/__tests__/bff.integration.test.ts` — endpoints HTTP con mocks (10 pruebas)

### Frontend — Unitarias (Vitest + Testing Library)
```bash
cd frontend
npm install
npm test
# Genera reporte en /coverage
```
Archivos:
- `src/__tests__/LoginPage.test.tsx` — componente, formulario, errores (6 pruebas)
- `src/__tests__/AuthContext.test.tsx` — login, logout, roles, localStorage (8 pruebas)
- `src/__tests__/api.test.ts` — interceptor JWT, llamadas API (8 pruebas)

### E2E — Playwright
```bash
cd e2e
npm install
npx playwright install chromium

# Con todos los servicios corriendo:
npm test                  # headless
npm run test:headed       # con navegador visible
npm run test:report       # ver reporte HTML
```
Archivos:
- `tests/login.spec.ts` — login válido/inválido, logout, rutas protegidas (6 pruebas)
- `tests/recepcionista.spec.ts` — CRUD pacientes, solicitudes, lista espera (9 pruebas)
- `tests/medico.spec.ts` — acceso restringido, vista lectura, lista espera (8 pruebas)

---

## Endpoints del BFF

### Autenticación (público)
| Método | Ruta | Descripción |
|---|---|---|
| POST | /auth/login | Retorna JWT + datos del usuario |
| GET  | /auth/me    | Info del usuario autenticado |

### Pacientes (requiere JWT)
| Método | Ruta | Rol requerido |
|---|---|---|
| GET    | /bff/paciente      | Ambos |
| GET    | /bff/paciente/:id  | Ambos |
| POST   | /bff/paciente      | RECEPCIONISTA |
| PUT    | /bff/paciente/:id  | RECEPCIONISTA |
| DELETE | /bff/paciente/:id  | RECEPCIONISTA |

### Solicitudes (requiere JWT)
| Método | Ruta | Rol requerido |
|---|---|---|
| GET    | /bff/solicitud     | Ambos |
| POST   | /bff/solicitud     | RECEPCIONISTA |
| DELETE | /bff/solicitud/:id | RECEPCIONISTA |

### Lista de Espera (requiere JWT)
| Método | Ruta | Rol requerido |
|---|---|---|
| GET | /bff/lista-espera          | Ambos |
| GET | /bff/lista-espera/resumen  | Ambos |
| PUT | /bff/lista-espera/:id      | Ambos (médico: solo ATENDIDA/CANCELADA) |

### Health (público)
| Método | Ruta | Descripción |
|---|---|---|
| GET | /health | Estado del BFF y microservicios downstream |

---

## Estructura del proyecto

```
ts-microservicios/
├── bff/                        # BFF Express + JWT
│   └── src/
│       ├── auth/               # users.ts · authController.ts
│       ├── middleware/         # authMiddleware.ts
│       ├── routes/             # paciente · solicitud · listaEspera
│       └── __tests__/         # auth.test.ts · bff.integration.test.ts
├── frontend/                   # React + Vite + TypeScript
│   └── src/
│       ├── context/            # AuthContext.tsx
│       ├── pages/              # LoginPage · PacientesPage · SolicitudesPage · ListaEsperaPage
│       ├── components/         # ProtectedRoute · ServiceStatusBar
│       ├── services/           # api.ts (interceptor JWT)
│       └── __tests__/         # LoginPage.test · AuthContext.test · api.test
├── e2e/                        # Playwright E2E
│   └── tests/                  # login.spec · recepcionista.spec · medico.spec
├── servicio-paciente/
├── servicio-solicitudes/
├── servicio-lista-espera/
├── servicio-medico/
├── servicio-especialidad/
└── docker-compose.yml
```
