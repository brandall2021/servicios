# Servicios - Plataforma de Publicación y Evaluación de Servicios

Plataforma digital donde personas o empresas pueden ofrecer sus servicios, recibir valoraciones de clientes, mostrar evidencias del trabajo realizado y construir una reputación basada en experiencias reales.

## Stack

- **Framework:** Next.js 16 (App Router, Standalone output)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS v4
- **Base de datos:** PostgreSQL + Prisma ORM
- **Autenticación:** NextAuth v5 (Credentials, Google OAuth)
- **UI:** Componentes personalizados (Lucide icons)

## Funcionalidades

- Registro con roles: Cliente, Proveedor, Administrador (incluye Google OAuth)
- Perfil de proveedor con descripción, experiencia, certificaciones y zona de trabajo
- Publicación de servicios con categorías, precio, ubicación y coordenadas GPS
- Búsqueda avanzada con filtros por categoría, ubicación, texto y cercanía GPS
- Búsqueda "Cerca de mí" con geolocalización y radio ajustable (10-200km)
- Sistema de calificaciones 1-5 estrellas con comentarios, fotos y reCAPTCHA
- Chat interno cliente ↔ proveedor
- Sistema de presupuestos: solicitud, cotización y seguimiento
- Panel administrativo con dashboard y gestión de usuarios
- Migraciones automáticas al deploy

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
| juan@example.com | 123456 | Proveedor |
| maria@example.com | 123456 | Proveedor |
| carlos@example.com | 123456 | Proveedor |
| cliente@example.com | 123456 | Cliente |

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

En la sección **"Environment"** de Dokploy, agregá estas variables:

| Variable | Descripción | Ejemplo |
|---|---|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL | `postgresql://usuario:password@host:5432/servicios?schema=public` |
| `NEXTAUTH_URL` | URL pública del sitio | `https://tudominio.com` |
| `NEXTAUTH_SECRET` | Secreto para NextAuth (generar con `openssl rand -base64 32`) | `tu-secreto-aqui` |
| `GOOGLE_CLIENT_ID` | (opcional) ID de Google OAuth | `tu-client-id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | (opcional) Secret de Google OAuth | `tu-client-secret` |
| `ADMIN_EMAIL` | Email del administrador | `admin@ejemplo.com` |

### 4. Configurar puerto

En **"Ports"**, configurá:
- **Puerto interno:** `3000` (el EXPOSE del Dockerfile)
- **Puerto público:** `3000` (o el que quieras)

### 5. Configurar dominio

1. En **"Domains"**, agregá el dominio donde querés que responda el sitio
2. Dokploy va a configurar automáticamente el SSL/HTTPS

### 6. Hacer deploy

1. Hacé clic en **"Deploy"**
2. Dokploy va a clonar el repo, construir la imagen Docker y levantar el contenedor
3. Al iniciar, el contenedor corre automáticamente `prisma migrate deploy` para crear las tablas en la base de datos

### Notas importantes

- La base de datos PostgreSQL debe estar accesible desde el servidor donde corre Dokploy
- Si usás la misma base que tus otros proyectos, asegurate de crear la base `servicios` primero:
  ```sql
  CREATE DATABASE servicios;
  ```
- El puerto interno **3000** debe coincidir con el EXPOSE del Dockerfile
- Usá los mismos valores de `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` que ya usan tus otros proyectos

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Layout principal
│   ├── login/                   # Inicio de sesión
│   ├── register/                # Registro
│   ├── buscar/                  # Buscador de servicios
│   ├── perfil/                  # Perfil de usuario
│   ├── proveedores/[id]/        # Perfil público del proveedor
│   ├── servicios/
│   │   ├── nuevo/               # Crear servicio
│   │   └── [id]/                # Detalle del servicio + opiniones
│   ├── chat/                    # Mensajería interna
│   ├── admin/                   # Panel administrativo
│   └── api/                     # API routes
├── components/
│   ├── ui/                      # Componentes base (Button, Input, Card...)
│   ├── layout/                  # Header, Footer
│   └── shared/                  # StarRating, SearchBar, ServiceCard...
├── lib/
│   ├── auth.ts                  # Configuración NextAuth
│   ├── prisma.ts                # Cliente Prisma
│   └── utils.ts                 # Utilidades
└── types/                       # Tipos TypeScript
prisma/
├── schema.prisma                # Modelos de base de datos
└── seed.ts                      # Datos de prueba
```
