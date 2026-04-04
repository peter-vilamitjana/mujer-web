# MujerApp — Mapeo Fase 0 a Código Concreto

**Rama**: `database-config` | **Fecha**: 2026-04-03 | **Equipo**: plan-review

---

## FASE 0 — Cimientos Estables (2 semanas)

Mapeo de cada tarea (0.1–0.10) a archivos y cambios puntuales:

---

### 0.1 — Eliminar `ignoreBuildErrors` + corregir errores TS

**Archivo**: `next.config.ts`
- Línea 8: `ignoreBuildErrors: true,`
- Línea 11: `ignoreDuringBuilds: true,`

**Cambio**: Cambiar a `false` ambas flags y ejecutar `tsc --noEmit` para mapear todos los errores reales.

**Errores conocidos** (del output de tsc):
- `src/components/VolumenTiempoReal.tsx:3` — recharts no exporta `Defs`, `linearGradient`, `Stop`
- `src/lib/firebase.ts:22` — `Property '_settings' does not exist on type 'Firestore'`

**Complejidad**: Media

---

### 0.2 — Eliminar credenciales de test hardcodeadas

**Archivos afectados**:
1. `src/app/(admin)/login/page.tsx`
   - Línea 29: `const [email, setEmail] = useState('clienta@mujer.com');`
   - Línea 30: `const [password, setPassword] = useState('password123');`
   - Líneas 184–185: Hints de credenciales visibles en UI

2. `src/lib/auth.ts`
   - Verificar presencia de credenciales hardcodeadas en CredentialsProvider

**Cambio**:
- Dejar campos vacíos (`useState('')`)
- Mover datos de test a `.env.local` (no comitear)
- Remover hints de credenciales de la UI

**Complejidad**: Baja — 3 líneas a cambiar, sin lógica.

---

### 0.3 — Crear `.env.example` documentado

**Archivo a crear**: `.env.example`

**Variables necesarias** (basado en `next.config.ts`):
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
NEXTAUTH_CALLBACK_URL=
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

**Complejidad**: Baja

---

### 0.4 — Corregir `userRole = 'admin'` → leer de sesión

**Archivos afectados**:
1. `src/app/(admin)/clientes/page.tsx`
   - Línea 24: `const userRole = 'admin'; // TODO: Get role from user auth state`

2. `src/app/(admin)/clientes/[id]/page.tsx`
   - Línea 39: `const userRole = 'admin' as UserRole;`

**Cambio**: Reemplazar con lectura desde sesión:
```typescript
const session = await auth();
const userRole = session?.user?.role || 'clienta';
```

**Complejidad**: Media — Requiere que `role` esté propagado en el JWT de NextAuth.

---

### 0.5 — Desacoplar `branchId` hardcodeado → leer de TenantContext

**Archivos afectados**:
1. `src/actions/booking.actions.ts`
   - Línea 104: `branchId: 'sucursal_centro', // TODO: dinámico cuando existan múltiples branches`

2. `src/app/(admin)/turnos/page.tsx`
   - Línea 305: `branchId: 'sucursal_centro', // TODO: Get from context when generic branch support is added`

**Cambio**:
- En `turnos/page.tsx`: usar `const { branchId } = useTenant();`
- En `booking.actions.ts` (Server Action): recibir `branchId` como parámetro desde el cliente
- Validar en Firestore rules que el `branchId` pertenece al tenant del usuario

**Complejidad**: Alta — Refactor de Server Actions + validación en reglas + pruebas e2e.

---

### 0.6 — Proteger `/admin/seed` y `/admin/migrate` en middleware

**Archivo**: `src/middleware.ts`

**Estado actual del matcher** (líneas 13–20):
```typescript
export const config = {
  matcher: [
    '/agenda/:path*',
    '/clientes/:path*',
    '/dashboard/:path*',
    '/servicios/:path*',
    '/turnos/:path*',
    '/mis-turnos/:path*',
  ],
};
```

**Cambio**: Añadir:
```typescript
'/admin/seed/:path*',
'/admin/migrate/:path*',
```

**Complejidad**: Baja — 2 líneas al matcher.

---

### 0.7 — Cubrir rutas marketplace autenticadas en middleware

**Archivo**: `src/middleware.ts`

**Cambio**: Añadir al matcher:
```typescript
'/salones/:slug/dashboard/:path*',
```

**Complejidad**: Baja — Una línea al matcher.

---

### 0.8 — Setup CI/CD (GitHub Actions)

**Archivo a crear**: `.github/workflows/ci.yml`

**Pasos mínimos**:
1. Checkout + setup Node.js
2. `npm ci`
3. `npm run lint`
4. `npx tsc --noEmit`
5. `npm run build`

**Complejidad**: Media — Requiere que 0.1 esté completo primero (build limpio).

---

### 0.9 — Configurar Sentry

**Cambios**:
1. `npm install @sentry/nextjs`
2. Crear `sentry.client.config.ts` y `sentry.server.config.ts`
3. `src/app/layout.tsx` — inicializar Sentry
4. Añadir `NEXT_PUBLIC_SENTRY_DSN=` a `.env.example`

**Complejidad**: Media — Integración estándar Next.js + Sentry, ~2h.

---

### 0.10 — Configurar staging environment

**Cambios**:
1. Crear `.env.staging` apuntando a proyecto Firebase de staging
2. Verificar `firebase.json` para configuración de App Hosting
3. Añadir workflow en CI para deploy automático a staging en merge a rama `staging`

**Complejidad**: Media — Requiere segundo proyecto Firebase.

---

## RESUMEN POR COMPLEJIDAD

| Complejidad | Tareas | Estimado |
|-------------|--------|----------|
| **Baja** | 0.2, 0.3, 0.6, 0.7 | 2 días |
| **Media** | 0.4, 0.8, 0.9, 0.10 | 5 días |
| **Alta** | 0.1, 0.5 | 3 días |
| **TOTAL** | — | **10 días ≈ 2 semanas** |

---

## ARCHIVOS CRÍTICOS — CHECKLIST

- [ ] `next.config.ts` — líneas 8, 11
- [ ] `src/app/(admin)/login/page.tsx` — líneas 29–30, 184–185
- [ ] `src/app/(admin)/clientes/page.tsx` — línea 24
- [ ] `src/app/(admin)/clientes/[id]/page.tsx` — línea 39
- [ ] `src/actions/booking.actions.ts` — línea 104
- [ ] `src/app/(admin)/turnos/page.tsx` — línea 305
- [ ] `src/middleware.ts` — añadir 4 rutas al matcher
- [ ] `src/lib/auth.ts` — verificar CredentialsProvider
- [ ] `.env.example` — crear (nuevo)
- [ ] `.github/workflows/ci.yml` — crear (nuevo)
- [ ] `sentry.*.config.ts` — crear (nuevos)
- [ ] `.env.staging` — crear (nuevo)