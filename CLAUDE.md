# Fit Tracker — Contexto del proyecto

## Propósito

Fit Tracker es una web app personal (móvil + desktop) para llevar seguimiento físico integral: progreso corporal, entrenamiento de gimnasio y nutrición, en un solo lugar. Uso privado, máximo 5 usuarios (amigos cercanos). No es un producto comercial: prioriza código limpio, mantenible y simple sobre escalabilidad prematura.

### Módulos

1. **Progreso**: registro manual de peso, estatura, % grasa, % músculo (datos de estudios InBody), con gráficas de evolución en el tiempo.
2. **Gym Tracker**: creación de rutinas conectadas a un catálogo de ejercicios (wger), sub-apartados de Rutinas, Progreso (pesos por ejercicio), Histórico y un Heatmap tipo calendario de contribuciones con los días entrenados.
3. **Nutrition Tracker**: subida de PDFs de la nutrióloga (formato fijo: secciones "Porciones al día" y "Menú ejemplo") con extracción asistida por LLM a JSON estructurado, recetas propias para planes semanales, tracking diario de comidas, y búsqueda de macros de alimentos vía API externa.

## Stack tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| Frontend | Next.js (React) + TypeScript | Solo UI, consume la API |
| Backend | Next.js (API-only, Route Handlers) + TypeScript | Sin páginas, deploy independiente |
| Estilos | Tailwind CSS | |
| ORM | Prisma | |
| Base de datos | PostgreSQL (Supabase) | |
| Storage de archivos | Supabase Storage | PDFs de la nutrióloga |
| Auth | NextAuth.js (Auth.js) con credenciales + PrismaAdapter | Corre en `apps/api`, ver sección Auth |
| Monorepo | Turborepo + pnpm workspaces | |
| Node | 20 LTS | |
| Hosting | Vercel Hobby (gratis) | Dos proyectos Vercel: `apps/web` y `apps/api`, bajo subdominios de un dominio propio |
| API de ejercicios | wger (importado una vez a la BD propia) | Licencia CC-BY-SA 3.0 — atribuir si se expone públicamente |
| API de nutrición | USDA FoodData Central (base, CC0, cacheable) + Edamam Food Database API (NLP en español, NO cachear/persistir permanentemente) | |
| Extracción de PDFs | Texto plano + LLM (Claude API) → JSON estructurado | |
| Heatmap | `react-calendar-heatmap` o `@uiw/react-heat-map` | |
| Gráficas | Recharts | |

## Arquitectura

### Estructura del monorepo

```
fit-tracker/
├── apps/
│   ├── web/          # Next.js — solo frontend, consume apps/api
│   └── api/          # Next.js — solo Route Handlers, sin páginas
├── packages/
│   ├── database/      # Prisma schema + client compartido
│   ├── types/          # Tipos/DTOs compartidos entre web y api
│   └── ui/              # Componentes Tailwind compartidos (opcional)
```

### Regla de oro (innegociable)

`apps/web` **nunca** accede a Prisma ni a la base de datos directamente. Toda lectura/escritura pasa por `apps/api` vía fetch a su URL pública (`NEXT_PUBLIC_API_URL`). Los tipos compartidos viven en `packages/types` para que ambos lados usen los mismos contratos.

La única excepción evaluada y descartada fue meter NextAuth+PrismaAdapter en `apps/web` (más simple de desplegar, pero rompe la regla). Se optó por mantener NextAuth completo dentro de `apps/api`.

### Auth — dominios y cookies compartidas

NextAuth con PrismaAdapter corre **solo en `apps/api`** (necesita tocar Postgres para persistir sesiones/usuarios). `apps/web` nunca importa Prisma ni el adapter — solo consume `/api/auth/*` vía fetch y lee la cookie de sesión.

Para que la cookie de sesión (httpOnly) sea compartida entre `apps/web` y `apps/api`, ambos deben vivir bajo subdominios del mismo dominio raíz (los `*.vercel.app` por defecto son dominios distintos entre sí y no comparten cookies):

```
app.tudominio.com   → Vercel Project "web"  (apps/web)
api.tudominio.com   → Vercel Project "api"  (apps/api)
Set-Cookie: Domain=.tudominio.com
```

Pendiente: comprar dominio propio antes del deploy real (no bloquea el desarrollo local).

### Capas del backend (`apps/api/src`)

```
apps/api/src/
├── app/api/
│   ├── auth/[...nextauth]/route.ts   # Auth.js + PrismaAdapter
│   └── progress/route.ts              # Route Handler: valida (Zod) → service → responde
├── services/
│   └── progress.service.ts             # lógica de negocio pura, sin dependencias de Next.js
├── repositories/
│   └── progress.repository.ts          # única capa que toca Prisma
├── lib/
│   ├── auth.config.ts
│   ├── wger.client.ts
│   ├── usda.client.ts
│   ├── edamam.client.ts
│   └── claude.client.ts                 # cliente para extracción de PDFs vía LLM
├── errors/
│   └── domain-errors.ts
└── middleware/
    └── error-handler.ts                  # traduce domain errors → { error: string, code: string }
```

Reglas de capas:
- `route.ts` delgado: solo valida input (Zod) y HTTP I/O. Nunca importa Prisma directamente ni contiene lógica de negocio.
- `services/` nunca importa `next/server` ni nada de Next.js — debe ser testeable en aislamiento.
- `repositories/` es la única capa que importa el cliente de Prisma.
- Todo cliente de API externa (wger, USDA, Edamam, Claude) vive en `lib/`, con wrapper tipado propio — nunca `fetch` sueltos dispersos en el código.

### Frontend (`apps/web`)

- Componentes pequeños, una sola responsabilidad. Lógica de fetching en hooks dedicados (`useProgress`, `useWorkouts`, `useMeals`), nunca directo en componentes de página.
- Server Components por defecto; `"use client"` solo donde haya interactividad real (formularios, gráficas, heatmap).
- Tipos importados de `packages/types`, nunca redefinidos localmente.
- Tailwind: extraer a componente reutilizable cuando un patrón se repite 3+ veces.

### Base de datos (`packages/database`)

- Un solo `schema.prisma` compartido; migraciones versionadas con `prisma migrate`.
- Nombres de tablas/campos en `snake_case` a nivel de BD, mapeados a `camelCase` en el cliente Prisma (`@map`/`@@map`).
- Nunca guardar los PDFs en la base de datos: solo URL de Supabase Storage + metadatos + JSON extraído.

## Variables de entorno

| Variable | Vive en | Motivo |
|---|---|---|
| `DATABASE_URL` | `apps/api` | Prisma solo aquí |
| `NEXTAUTH_SECRET` | `apps/api` | firma de tokens |
| `NEXTAUTH_URL` | `apps/api` | `https://api.tudominio.com` |
| `AUTH_COOKIE_DOMAIN` | `apps/api` | `.tudominio.com` |
| `WGER_API_KEY` | `apps/api` | cliente en `lib/wger.client.ts` |
| `USDA_API_KEY` | `apps/api` | cliente en `lib/usda.client.ts` |
| `EDAMAM_APP_ID` / `EDAMAM_APP_KEY` | `apps/api` | cliente en `lib/edamam.client.ts` |
| `ANTHROPIC_API_KEY` | `apps/api` | cliente en `lib/claude.client.ts` (extracción de PDFs) |
| `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` | `apps/api` | Storage de PDFs |
| `NEXT_PUBLIC_API_URL` | `apps/web` | única variable que necesita el frontend |

Ninguna de las de `apps/api` debe exponerse jamás al frontend.

## Convenciones de código

- TypeScript estricto (`strict: true`) en todo el monorepo. Nada de `any` salvo justificación explícita en comentario.
- ESLint + Prettier configurados a nivel raíz del monorepo, compartidos por todos los `apps/*` y `packages/*`.
- Nombres de variables, funciones y archivos en inglés; nombres de dominio de negocio (conceptos del nutriólogo/gimnasio) pueden mantenerse en español si el equivalente en inglés pierde claridad — pero consistente dentro del mismo módulo, sin mezclar ambos criterios.
- Commits siguiendo Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, etc.).
- Validación de input con Zod en el borde de cada Route Handler; nunca confiar en el shape del body sin validar.
- Manejo de errores centralizado vía `middleware/error-handler.ts`.

## Licencias y límites de APIs externas

- **wger**: CC-BY-SA 3.0 — atribuir si se expone públicamente. Se importa una vez a la BD propia, no se consulta en vivo.
- **USDA FoodData Central**: CC0 — se puede persistir/cachear libremente.
- **Edamam Food Database**: NO se cachea ni se almacena permanentemente, solo uso en vivo.

## Roadmap (orden de implementación)

1. Setup del monorepo (Turborepo, `apps/web`, `apps/api`, `packages/database`, `packages/types`) y despliegue inicial en Vercel (ambos proyectos, dominio propio pendiente de compra).
2. Módulo **Progreso** (CRUD + gráficas) — el más simple, primero.
3. Módulo **Gym Tracker** (importación de wger, rutinas, heatmap).
4. Módulo **Nutrition Tracker** (parsing de PDFs vía LLM, macros vía USDA/Edamam, recetas y tracking diario).

## Antes de escribir código en cada sesión

1. Confirmar en qué módulo/capa se está trabajando.
2. Respetar la separación `routes/services/repositories` en backend y hooks/componentes en frontend.
3. Mantener los tipos compartidos sincronizados en `packages/types`.
4. Nunca romper la regla de oro: `apps/web` no toca Prisma ni DB, ni siquiera para auth.
