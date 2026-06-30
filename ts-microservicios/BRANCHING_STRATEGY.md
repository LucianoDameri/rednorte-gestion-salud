# Plan de Branching Git — SaludRedNorte

**Estrategia adoptada:** Git Flow (adaptación simplificada para equipo pequeño)  
**Repositorio:** `saludrednorte`  
**Convención de commits:** Conventional Commits 1.0.0

---

## 1. Estructura de Ramas

```
main
  └── develop
        ├── feature/bff-circuit-breaker
        ├── feature/servicio-paciente
        ├── feature/servicio-solicitudes
        ├── feature/servicio-lista-espera
        ├── feature/frontend-react
        └── hotfix/fix-turno-autoincrement
```

| Rama | Propósito | ¿Se despliega? | Quién puede hacer merge |
|---|---|---|---|
| `main` | Código listo para producción, estable | Sí (producción) | Solo vía PR aprobado |
| `develop` | Integración continua de features | Sí (staging) | Solo vía PR |
| `feature/*` | Una característica o tarea específica | No | El mismo developer |
| `hotfix/*` | Corrección urgente en producción | No | Solo vía PR a main y develop |

---

## 2. Flujo de Trabajo

### 2.1 Crear y trabajar en una feature

```bash
# Partiendo siempre desde develop actualizado
git checkout develop
git pull origin develop

# Crear rama de feature con nombre descriptivo
git checkout -b feature/servicio-paciente

# Trabajar... commits frecuentes y pequeños
git add src/services/paciente.service.ts
git commit -m "feat(paciente): add findByRut method to PacienteService"

git add src/__tests__/paciente.service.test.ts
git commit -m "test(paciente): add unit tests for PacienteService"

# Cuando está lista, integrar develop actualizado antes del PR
git fetch origin develop
git rebase origin/develop   # mantiene historial limpio

# Push y abrir Pull Request
git push origin feature/servicio-paciente
```

### 2.2 Merge de feature a develop

```bash
# En GitHub/GitLab: abrir PR de feature/servicio-paciente → develop
# Mínimo 1 aprobación requerida
# Ejecutar tests antes de aprobar: npm test

# Merge con --no-ff para preservar contexto del PR en el historial
git checkout develop
git merge --no-ff feature/servicio-paciente -m "Merge feature/servicio-paciente into develop"
git push origin develop

# Eliminar rama local y remota
git branch -d feature/servicio-paciente
git push origin --delete feature/servicio-paciente
```

### 2.3 Release a producción (main)

```bash
# Solo cuando develop está estable y testeado
git checkout main
git merge --no-ff develop -m "release: v1.0.0 — BFF + 3 microservicios + frontend"

# Etiquetar la versión
git tag -a v1.0.0 -m "Primera versión estable de SaludRedNorte"
git push origin main --tags
```

### 2.4 Hotfix (corrección urgente en producción)

```bash
# Partir SIEMPRE desde main
git checkout main
git pull origin main
git checkout -b hotfix/fix-turno-autoincrement

# Aplicar corrección
git commit -m "fix(lista-espera): correct numeroTurno calculation on empty list"

# Merge a AMBAS ramas (main y develop) para no perder la corrección
git checkout main
git merge --no-ff hotfix/fix-turno-autoincrement
git tag -a v1.0.1 -m "Hotfix: correct turno autoincrement"

git checkout develop
git merge --no-ff hotfix/fix-turno-autoincrement

git push origin main develop --tags
git branch -d hotfix/fix-turno-autoincrement
```

---

## 3. Convención de Nombres de Ramas

| Prefijo | Uso | Ejemplo |
|---|---|---|
| `feature/` | Nueva funcionalidad | `feature/bff-circuit-breaker` |
| `hotfix/` | Corrección urgente en producción | `hotfix/cors-error-bff` |
| `fix/` | Corrección no urgente | `fix/seed-mysql-encoding` |
| `refactor/` | Refactorización sin cambio de comportamiento | `refactor/paciente-service-types` |
| `test/` | Agregar o mejorar tests | `test/add-listaespera-controller` |
| `docs/` | Solo documentación | `docs/readme-componentes` |
| `chore/` | Configuración, dependencias | `chore/add-jest-ts-jest` |

---

## 4. Convención de Commits (Conventional Commits)

```
<tipo>(<scope>): <descripción corta en imperativo>

[cuerpo opcional con más detalle]

[footer: referencias a issues, breaking changes]
```

### Tipos válidos

| Tipo | Cuándo usarlo |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `test` | Agregar o modificar tests |
| `refactor` | Refactorización sin cambio de comportamiento |
| `docs` | Solo documentación |
| `chore` | Configuración, dependencias, CI |
| `style` | Formato de código (sin cambio de lógica) |

### Ejemplos de commits del proyecto

```bash
git commit -m "feat(bff): implement Circuit Breaker with cockatiel for all routes"
git commit -m "feat(lista-espera): add automatic numeroTurno generation on create"
git commit -m "fix(solicitudes): validate tipoAtencion enum before persisting"
git commit -m "test(paciente): add unit tests for controller with mocked service"
git commit -m "chore(servicio-paciente): add jest and ts-jest devDependencies"
git commit -m "docs: add PATRONES_DISENO.md with architecture documentation"
git commit -m "refactor(bff): extract withResilience helper to circuitBreaker.ts"
```

---

## 5. Resolución de Conflictos de Merge

### Escenario: dos developers modificaron el mismo archivo

```bash
# Developer A ya mergeó su feature a develop
# Developer B intenta mergear su feature y hay conflicto en package.json

git checkout feature/frontend-react
git fetch origin develop
git rebase origin/develop

# Git pausa en el conflicto y muestra:
# CONFLICT (content): Merge conflict in package.json

# Abrir el archivo y resolver manualmente:
# <<<<<<< HEAD (rama actual)
#   "react": "^18.3.0",
# =======
#   "react": "^18.2.0",
# >>>>>>> origin/develop

# Elegir la versión correcta (en este caso la más nueva):
# "react": "^18.3.0",

# Marcar como resuelto y continuar
git add package.json
git rebase --continue

git commit -m "chore(frontend): resolve merge conflict in package.json, keep react ^18.3.0"
git push origin feature/frontend-react --force-with-lease
```

### Buenas prácticas para evitar conflictos

1. **Ramas cortas y enfocadas**: una feature = una responsabilidad = máximo 3-5 días de trabajo
2. **Rebase frecuente**: `git fetch origin develop && git rebase origin/develop` al iniciar cada jornada
3. **Archivos de configuración**: `package.json`, `docker-compose.yml` y `.env.example` son de alta conflictividad. Coordinar cambios en estos archivos vía chat antes de modificar.
4. **Sin commits directos a main o develop**: toda integración va por Pull Request

---

## 6. Pull Request — Checklist

Antes de aprobar un PR verificar:

- [ ] Los tests pasan: `npm test` en el servicio modificado
- [ ] No hay errores de TypeScript: `npx tsc --noEmit`
- [ ] La rama está basada en `develop` actualizado (rebase hecho)
- [ ] El PR tiene descripción clara de qué cambia y por qué
- [ ] Variables de entorno nuevas están documentadas en `.env.example`
- [ ] Si hay cambios en schema de Prisma: la migración fue generada (`prisma migrate dev`)

---

## 7. Historial de Branches del Proyecto

Las branches creadas durante el desarrollo de SaludRedNorte fueron:

```
main                                   ← Estado de producción
develop                                ← Integración continua
feature/arquitectura-base              ← Docker Compose + estructura inicial
feature/servicio-paciente              ← CRUD pacientes + Prisma + MySQL
feature/servicio-solicitudes           ← CRUD solicitudes médicas
feature/servicio-lista-espera          ← Cola de turnos + resumen estadístico
feature/bff-orquestador               ← BFF + agregación de datos
feature/bff-circuit-breaker           ← Implementación cockatiel
feature/frontend-react                 ← UI React + Vite + TypeScript
feature/unit-tests                     ← Tests Jest + ts-jest 3 servicios
docs/patrones-branching               ← Esta documentación
```
