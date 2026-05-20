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

---

## Arranque

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
```bash
cd ts-microservicios
docker compose up -d
# Espera ~15 segundos a que MySQL esté listo
docker compose ps   # debe aparecer "healthy"
```

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

---

## Endpoints del BFF

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
