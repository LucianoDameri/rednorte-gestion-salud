# BFF — Backend for Frontend

Servidor orquestador que actúa como único punto de entrada para el frontend React. Implementa el patrón **BFF (Backend for Frontend)**, agrega datos de los 3 microservicios y aplica resiliencia con **Circuit Breaker** (cockatiel).

**Puerto:** `3000`  
**Patrón:** BFF + Circuit Breaker + Facade  
**Librería de resiliencia:** cockatiel (Retry + Circuit Breaker)

## Variables de entorno (`.env`)

```env
PORT=3000
PACIENTE_SERVICE_URL=http://localhost:3001
SOLICITUD_SERVICE_URL=http://localhost:3002
LISTA_ESPERA_SERVICE_URL=http://localhost:3003
```

## Instalación y arranque

```bash
npm install
npm run dev    # inicia en http://localhost:3000
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/health` | Estado del BFF y 3 microservicios downstream |
| GET | `/bff/paciente` | Lista todos los pacientes |
| GET | `/bff/paciente/:id` | Paciente + solicitudes + turnos (vista agregada) |
| POST | `/bff/paciente` | Crear paciente |
| PUT | `/bff/paciente/:id` | Actualizar paciente |
| DELETE | `/bff/paciente/:id` | Eliminar paciente |
| GET | `/bff/solicitud` | Lista solicitudes (filtro: `?pacienteId=X`) |
| POST | `/bff/solicitud` | Crear solicitud → ingresa automáticamente a lista de espera |
| PUT | `/bff/solicitud/:id` | Actualizar solicitud |
| DELETE | `/bff/solicitud/:id` | Eliminar solicitud |
| GET | `/bff/lista-espera` | Cola (filtros: `?estado=X&prioridad=Y&pacienteId=Z`) |
| GET | `/bff/lista-espera/resumen` | Estadísticas de la cola |
| PUT | `/bff/lista-espera/:id` | Cambiar estado, prioridad, fecha estimada |
| DELETE | `/bff/lista-espera/:id` | Eliminar entrada |

## Circuit Breaker — Configuración

Cada microservicio tiene su propia política de resiliencia:

- **Retry:** 2 intentos con backoff exponencial (inicio en 100ms)
- **Circuit Breaker:** se abre tras 5 fallos consecutivos
- **Tiempo de recuperación:** 10 segundos antes de pasar a HALF_OPEN

```
CLOSED → (5 fallos) → OPEN → (10s) → HALF_OPEN → (éxito) → CLOSED
```

Si el circuito está abierto, las peticiones fallan inmediatamente (sin esperar timeout) con código `502`.
