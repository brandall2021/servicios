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

- Registro con roles: Cliente, Proveedor, Administrador
- Perfil de proveedor con descripción, experiencia, certificaciones y zona de trabajo
- Publicación de servicios con categorías, precio y ubicación
- Búsqueda avanzada con filtros por categoría, ubicación y texto
- Sistema de calificaciones 1-5 estrellas con comentarios y fotos
- Chat interno cliente ↔ proveedor
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

## Deploy con Docker

```bash
# Construir la imagen
docker build -t servicios:latest .

# Ejecutar
docker run -d -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/servicios?schema=public" \
  -e NEXTAUTH_URL="https://tudominio.com" \
  -e NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
  --name servicios \
  servicios:latest
```

### Deploy en Dokploy / VPS

Configurar estas variables de entorno en tu plataforma:

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `NEXTAUTH_URL` | URL pública del sitio (ej: `https://servicios.tudominio.com`) |
| `NEXTAUTH_SECRET` | Secreto para NextAuth |
| `GOOGLE_CLIENT_ID` | (opcional) Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | (opcional) Google OAuth Client Secret |

El contenedor ejecuta automáticamente `prisma migrate deploy` al iniciar para mantener la base de datos actualizada.

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
