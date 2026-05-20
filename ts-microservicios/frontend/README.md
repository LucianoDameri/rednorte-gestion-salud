# Frontend — SaludRedNorte

Aplicación web desarrollada con **React + Vite + TypeScript**. Se comunica exclusivamente con el BFF (puerto 3000) a través de un proxy de desarrollo.

**Puerto:** `5173`  
**Framework:** React 18 + Vite  
**Router:** React Router DOM  
**HTTP Client:** Axios

## Instalación y arranque

```bash
npm install
npm run dev    # inicia en http://localhost:5173
```

> El BFF debe estar corriendo en `http://localhost:3000` antes de iniciar el frontend.

## Páginas

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `PacientesPage` | CRUD completo de pacientes |
| `/solicitudes` | `SolicitudesPage` | Crear y listar solicitudes médicas por paciente |
| `/lista-espera` | `ListaEsperaPage` | Cola de turnos con filtros y estadísticas |

## Proxy de desarrollo (Vite)

El archivo `vite.config.ts` redirige todas las peticiones `/bff/*` al BFF:

```typescript
proxy: {
  '/bff': 'http://localhost:3000',
}
```

## Componentes principales

| Componente | Descripción |
|-----------|-------------|
| `ServiceStatusBar` | Barra de estado que verifica `/health` cada 10s y muestra UP/DOWN de cada microservicio |
| `PacientesPage` | Tabla con CRUD inline, formulario de alta/edición |
| `SolicitudesPage` | Formulario de nueva solicitud, filtro por paciente, badge por tipo de atención |
| `ListaEsperaPage` | Cards de estadísticas, filtros por estado/prioridad, edición inline de turno |

## Variables de entorno

No requiere `.env` adicional. La configuración de proxy está en `vite.config.ts`.
