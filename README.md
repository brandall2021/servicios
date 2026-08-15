# Servicios - Plataforma de Servicios Profesionales

Plataforma digital para conectar clientes con profesionales en Argentina. Soporta publicación de servicios y productos, búsquedas con filtros, solicitudes de presupuesto, reservas, chat, favoritos, comparaciones, promociones y panel administrativo.

## Estado Actual

- Marketplace unificado activo con servicios y productos en una sola experiencia.
- Detalle genérico en `/listings/[idOrSlug]` y detalle legacy de servicios en `/servicios/[id]`.
- Notificaciones in-app con polling y notificaciones nativas del navegador opt-in.
- Mapa de ubicación embebido cuando hay coordenadas guardadas.
- Verificación local vigente: `npm run lint`, `npm run build`, `npx playwright test e2e/visual.spec.ts`, `npx playwright test e2e/accessibility.spec.ts`.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 + modo oscuro |
| Base de datos | PostgreSQL + Prisma ORM |
| Autenticación | NextAuth v5 (Credentials, Google OAuth) |
| Validación | Zod en endpoints |
| UI | Componentes propios + Lucide icons |

## Features Principales

### Clientes

- Buscar por texto, categoría, ubicación, precio, verificación, rating y cercanía GPS.
- Ver perfiles públicos con reputación, fotos, opiniones y datos de contacto.
- Solicitar presupuestos con descripción, materiales y archivos adjuntos.
- Chatear con proveedores y seguir conversaciones.
- Reservar turnos en servicios que lo soportan.
- Guardar favoritos y comparar publicaciones.
- Consultar productos y sus cotizaciones.
- Recibir notificaciones de mensajes, opiniones, presupuestos y cotizaciones.
- Activar notificaciones nativas del navegador para actividad nueva.

### Proveedores

- Publicar servicios con fotos, precio, ubicación, disponibilidad y redes.
- Publicar productos con stock, entrega, marca y datos comerciales.
- Recibir solicitudes de presupuesto y responder con cotizaciones.
- Gestionar promociones activas.
- Ver métricas comerciales básicas.
- Tener perfil público con zona, experiencia y certificaciones.

### Administradores

- Dashboard con métricas de usuarios, servicios, opiniones, denuncias y presupuestos.
- Gestión de usuarios con búsqueda, filtros, verificación, bloqueo y baja.
- Gestión de servicios, opiniones, denuncias y presupuestos.
- Vista de auditoría para acciones relevantes.

## Marketplace Unificado

- `/buscar` mezcla servicios y productos con paginación local y ordenamiento.
- `/listings/[idOrSlug]` resuelve productos y servicios legacy.
- Favoritos y comparador funcionan sobre ambos tipos de publicación.
- `/proveedor/metricas` y `/proveedor/promociones` cubren la parte comercial del proveedor.
- Los detalles muestran mapa cuando existen coordenadas.

## Notificaciones Y Mapa

- La campanita del header consulta `/api/notificaciones` cada 30s.
- Si el usuario habilita permisos del navegador, llegan notificaciones nativas para items nuevos.
- El mapa embebido usa OpenStreetMap y solo aparece cuando la publicación tiene lat/lng.
- Las vistas con coordenadas son el detalle unificado y el detalle legacy de servicio.

## Funciones Generales

- Modo oscuro con persistencia y preferencia del sistema.
- SEO dinámico por página.
- Paginación reutilizable.
- Recuperación de contraseña con token hasheado y expiración.
- Responsive mobile-first.
- Formularios protegidos con reCAPTCHA.

## Requisitos

- Node.js 20+
- PostgreSQL
- Google Cloud Console opcional para OAuth

## Desarrollo Local

```bash
# 1. Clonar
git clone https://github.com/brandall2021/servicios.git
cd servicios

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env

# 4. Generar cliente Prisma y migrar
npx prisma generate
npx prisma migrate dev --name init

# 5. Poblar base de datos con datos de prueba
npm run seed

# 6. Iniciar servidor de desarrollo
npm run dev
```

### Usuarios de prueba (seed)

| Email | Contraseña | Rol |
|---|---|---|
| admin@servicios.com | 123456 | Admin |
| cpereyra@face.unt.edu.ar | 123456 | Admin |
| juan@example.com | 123456 | Proveedor |
| maria@example.com | 123456 | Proveedor |
| carlos@example.com | 123456 | Proveedor |
| cliente@example.com | 123456 | Cliente |

## Variables de Entorno

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `NEXTAUTH_URL` | URL pública del sitio |
| `NEXTAUTH_SECRET` | Secreto para NextAuth |
| `GOOGLE_CLIENT_ID` | OAuth Google opcional |
| `GOOGLE_CLIENT_SECRET` | OAuth Google opcional |
| `ADMIN_EMAIL` | Email del administrador |
| `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` | Site key de reCAPTCHA |
| `RECAPTCHA_SECRET_KEY` | Secret de reCAPTCHA |

## Scripts Disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servir build de producción |
| `npm run lint` | ESLint |
| `npm run seed` | Poblar base de datos |
| `npm run e2e` | Playwright end-to-end |
| `npm run e2e:headed` | Playwright en modo visible |

## Verificación Recomendada

- `npm run lint`
- `npm run build`
- `npx playwright test e2e/visual.spec.ts`
- `npx playwright test e2e/accessibility.spec.ts`

## Estructura del Proyecto

```text
src/
├── app/            # Rutas, páginas y API routes
├── components/     # UI base y componentes compartidos
├── lib/            # Auth, Prisma, marketplace, utilidades
└── types/          # Tipos compartidos
prisma/
├── schema.prisma   # Modelos y enums
├── seed.ts         # Seed de datos
└── migrations/     # Migraciones
```

## Modelo de Datos

- `User` - Cliente, Proveedor o Admin.
- `Servicio` - Publicación legacy con categoría, precio, ubicación y disponibilidad.
- `Listing` - Marketplace unificado para servicios y productos.
- `Foto` / `ListingMedia` - Imágenes asociadas a publicaciones y opiniones.
- `Opinion` - Calificación con comentario opcional.
- `Report` - Denuncias con motivo y estado.
- `Chat` / `Mensaje` - Mensajería interna.
- `BudgetRequest` - Solicitud de presupuesto con archivos.
- `BudgetQuote` - Cotización con vigencia y desglose.
- `Notification` - Notificaciones in-app.

## Deploy en Dokploy

### 1. Crear un nuevo proyecto en Dokploy

1. Iniciá sesión en tu panel de Dokploy.
2. Hacé clic en `Nuevo proyecto` y luego en `Nuevo servicio`.
3. Elegí `Docker` como tipo de servicio.

### 2. Conectar el repositorio

1. En `Source`, seleccioná `GitHub`.
2. Conectá tu cuenta de GitHub si no lo está.
3. Seleccioná el repositorio `brandall2021/servicios`.
4. Elegí la rama `main`.
5. Dokploy va a detectar automáticamente el `Dockerfile`.

### 3. Configurar variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://usuario:password@host:5432/servicios?schema=public` |
| `NEXTAUTH_URL` | URL pública del sitio | `https://tudominio.com` |
| `NEXTAUTH_SECRET` | Secreto para NextAuth | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | OAuth Google opcional | - |
| `GOOGLE_CLIENT_SECRET` | OAuth Google opcional | - |
| `ADMIN_EMAIL` | Email del administrador | `admin@ejemplo.com` |

### 4. Configurar puerto

- Puerto interno: `3000`
- Puerto público: `3000` o el que quieras

### 5. Hacer deploy

1. Configurá el dominio en `Domains`.
2. Hacé clic en `Deploy`.
3. El contenedor corre `prisma migrate deploy` automáticamente al iniciar.

## Notas De Implementación

- La búsqueda mezcla servicios legacy y listings nuevos.
- El polling de chat está en `src/app/chat/chat-view.tsx`.
- Las notificaciones push del navegador dependen del permiso del usuario y no usan service worker.
- El mapa se basa en coordenadas ya persistidas en la base.
