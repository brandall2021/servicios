# Servicios — Plataforma de Servicios Profesionales

Plataforma digital que conecta clientes con profesionales verificados en Argentina. Permite publicar servicios, solicitar presupuestos, chatear, calificar y gestionar todo desde un panel administrativo.

## Stack

| Capa | Tecnología |
|------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Lenguaje** | TypeScript |
| **Estilos** | Tailwind CSS v4 + Modo oscuro |
| **Base de datos** | PostgreSQL + Prisma ORM |
| **Autenticación** | NextAuth v5 (Credentials, Google OAuth) |
| **UI** | Componentes personalizados + Lucide icons |

## Funcionalidades

### Para clientes
- Buscar servicios por categoría, texto, ubicación y cercanía GPS ("Cerca de mí")
- Ver perfiles de proveedores con reputación, fotos y opiniones
- Solicitar presupuestos personalizados con descripción, materiales y **archivos adjuntos** (imágenes, PDF, Word, Excel)
- Chatear en tiempo real con el proveedor
- Calificar servicios con 1-5 estrellas, comentarios y fotos
- Aceptar, rechazar o solicitar revisión de cotizaciones

### Para proveedores
- Perfil público con descripción, experiencia, certificaciones y zona de trabajo
- Publicar servicios con fotos, precio, ubicación y disponibilidad
- Recibir y gestionar solicitudes de presupuesto
- Cotizar con montos, desglose de costos y fechas de validez
- Chat interno con clientes
- Ver y responder opiniones

### Para administradores
- **Dashboard** con estadísticas de uso: usuarios, servicios, opiniones, denuncias, presupuestos
- **Gráfico de registros** por mes (últimos 6 meses)
- **Servicios por categoría** con conteo
- **Gestión de usuarios**: crear, editar, cambiar rol (Cliente/Proveedor/Admin), verificar, bloquear con motivo, eliminar
- **Gestión de servicios**: activar/desactivar servicios publicados
- **Gestión de opiniones**: editar puntuación y comentario, eliminar opiniones
- **Gestión de denuncias**: revisar y resolver reportes de usuarios
- **Gestión de presupuestos**: visualizar todas las solicitudes con sus cotizaciones
- **Panel de categorías**: distribución de servicios por categoría

### Generales
- **Modo oscuro** con persistencia en localStorage y detección de preferencia del sistema
- Autenticación con email/contraseña y Google OAuth
- Diseño responsive (mobile-first)
- Protección reCAPTCHA en formularios

## Requisitos

- Node.js 20+
- PostgreSQL
- (Opcional) Google Cloud Console para OAuth

## Desarrollo local

```bash
# 1. Clonar
git clone https://github.com/brandall2021/servicios.git
cd servicios

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

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

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servir build de producción |
| `npm run lint` | ESLint |
| `npm run seed` | Poblar base de datos |

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Layout principal con ThemeProvider
│   ├── globals.css                 # Estilos globales + modo oscuro
│   ├── login/                      # Inicio de sesión
│   ├── register/                   # Registro
│   ├── buscar/                     # Buscador de servicios
│   ├── perfil/                     # Perfil de usuario
│   ├── proveedores/[id]/           # Perfil público del proveedor
│   ├── servicios/
│   │   ├── nuevo/                  # Crear servicio
│   │   └── [id]/                   # Detalle del servicio + opiniones
│   ├── chat/                       # Mensajería interna
│   ├── presupuestos/               # Solicitudes de presupuesto
│   │   ├── solicitar/              # Formulario con carga de archivos
│   │   └── [id]/                   # Detalle con cotizaciones
│   ├── admin/                      # Panel administrativo
│   │   ├── page.tsx                # Dashboard con estadísticas y gráficos
│   │   ├── dashboard-chart.tsx     # Gráfico de registros mensuales
│   │   ├── usuarios/               # CRUD de usuarios + roles
│   │   ├── servicios/              # Activar/desactivar servicios
│   │   ├── opiniones/              # Editar/eliminar opiniones
│   │   ├── denuncias/              # Gestionar reportes
│   │   ├── presupuestos/           # Ver todas las solicitudes
│   │   └── categorias/             # Distribución por categoría
│   └── api/                        # API routes
├── components/
│   ├── ui/                         # Componentes base (Button, Input, Card, Modal, Select...)
│   ├── layout/                     # Header, Footer
│   └── shared/                     # ThemeProvider, ServiceCard, StarRating...
├── lib/
│   ├── auth.ts                     # Configuración NextAuth
│   ├── prisma.ts                   # Cliente Prisma singleton
│   ├── constants.ts                # Categorías, provincias
│   └── utils.ts                    # cn(), formatDate(), formatPrice()
└── types/                          # Tipos TypeScript (Session, ServicioWithRelations...)
prisma/
├── schema.prisma                   # Modelos: User, Servicio, Foto, Opinion, Report,
│                                   # Chat, Mensaje, BudgetRequest, BudgetQuote
├── seed.ts                         # Datos de prueba
└── migrations/                     # Migraciones automáticas
```

## Modelo de datos

- **User** — Cliente, Proveedor o Admin con perfil completo, verificación y bloqueo
- **Servicio** — Publicación con categoría, precio, ubicación GPS y disponibilidad
- **Foto** — Imágenes asociadas a servicios, opiniones y perfiles
- **Opinion** — Calificación 1-5 estrellas con comentario opcional
- **Report** — Denuncias con motivo y estado (Pendiente/Revisado/Resuelto)
- **Chat / Mensaje** — Mensajería interna entre cliente y proveedor
- **BudgetRequest** — Solicitud de presupuesto con descripción, materiales y archivos
- **BudgetQuote** — Cotización con monto, desglose y versión

## Deploy en Dokploy

### 1. Crear un nuevo proyecto en Dokploy

1. Iniciá sesión en tu panel de Dokploy
2. Hacé clic en **"Nuevo proyecto"** y luego en **"Nuevo servicio"**
3. Elegí **"Docker"** como tipo de servicio

### 2. Conectar el repositorio

1. En **"Source"**, seleccioná **"GitHub"**
2. Conectá tu cuenta de GitHub si no lo está
3. Seleccioná el repositorio `brandall2021/servicios`
4. Elegí la rama `main`
5. Dokploy va a detectar automáticamente el `Dockerfile`

### 3. Configurar variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://usuario:password@host:5432/servicios?schema=public` |
| `NEXTAUTH_URL` | URL pública del sitio | `https://tudominio.com` |
| `NEXTAUTH_SECRET` | Secreto para NextAuth | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | (opcional) ID de Google OAuth | — |
| `GOOGLE_CLIENT_SECRET` | (opcional) Secret de Google OAuth | — |
| `ADMIN_EMAIL` | Email del administrador | `admin@ejemplo.com` |

### 4. Configurar puerto

- **Puerto interno:** `3000`
- **Puerto público:** `3000` (o el que quieras)

### 5. Hacer deploy

1. Configurá el dominio en **"Domains"** (SSL automático)
2. Hacé clic en **"Deploy"**
3. El contenedor corre `prisma migrate deploy` automáticamente al iniciar
