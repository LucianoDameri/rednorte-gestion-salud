# Análisis de Patrones de Diseño y Arquetipos — SaludRedNorte

**Proyecto:** SaludRedNorte — Sistema de Gestión de Atención en Salud Pública  
**Asignatura:** DSY1106 — Desarrollo Fullstack III  
**Tecnologías:** Node.js · TypeScript · Express · Prisma · MySQL · React · cockatiel  

---

## 1. Patrón BFF (Backend for Frontend)

### Descripción
El patrón **BFF (Backend for Frontend)** propone la existencia de un servidor intermediario dedicado exclusivamente a servir las necesidades del cliente frontend. En lugar de que el frontend llame directamente a múltiples microservicios, el BFF actúa como único punto de entrada, orquesta las llamadas necesarias y retorna datos ya procesados y adaptados para la vista.

### Justificación en el proyecto
El frontend React necesita mostrar información de tres servicios diferentes en una sola pantalla (datos del paciente, sus solicitudes y su posición en la lista de espera). Sin BFF, el frontend haría tres llamadas HTTP a tres puertos distintos, complicando el CORS, la seguridad y el manejo de errores. Con el BFF, una sola llamada a `GET /bff/paciente/:id` retorna la vista completa y agregada.

### Diagrama de arquitectura

```
Frontend (React :5173)
        │
        │  Una sola llamada
        ▼
   BFF (:3000)          ← Único punto de entrada
  /     |     \
 ▼      ▼      ▼
Pac.  Solic. Lista     ← Llamadas internas orquestadas por el BFF
:3001  :3002  :3003
 │      │       │
DB     DB      DB
```

### Código representativo

```typescript
// bff/src/routes/paciente.routes.ts
router.get('/:id', async (req, res) => {
  // El BFF orquesta llamadas en paralelo a dos servicios
  const [pacienteRes, solicitudesRes] = await Promise.allSettled([
    withResilience(pacienteBreaker, () => pacienteClient.get(`/paciente/${id}`)),
    withResilience(solicitudBreaker, () => solicitudClient.get(`/solicitud?pacienteId=${id}`)),
  ]);
  // Agrega los datos y retorna una sola respuesta al frontend
  res.json({ ...paciente, solicitudes: solicitudesEnriquecidas });
});
```

### Ventajas obtenidas
- El frontend solo conoce un URL base (`/bff`)
- Agregación de datos en el servidor, no en el cliente
- Punto único para validaciones de seguridad y logging

---

## 2. Patrón Repository (implementado con Prisma ORM)

### Descripción
El patrón **Repository** abstrae la capa de acceso a datos detrás de una interfaz. Los controladores no conocen la base de datos directamente; solo conocen el servicio, que a su vez delega en el repositorio (Prisma). Esto desacopla la lógica de negocio del mecanismo de persistencia.

### Justificación en el proyecto
Cada microservicio tiene su propia clase `*Service` que encapsula todas las operaciones de base de datos. Los controladores no importan Prisma directamente — solo llaman métodos del servicio. Esto facilita las pruebas unitarias (se puede mockear el servicio sin base de datos real) y la sustitución del ORM si fuera necesario.

### Diagrama de capas

```
Controller (HTTP) ──► Service (lógica de negocio)
                           │
                           ▼ (Repository)
                       Prisma ORM ──► MySQL
```

### Código representativo

```typescript
// servicio-paciente/src/services/paciente.service.ts
export class PacienteService {
  async findAll() {
    return prisma.paciente.findMany({ orderBy: { apellido: 'asc' } });
  }

  async create(data: CreatePacienteDto) {
    return prisma.paciente.create({ data });
  }

  async exists(id: number): Promise<boolean> {
    return (await prisma.paciente.count({ where: { id } })) > 0;
  }
}
```

```typescript
// servicio-paciente/src/controllers/paciente.controller.ts
export class PacienteController {
  async listar(_req: Request, res: Response): Promise<void> {
    // El controller NO conoce Prisma, solo el servicio
    const pacientes = await pacienteService.findAll();
    res.json(pacientes);
  }
}
```

### Ventajas obtenidas
- Tests unitarios sin base de datos (`jest.mock('../lib/prisma', ...)`)
- Lógica de negocio separada de SQL/ORM
- Fácil sustitución de MySQL por otro motor sin tocar los controladores

---

## 3. Patrón Circuit Breaker (cockatiel)

### Descripción
El patrón **Circuit Breaker** protege el sistema ante fallos en cadena. Funciona como un interruptor eléctrico: en condiciones normales permite el paso de llamadas (CLOSED); si detecta demasiados fallos consecutivos, abre el circuito (OPEN) y rechaza las peticiones inmediatamente sin esperar timeout; tras un tiempo de espera, pasa a modo de prueba (HALF_OPEN) para verificar si el servicio se recuperó.

### Justificación en el proyecto
El BFF depende de 3 microservicios externos. Si el `servicio-lista-espera` cae, sin Circuit Breaker cada petición al BFF esperaría 5 segundos (timeout de axios), bloqueando el servidor y agotando las conexiones. Con el Circuit Breaker, tras 5 fallos consecutivos el circuito se abre y las peticiones fallidas retornan inmediatamente con un error descriptivo.

### Diagrama de estados

```
      ┌──────────────────────────────────────────────┐
      │                                              │
      ▼         5 fallos consecutivos                │
  [CLOSED] ──────────────────────────► [OPEN]       │
  (Normal)                              (Falla)      │
      ▲                                   │           │
      │                        10s        │           │
      │                    ┌──────────────┘           │
      │         éxito      ▼                          │
      └──────────── [HALF_OPEN] ────────── falla ─────┘
                    (Probando)
```

### Código representativo

```typescript
// bff/src/resilience/circuitBreaker.ts
export const pacienteBreaker = {
  retry: Policy.handleAll().retry().attempts(2).exponential({ initialDelay: 100 }),
  cb: Policy.handleAll().circuitBreaker(10_000, new ConsecutiveBreaker(5)),
};

// Uso en las rutas:
const { data } = await withResilience(pacienteBreaker, () =>
  pacienteClient.get('/paciente')
);
```

### Ventajas obtenidas
- Fallo rápido: el usuario recibe error en millisegundos en vez de esperar timeouts
- Previene sobrecarga en cascada hacia servicios caídos
- Recuperación automática sin reinicio manual
- Logs de eventos de apertura/cierre del circuito para observabilidad

---

## 4. Patrón Service Layer (Capa de Servicio)

### Descripción
El patrón **Service Layer** define una capa de lógica de aplicación que coordina la respuesta de la aplicación a las operaciones de negocio. Separa los casos de uso (lógica) de los mecanismos de entrega (HTTP controllers) y de acceso a datos (repositorios).

### Justificación en el proyecto
La generación automática del número de turno al crear una entrada en la lista de espera (`numeroTurno = count(EN_ESPERA) + 1`) es lógica de negocio que pertenece al servicio, no al controlador ni a la base de datos. El servicio es el único lugar donde esta regla está implementada.

```typescript
// servicio-lista-espera/src/services/listaEspera.service.ts
async create(data: CreateListaEsperaDto) {
  // LÓGICA DE NEGOCIO: número de turno automático
  const totalEnEspera = await prisma.listaEspera.count({
    where: { estado: 'EN_ESPERA' },
  });

  return prisma.listaEspera.create({
    data: { ...data, numeroTurno: totalEnEspera + 1, estado: 'EN_ESPERA' },
  });
}
```

---

## 5. Patrón Facade (Fachada) — BFF como Facade de microservicios

### Descripción
El patrón **Facade** proporciona una interfaz simplificada a un conjunto de interfaces más complejas en un subsistema. El cliente accede a una única interfaz coherente sin necesidad de conocer los componentes internos.

### Justificación en el proyecto
El endpoint `POST /bff/solicitud` es una façade que oculta al frontend la coordinación entre dos microservicios. El frontend envía un solo `POST` y el BFF internamente: (1) crea la solicitud en `servicio-solicitudes`, (2) obtiene el ID retornado, y (3) crea automáticamente la entrada en `servicio-lista-espera`. El frontend no sabe nada de esta coordinación.

```typescript
// bff/src/routes/solicitud.routes.ts
router.post('/', async (req, res) => {
  // Fachada: el frontend solo hace una llamada
  const { data: solicitud } = await withResilience(solicitudBreaker, () =>
    solicitudClient.post('/solicitud', solicitudData)
  );

  // Coordinación interna oculta al frontend
  const { data: turno } = await withResilience(listaEsperaBreaker, () =>
    listaEsperaClient.post('/lista-espera', {
      solicitudId: solicitud.id,
      pacienteId: solicitud.pacienteId,
      prioridad: prioridad || 'NORMAL',
    })
  );

  res.status(201).json({ ...solicitud, listaEspera: turno });
});
```

---

## Resumen de Patrones Aplicados

| Patrón | Categoría GoF | Dónde se aplica | Problema que resuelve |
|---|---|---|---|
| BFF (Backend for Frontend) | Arquitectural | `bff/` completo | Frontend necesita datos de múltiples servicios en una sola llamada |
| Repository | Estructural | `*/src/services/*.service.ts` | Desacopla lógica de negocio del acceso a datos |
| Circuit Breaker | Comportamiento | `bff/src/resilience/circuitBreaker.ts` | Previene fallos en cascada entre microservicios |
| Service Layer | Arquitectural | `*/src/services/*.service.ts` | Centraliza lógica de negocio fuera del controlador HTTP |
| Facade | Estructural | `bff/src/routes/solicitud.routes.ts` | Simplifica la interfaz del sistema de múltiples pasos |

---

## Arquetipo de Proyecto (Estructura Maven-compatible)

Aunque el proyecto usa Node.js/TypeScript en lugar de Java/Spring, la estructura sigue el mismo arquetipo de microservicio que define Maven Archetype para proyectos Spring Boot:

```
servicio-paciente/           ← Arquetipo: microservicio independiente
├── package.json             ← Equivalente a pom.xml (dependencias, scripts)
├── tsconfig.json            ← Equivalente a compiler plugin de Maven
├── .env                     ← Variables de entorno (equivale a application.properties)
├── prisma/
│   └── schema.prisma        ← Equivalente a entidades JPA + migration scripts
└── src/
    ├── controllers/         ← Equivalente a @RestController de Spring
    ├── services/            ← Equivalente a @Service de Spring
    ├── routes/              ← Equivalente a @RequestMapping de Spring
    ├── lib/                 ← Equivalente a @Configuration de Spring
    └── __tests__/           ← Equivalente a src/test/java/
```

La estructura replica el arquetipo `maven-archetype-quickstart` adaptado a ecosistema Node.js, manteniendo separación de responsabilidades, capas bien definidas y convenciones de nomenclatura consistentes.
