# servicio-paciente

Microservicio de gestión de datos personales de pacientes. Forma parte de la arquitectura BFF + Microservicios de **SaludRedNorte**.

**Puerto:** `3001`  
**Base de datos:** `db_paciente` (MySQL 8.0)  
**Patrón:** Repository + Service Layer

## Variables de entorno (`.env`)

```env
DATABASE_URL="mysql://root:rednorte123@localhost:3306/db_paciente"
PORT=3001
```

## Instalación y arranque

```bash
npm install
npx prisma migrate dev --name init
npm run prisma:seed    # carga 4 pacientes de prueba
npm run dev            # inicia en http://localhost:3001
```

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/paciente` | Lista todos los pacientes |
| GET | `/paciente/:id` | Obtiene un paciente por ID |
| GET | `/paciente/rut/:rut` | Obtiene un paciente por RUT |
| POST | `/paciente` | Crea un nuevo paciente |
| PUT | `/paciente/:id` | Actualiza datos del paciente |
| DELETE | `/paciente/:id` | Elimina un paciente |

### Body — POST/PUT

```json
{
  "rut": "12345678-9",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "telefono": "+56911111111"
}
```

## Tests unitarios

```bash
npm test              # ejecuta todos los tests con coverage
npm run test:watch    # modo watch para desarrollo
```

Los tests están en `src/__tests__/` y mockean Prisma para ejecutarse sin base de datos.

## Modelo de datos (Prisma)

```prisma
model Paciente {
  id        Int       @id @default(autoincrement())
  rut       String    @unique @db.VarChar(15)
  nombre    String
  apellido  String
  telefono  String?
  email     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```
