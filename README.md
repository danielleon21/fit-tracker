# Fit Tracker

Web app personal (móvil + desktop) para llevar seguimiento físico integral: progreso corporal, entrenamiento de gimnasio y nutrición, en un solo lugar. Uso privado, pensado para un grupo cerrado de amigos (máximo 5 usuarios) — no es un producto comercial, prioriza código simple y mantenible sobre escalabilidad prematura.

Para el contexto completo de arquitectura y decisiones de diseño, ver [CLAUDE.md](./CLAUDE.md). Este README cubre cómo correr el proyecto y en qué estado está.

## Estado actual

| Módulo | Estado |
|---|---|
| **Auth** (registro, login, logout, sesión) | ✅ Funcionando de punta a punta |
| **Progreso** (peso, % grasa, % músculo, peso ideal) | ✅ CRUD conectado a la base de datos real, con modal de primer ingreso y edición de perfil |
| **Dashboard** (`/`) | ✅ Muestra progreso real; calorías, macros y rutina del día están en *empty state* (esperando los módulos de abajo) |
| **Gym Tracker** (rutinas, catálogo de ejercicios wger, heatmap) | ⏳ No implementado |
| **Nutrition Tracker** (PDFs de InBody/nutrióloga, macros, tracking diario) | ⏳ No implementado |
| **Peso ideal vía import de PDF de InBody** | ⏳ Pendiente — hoy se ingresa a mano en el formulario de Progreso |

### Rutas y endpoints ya implementados

- **Frontend (`apps/web`)**: `/login`, `/registro`, `/` (dashboard, requiere sesión)
- **Backend (`apps/api`)**:
  - `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/session` (vía NextAuth)
  - `GET /api/progress`, `POST /api/progress`, `PUT /api/progress/:id`

## Stack

| Capa | Tecnología |
|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| Backend | Next.js 14 (API-only, Route Handlers) + TypeScript |
| ORM | Prisma |
| Base de datos | PostgreSQL |
| Auth | NextAuth.js (Auth.js) con credenciales + PrismaAdapter |
| Monorepo | Turborepo + pnpm workspaces |
| Node | 20 LTS |

## Estructura del monorepo

```
fit-tracker/
├── apps/
│   ├── web/          # Next.js — solo frontend, consume apps/api
│   └── api/          # Next.js — solo Route Handlers, sin páginas
├── packages/
│   ├── database/     # Prisma schema + client compartido
│   ├── types/        # Tipos/DTOs compartidos entre web y api
│   └── ui/           # Componentes Tailwind compartidos (placeholder, sin uso aún)
```

**Regla de oro:** `apps/web` nunca accede a Prisma ni a la base de datos directamente — todo pasa por `apps/api` vía fetch. Ver [CLAUDE.md](./CLAUDE.md) para el resto de las reglas de arquitectura.

## Requisitos previos

- [Node.js 20 LTS](https://nodejs.org/) (ver [`.nvmrc`](./.nvmrc))
- [pnpm](https://pnpm.io/) — si no lo tienes, `corepack enable pnpm` (Node 20 trae Corepack incluido)
- PostgreSQL corriendo localmente (o accesible por red). En Windows, el instalador oficial de [postgresql.org](https://www.postgresql.org/download/windows/) funciona bien.

## Puesta en marcha local

1. **Clonar e instalar dependencias** (desde la raíz del repo):

   ```bash
   pnpm install
   ```

2. **Crear la base de datos** (ajusta usuario/password a los tuyos):

   ```bash
   createdb -U postgres fit_tracker
   ```

   En Windows, si `createdb`/`psql` no se reconocen como comando, no están en el `PATH` — usa la ruta completa al instalador (ej. `"C:\Program Files\PostgreSQL\<version>\bin\createdb.exe"`) o crea la base desde pgAdmin.

3. **Configurar variables de entorno.** Copia cada `.env.example` a `.env` y completa los valores:

   ```bash
   cp packages/database/.env.example packages/database/.env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

   Como mínimo necesitas ajustar `DATABASE_URL` (en `packages/database/.env` **y** en `apps/api/.env`, deben apuntar a la misma base) y `NEXTAUTH_SECRET` (cualquier string largo aleatorio sirve en local). El resto de las variables de `apps/api/.env` (wger, USDA, Edamam, Anthropic, Supabase) son para los módulos de Gym Tracker/Nutrition Tracker que todavía no existen — pueden quedar vacías. Ver la tabla completa más abajo.

4. **Correr las migraciones de Prisma:**

   ```bash
   cd packages/database
   pnpm db:migrate
   cd ../..
   ```

5. **Levantar todo en paralelo** desde la raíz del repo:

   ```bash
   pnpm dev
   ```

   Esto usa Turborepo para correr `apps/web` (http://localhost:3000) y `apps/api` (http://localhost:3001) al mismo tiempo, con logs prefijados por paquete. Para correr solo uno: `pnpm --filter @fit-tracker/web dev` o `pnpm --filter @fit-tracker/api dev`.

6. Abre http://localhost:3000/registro y crea tu primer usuario. Al entrar por primera vez al dashboard vas a ver un modal obligatorio para ingresar tus datos de progreso iniciales (peso, % grasa, % músculo, peso ideal, estatura).

### Notas para Windows

- Si Prisma falla al regenerar el cliente (`EPERM: operation not permitted... query_engine-windows.dll.node`), es porque un servidor de `apps/api` corriendo tiene el archivo bloqueado. Detén ese proceso antes de correr `prisma generate`/`prisma migrate` y vuelve a levantarlo después.
- Si tienes los servidores de `apps/web`/`apps/api` corriendo desde tu propia terminal, no hace falta reiniciarlos para ver cambios de código (Next.js recarga en caliente) — solo para cambios de schema de Prisma.

## Scripts disponibles (raíz del repo)

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Levanta `apps/web` y `apps/api` en paralelo (Turborepo) |
| `pnpm build` | Build de producción de todos los paquetes |
| `pnpm lint` | ESLint en todos los paquetes |
| `pnpm typecheck` | `tsc --noEmit` en todos los paquetes |
| `pnpm format` | Prettier sobre todo el repo |

Dentro de `packages/database` también hay `pnpm db:migrate` (crea/aplica migraciones), `pnpm db:generate` (regenera el cliente de Prisma) y `pnpm db:studio` (abre Prisma Studio para ver/editar datos a mano).

## Variables de entorno

| Variable | Vive en | Motivo |
|---|---|---|
| `DATABASE_URL` | `packages/database`, `apps/api` | Prisma solo corre en `apps/api` |
| `NEXTAUTH_SECRET` | `apps/api` | Firma de tokens de sesión |
| `NEXTAUTH_URL` | `apps/api` | URL pública de `apps/api` (`http://localhost:3001` en local) |
| `WEB_APP_URL` | `apps/api` | Origen de `apps/web`, usado para las cabeceras CORS |
| `AUTH_COOKIE_DOMAIN` | `apps/api` | Vacío en local (cookie host-only); dominio raíz compartido en producción |
| `WGER_API_KEY` / `USDA_API_KEY` / `EDAMAM_APP_ID` / `EDAMAM_APP_KEY` / `ANTHROPIC_API_KEY` / `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | `apps/api` | Para los módulos de Gym Tracker/Nutrition Tracker — no implementados aún, pueden quedar vacías |
| `NEXT_PUBLIC_API_URL` | `apps/web` | Única variable que necesita el frontend — URL de `apps/api` |

Ninguna variable de `apps/api` debe exponerse jamás al frontend.

## Flujo de trabajo con git

Todo el trabajo se hace sobre la rama `dev`; nunca se commitea directo a `master`. Cuando un feature está listo:

```bash
git push origin dev
gh pr create --base master --head dev
```

El merge a `master` se hace manualmente desde GitHub.

## Roadmap

1. ~~Setup del monorepo y auth~~ ✅
2. ~~Módulo **Progreso** (CRUD + formulario de datos iniciales)~~ ✅ — falta agregar las gráficas de evolución en el tiempo
3. Módulo **Gym Tracker**: catálogo de ejercicios (import de wger), rutinas, heatmap de días entrenados
4. Módulo **Nutrition Tracker**: parsing de PDFs de InBody/nutrióloga vía LLM, macros vía USDA/Edamam, recetas y tracking diario
5. Deploy a Vercel (dominio propio pendiente de compra)
