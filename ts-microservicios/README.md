<<<<<<< HEAD
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
=======
# SaludRedNorte — Arquitectura BFF + 3 Microservicios

```
Frontend (React+Vite / nginx)
         │
         ▼
    BFF (:3000)          ← único punto de entrada para el frontend
   /    |    \
  ▼     ▼     ▼
Pac.  Solic. ListaEsp.  ← microservicios independientes
:3001 :3002  :3003
  │     │       │
 DB    DB      DB       ← MySQL, una base de datos por servicio
```

## Stack (todo gratuito)

| | | |
|---|---|---|
| Node.js | Runtime | MIT |
| TypeScript | Lenguaje | Apache 2.0 |
| Express | HTTP | MIT |
| Prisma | ORM | Apache 2.0 |
| MySQL 8.0 | Base de datos | Community GPL |
| Docker Desktop | Contenedores | Gratis personal |
| cockatiel | Circuit Breaker (BFF) | MIT |
| React + Vite | Frontend | MIT |
| nginx | Servidor web (Docker) | BSD |
| Jest + ts-jest | Tests unitarios | MIT |

## Responsabilidades de cada servicio

| Servicio | Puerto | BD | Qué maneja |
|---|---|---|---|
| BFF | 3000 | — | Orquesta, agrega datos, expone API al frontend |
| servicio-paciente | 3001 | db_paciente | Datos personales del paciente |
| servicio-solicitudes | 3002 | db_solicitudes | Pedidos médicos (tipo, especialidad, descripción) |
| servicio-lista-espera | 3003 | db_lista_espera | Cola de turnos (estado, prioridad, número de turno) |
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443

---

## Arranque

<<<<<<< HEAD
### Paso 1 — MySQL
=======
### Opción A — Stack completo con Docker 🐳 (recomendado)

Un solo comando levanta todo: MySQL + 3 microservicios + BFF + Frontend.

```bash
cd ts-microservicios
docker compose -f docker-compose.full.yml up --build
```

Acceder en: **http://localhost** (puerto 80)

Para detener y limpiar volúmenes:
```bash
docker compose -f docker-compose.full.yml down -v
```

---

### Opción B — Desarrollo local (5 terminales)

#### Paso 1 — MySQL
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
```bash
cd ts-microservicios
docker compose up -d
# Espera ~15 segundos a que MySQL esté listo
docker compose ps   # debe aparecer "healthy"
```

<<<<<<< HEAD
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
=======
#### Paso 2 — Microservicios (una terminal por servicio)

**Terminal 1 — servicio-paciente**
```bash
cd ts-microservicios/servicio-paciente
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

**Terminal 2 — servicio-solicitudes**
```bash
cd ts-microservicios/servicio-solicitudes
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

**Terminal 3 — servicio-lista-espera**
```bash
cd ts-microservicios/servicio-lista-espera
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev
```

**Terminal 4 — BFF**
```bash
cd ts-microservicios/bff
npm install
npm run dev
```

**Terminal 5 — Frontend**
```bash
cd ts-microservicios/frontend
npm install
npm run dev
```

Abrir: **http://localhost:5173**

---

## Tests unitarios

Ejecutar en cada microservicio (requiere `npm install` primero):

```bash
cd servicio-paciente   && npm install && npm test
cd servicio-solicitudes && npm install && npm test
cd servicio-lista-espera && npm install && npm test
```

Los tests mockean Prisma y no necesitan base de datos activa.
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443

---

## Endpoints del BFF

<<<<<<< HEAD
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
=======
| Método | Ruta | Descripción |
|---|---|---|
| GET | /bff/paciente | Lista pacientes |
| GET | /bff/paciente/:id | Paciente + solicitudes + turnos (vista agregada) |
| POST | /bff/paciente | Crear paciente |
| PUT | /bff/paciente/:id | Actualizar paciente |
| DELETE | /bff/paciente/:id | Eliminar paciente |
| GET | /bff/solicitud | Lista solicitudes (filtro: ?pacienteId=X) |
| POST | /bff/solicitud | Crear solicitud → ingresa automáticamente a lista de espera |
| PUT | /bff/solicitud/:id | Actualizar solicitud |
| DELETE | /bff/solicitud/:id | Eliminar solicitud |
| GET | /bff/lista-espera | Cola (filtros: ?estado=X&prioridad=Y&pacienteId=Z) |
| GET | /bff/lista-espera/resumen | Estadísticas de la cola |
| PUT | /bff/lista-espera/:id | Cambiar estado, prioridad, fecha estimada |
| GET | /health | Estado del BFF y de los 3 microservicios downstream |

## Circuit Breaker (cockatiel)

Implementado en el BFF para las 3 conexiones downstream:

- **Retry:** 2 reintentos con backoff exponencial (100ms base)
- **Threshold:** 5 fallos consecutivos abren el circuito
- **Recuperación:** 10 segundos en estado OPEN antes de probar HALF_OPEN

## Base de datos

```
MySQL :3306
├── db_paciente       (servicio-paciente)
├── db_solicitudes    (servicio-solicitudes)
└── db_lista_espera   (servicio-lista-espera)
```

Ver datos con UI: `npx prisma studio` (dentro de cada carpeta de servicio)

## Documentación adicional

- `PATRONES_DISENO.md` — análisis de patrones: BFF, Repository, Circuit Breaker, Service Layer, Facade
- `BRANCHING_STRATEGY.md` — estrategia Git Flow, convención de commits, resolución de conflictos
>>>>>>> f70520dfad9a3799b0358bab38f1df4597f8b443
