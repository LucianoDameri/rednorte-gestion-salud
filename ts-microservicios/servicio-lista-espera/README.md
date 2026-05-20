# servicio-lista-espera

Microservicio de gestión de la cola de turnos médicos. Mantiene el estado de cada solicitud en la fila de espera, con prioridad, número de turno automático y estadísticas. Forma parte de la arquitectura BFF + Microservicios de **SaludRedNorte**.

**Puerto:** `3003`  
**Base de datos:** `db_lista_espera` (MySQL 8.0)  
**Patrón:** Repository + Service Layer

## Variables de entorno (`.env`)

```env
DATABASE_URL="mysql://root:rednorte123@localhost:3306/db_lista_espera"
PORT=3003
```

## Instalación y arranque

```bash
npm install
npx prisma migrate dev --name init
npm run prisma:seed    # carga 5 entradas de prueba
npm run dev            # inicia en http://localhost:3003
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/lista-espera` | Lista la cola (filtros: `?estado=X&prioridad=Y&pacienteId=Z`) |
| GET | `/lista-espera/resumen` | Estadísticas de la cola |
| GET | `/lista-espera/:id` | Obtiene una entrada por ID |
| GET | `/lista-espera/solicitud/:solicitudId` | Obtiene la entrada por solicitudId |
| POST | `/lista-espera` | Ingresa una solicitud a la cola |
| PUT | `/lista-espera/:id` | Actualiza estado, prioridad o fecha estimada |
| DELETE | `/lista-espera/:id` | Elimina una entrada |

### Body — POST

```json
{
  "solicitudId": 1,
  "pacienteId": 1,
  "prioridad": "NORMAL",
  "observaciones": "Paciente con antecedentes cardíacos"
}
```

### Valores válidos

**Estado:** `EN_ESPERA` | `ASIGNADA` | `ATENDIDA` | `CANCELADA`  
**Prioridad:** `URGENTE` | `ALTA` | `NORMAL` | `BAJA`

### Respuesta — GET /lista-espera/resumen

```json
{
  "total": 10,
  "enEspera": 5,
  "asignada": 2,
  "atendida": 2,
  "cancelada": 1,
  "urgentes": 3
}
```

## Lógica de negocio — Número de turno automático

Al crear una entrada, el servicio cuenta cuántos registros están actualmente en estado `EN_ESPERA` y asigna `numeroTurno = count + 1`. Esto garantiza que los turnos se asignan en orden de llegada.

## Tests unitarios

```bash
npm test              # ejecuta todos los tests con coverage
npm run test:watch    # modo watch para desarrollo
```

## Modelo de datos (Prisma)

```prisma
model ListaEspera {
  id             Int       @id @default(autoincrement())
  solicitudId    Int       @unique
  pacienteId     Int
  prioridad      String    @default("NORMAL") @db.VarChar(20)
  estado         String    @default("EN_ESPERA") @db.VarChar(20)
  numeroTurno    Int?
  fechaEstimada  DateTime?
  observaciones  String?   @db.VarChar(500)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```
