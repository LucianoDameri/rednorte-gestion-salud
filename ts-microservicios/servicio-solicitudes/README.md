# servicio-solicitudes

Microservicio de gestión de solicitudes médicas. Almacena los pedidos de atención de cada paciente (tipo de consulta, especialidad, descripción). Forma parte de la arquitectura BFF + Microservicios de **SaludRedNorte**.

**Puerto:** `3002`  
**Base de datos:** `db_solicitudes` (MySQL 8.0)  
**Patrón:** Repository + Service Layer

## Variables de entorno (`.env`)

```env
DATABASE_URL="mysql://root:rednorte123@localhost:3306/db_solicitudes"
PORT=3002
```

## Instalación y arranque

```bash
npm install
npx prisma migrate dev --name init
npm run prisma:seed    # carga 5 solicitudes de prueba
npm run dev            # inicia en http://localhost:3002
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/solicitud` | Lista solicitudes (filtro: `?pacienteId=X&especialidadId=Y`) |
| GET | `/solicitud/:id` | Obtiene una solicitud por ID |
| POST | `/solicitud` | Crea una nueva solicitud |
| PUT | `/solicitud/:id` | Actualiza una solicitud |
| DELETE | `/solicitud/:id` | Elimina una solicitud |

### Body — POST

```json
{
  "pacienteId": 1,
  "especialidadId": 1,
  "tipoAtencion": "CONSULTA",
  "descripcion": "Dolor de cabeza frecuente"
}
```

### Valores válidos — tipoAtencion

`CONSULTA` | `PROCEDIMIENTO` | `CIRUGIA` | `DIAGNOSTICO`

### Especialidades disponibles

| ID | Nombre |
|----|--------|
| 1 | Cardiología |
| 2 | Oftalmología |
| 3 | Traumatología |
| 4 | Neurología |
| 5 | Dermatología |
| 6 | Ginecología |
| 7 | Pediatría |

## Tests unitarios

```bash
npm test              # ejecuta todos los tests con coverage
npm run test:watch    # modo watch para desarrollo
```

## Modelo de datos (Prisma)

```prisma
model Solicitud {
  id            Int      @id @default(autoincrement())
  pacienteId    Int
  especialidadId Int
  tipoAtencion  String   @db.VarChar(30)
  descripcion   String?  @db.VarChar(500)
  prioridad     String   @default("NORMAL") @db.VarChar(20)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}
```
