# 🏥 Salud Nova — Backend API

### Sistema de Gestión para Botica / Farmacia

**NestJS · TypeScript · Prisma · PostgreSQL (Supabase)**

---

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Stack Tecnológico](#stack-tecnológico)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de Entorno](#variables-de-entorno)
- [Base de Datos](#base-de-datos)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Módulos del Sistema](#módulos-del-sistema)
- [Referencia de Endpoints](#referencia-de-endpoints)
- [Sistema de Permisos](#sistema-de-permisos)
- [Scripts Disponibles](#scripts-disponibles)

---

## Descripción

API REST que centraliza todos los procesos operativos de una botica: autenticación con control de primer acceso, gestión de usuarios con permisos granulares por módulo, inventario de productos, registro y procesamiento de ventas con cálculo automático de descuentos e IGV, fidelización de clientes por puntos, generación de reportes exportables y auditoría completa de todas las acciones del sistema.

---

## Stack Tecnológico

| Tecnología      | Versión | Uso                        |
| --------------- | ------- | -------------------------- |
| NestJS          | ^10.x   | Framework principal        |
| TypeScript      | ^5.x    | Tipado estático            |
| Prisma ORM      | ^5.x    | Base de datos              |
| PostgreSQL      | —       | Base de datos (Supabase)   |
| Passport JWT    | —       | Autenticación              |
| Bcryptjs        | —       | Hash de contraseñas        |
| Nodemailer      | —       | Envío de correos           |
| PDFKit          | —       | Generación de comprobantes |
| Fast-CSV        | —       | Exportación de reportes    |
| Class-Validator | —       | Validación de DTOs         |

---

## Requisitos Previos

- Node.js >= 18.x
- npm >= 9.x
- Cuenta en [Supabase](https://supabase.com) con proyecto creado
- Cuenta de correo Gmail con App Password habilitado (para notificaciones)

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd salud-nova-backend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores reales

# 4. Generar el cliente de Prisma
npx prisma generate

# 5. Ejecutar migraciones
npx prisma migrate dev

# 6. Poblar datos iniciales
npm run prisma:seed

# 7. Iniciar en desarrollo
npm run start:dev
```

El servidor quedará disponible en `http://localhost:4000/api`

---

## Variables de Entorno

Crear el archivo `.env` en la raíz del proyecto con los siguientes valores:

```env
# ── Servidor ─────────────────────────────────
NODE_ENV=development
PORT=4000

# ── Base de datos Supabase ───────────────────
# Transaction pooler (para el app en ejecución)
DATABASE_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-1-us-west-2.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Session pooler (para migraciones)
DIRECT_URL="postgresql://postgres.[REF]:[PASSWORD]@aws-1-us-west-2.pooler.supabase.com:5432/postgres"

# ── JWT ──────────────────────────────────────
JWT_SECRET=clave_super_secreta_minimo_32_caracteres
JWT_EXPIRES_IN=8h

# ── Bcrypt ───────────────────────────────────
BCRYPT_SALT_ROUNDS=12

# ── Correo (Gmail + App Password) ────────────
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=tucorreo@gmail.com
MAIL_PASS=tu_app_password_de_16_caracteres
MAIL_FROM="BoticaSystem <tucorreo@gmail.com>"

# ── Archivos ─────────────────────────────────
UPLOADS_DIR=./uploads

# ── CORS ─────────────────────────────────────
ALLOWED_ORIGINS=http://localhost:5173
```

### Cómo obtener las URLs de Supabase

1. Entrar a **supabase.com** → tu proyecto
2. Ir a **Settings → Database**
3. Bajar hasta **Connection string**
4. Copiar la URL del **Transaction pooler** (puerto 6543) para `DATABASE_URL`
5. Copiar la URL del **Session pooler** (puerto 5432) para `DIRECT_URL`

### Cómo obtener el App Password de Gmail

1. Ir a **myaccount.google.com**
2. Seguridad → Verificación en dos pasos (debe estar activa)
3. Buscar **Contraseñas de aplicaciones**
4. Generar una para "Correo" → copiar los 16 caracteres

---

## Base de Datos

### Modelos principales

| Modelo           | Descripción                                      |
| ---------------- | ------------------------------------------------ |
| `User`           | Empleados del sistema con rol y estado           |
| `UserPermission` | Permisos granulares por módulo para cada usuario |
| `Product`        | Catálogo completo de productos/medicamentos      |
| `Client`         | Clientes registrados con sistema de puntos       |
| `Sale`           | Registro de cada venta con número correlativo    |
| `SaleItem`       | Líneas de detalle de cada venta                  |
| `AuditLog`       | Historial de todas las acciones del sistema      |
| `Settings`       | Configuración global en formato clave-valor      |
| `DiscountRule`   | Reglas de descuento configurables                |

### Comandos de base de datos

```bash
# Crear nueva migración
npx prisma migrate dev --name nombre_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Abrir Prisma Studio (GUI de base de datos)
npm run prisma:studio

# Resetear base de datos (CUIDADO: borra todos los datos)
npm run prisma:reset

# Ejecutar seed (datos iniciales)
npm run prisma:seed
```

### Datos del seed inicial

El seed crea automáticamente:

**Usuario administrador:**

- Email: `admin@botica.com`
- Contraseña: `Admin123`
- Rol: ADMIN
- `mustChangePassword`: false

**Configuración inicial:**
| Clave | Valor | Descripción |
|-------|-------|-------------|
| `botica_name` | Botica San Juan | Nombre que aparece en comprobantes |
| `ruc` | 10000000000 | RUC de la botica |
| `address` | Av. Principal 123 | Dirección |
| `igv_rate` | 18 | Porcentaje de IGV |
| `points_per_sol` | 1 | Puntos otorgados por cada sol gastado |
| `points_value` | 0.01 | Valor en soles de cada punto |

---

## Estructura del Proyecto

```
src/
├── modules/                    # Módulos de negocio
│   ├── auth/                   # Autenticación y JWT
│   ├── users/                  # Gestión de usuarios y permisos
│   ├── inventory/              # Inventario de productos
│   ├── sales/                  # Registro de ventas
│   ├── clients/                # Gestión de clientes
│   ├── reports/                # Reportes y exportaciones
│   ├── audit/                  # Auditoría del sistema
│   ├── alerts/                 # Alertas de stock y vencimiento
│   ├── settings/               # Configuración y descuentos
│   ├── dashboard/              # Estadísticas del dashboard
│   └── profile/                # Perfil del usuario autenticado
│
├── shared/                     # Elementos transversales
│   ├── guards/                 # JwtAuthGuard, RolesGuard, PermissionGuard
│   ├── decorators/             # @CurrentUser, @Public, @Roles, @RequirePermission
│   ├── interceptors/           # ResponseTransformInterceptor
│   ├── filters/                # HttpExceptionFilter, PrismaExceptionFilter
│   ├── pipes/                  # ValidationPipe, ParsePaginationPipe
│   ├── middleware/             # LoggerMiddleware
│   ├── dto/                    # PaginationDto
│   └── interfaces/             # Tipos compartidos
│
├── infrastructure/             # Servicios de infraestructura
│   ├── database/               # PrismaService y PrismaModule
│   ├── mail/                   # MailService + templates de correo
│   ├── pdf/                    # PdfService para comprobantes
│   ├── export/                 # ExportService para CSV
│   └── storage/                # StorageService para archivos
│
├── config/                     # Configuraciones por dominio
├── constants/                  # Constantes del sistema
├── utils/                      # Utilidades puras
├── prisma/                     # Schema y migraciones
├── app.module.ts
└── main.ts
```

---

## Módulos del Sistema

### Auth

Gestiona el acceso al sistema. Login con JWT, cambio obligatorio de contraseña en primer acceso y obtención del usuario activo.

El flujo de primer acceso es: el administrador crea el usuario → el sistema asigna como contraseña el DNI del empleado → el empleado hace login → el sistema detecta `mustChangePassword: true` → obliga el cambio de contraseña → emite nuevo JWT con `mustChangePassword: false`.

### Users

Administración completa de cuentas de empleados. Solo el administrador puede acceder. Permite crear, editar, desactivar usuarios, gestionar sus permisos por módulo y restablecer contraseñas al DNI.

Al crear un usuario el sistema automáticamente hashea el DNI como contraseña temporal, asigna los permisos por defecto (dashboard, ventas, clientes, reportes) y envía un correo de bienvenida con las credenciales.

### Inventory

Catálogo completo de productos/medicamentos con todos sus campos técnicos y comerciales. Controla el stock automáticamente y expone una lista de alertas de productos con stock bajo o próximos a vencer.

### Sales

Módulo más crítico. Registra ventas en una transacción atómica que garantiza: descuento correcto del stock, acumulación de puntos del cliente, aplicación automática de reglas de descuento e IGV, y generación del comprobante en PDF.

### Clients

Los clientes no se crean manualmente, se originan automáticamente cuando un cliente proporciona su DNI durante una venta. La sección permite consultar el historial de compras y el saldo de puntos.

### Reports

Agrega datos de ventas, productos más vendidos, ranking de clientes y estado del inventario. Soporta filtros por período y exportación en CSV.

### Alerts

Consolida alertas de stock bajo, stock crítico y productos próximos a vencer o vencidos. Cada alerta tiene un tipo y severidad para facilitar la priorización visual.

### Settings

Configuración general del sistema (nombre de la botica, RUC, IGV) y gestión de reglas de descuento configurables por tipo: porcentaje, monto fijo, por producto, categoría, cantidad mínima o monto mínimo.

### Dashboard

Estadísticas del día: ventas totales, ingresos, ticket promedio, conteo de alertas y datos del gráfico de ingresos de los últimos 7 días.

### Audit

Registro de todas las acciones sensibles del sistema. Solo visible para administradores. Cada log incluye el usuario que actuó, el módulo, la acción y los snapshots antes/después del cambio.

### Profile

Permite a cada usuario autenticado consultar y actualizar sus propios datos y cambiar su contraseña voluntariamente.

---

## Referencia de Endpoints

### Base URL

```
http://localhost:4000/api
```

### Autenticación

Todos los endpoints (excepto login) requieren el header:

```
Authorization: Bearer <token>
```

---

### AUTH

| Método | Ruta                    | Auth | Descripción                |
| ------ | ----------------------- | ---- | -------------------------- |
| POST   | `/auth/login`           | ❌   | Iniciar sesión             |
| POST   | `/auth/change-password` | ✅   | Cambiar contraseña         |
| GET    | `/auth/me`              | ✅   | Usuario autenticado actual |

---

### USUARIOS

| Método | Ruta                        | Rol   | Descripción                |
| ------ | --------------------------- | ----- | -------------------------- |
| GET    | `/users`                    | ADMIN | Listar usuarios paginados  |
| GET    | `/users/:id`                | ADMIN | Detalle de usuario         |
| POST   | `/users`                    | ADMIN | Crear usuario              |
| PUT    | `/users/:id`                | ADMIN | Editar usuario             |
| DELETE | `/users/:id`                | ADMIN | Desactivar usuario         |
| PATCH  | `/users/:id/toggle-active`  | ADMIN | Activar/desactivar         |
| PUT    | `/users/:id/permissions`    | ADMIN | Actualizar permisos        |
| POST   | `/users/:id/reset-password` | ADMIN | Resetear contraseña al DNI |

---

### INVENTARIO

| Método | Ruta                      | Permiso          | Descripción                    |
| ------ | ------------------------- | ---------------- | ------------------------------ |
| GET    | `/products`               | inventory        | Listar productos con filtros   |
| GET    | `/products/alerts`        | autenticado      | Alertas de stock y vencimiento |
| GET    | `/products/barcode/:code` | autenticado      | Buscar por código de barras    |
| GET    | `/products/:id`           | inventory        | Detalle de producto            |
| POST   | `/products`               | inventory.create | Crear producto                 |
| PUT    | `/products/:id`           | inventory.edit   | Actualizar producto            |
| DELETE | `/products/:id`           | inventory.delete | Desactivar producto            |

**Filtros disponibles para GET `/products`:**

```
?search=paracetamol
?category=Analgésicos
?pharmaceuticalForm=Tableta
?laboratory=Bayer
?stockStatus=critical|low|medium|normal
?expiryStatus=expired|very_soon|soon|ok
?sortBy=commercialName|salePrice|currentStock
?page=1&limit=20
```

---

### VENTAS

| Método | Ruta                   | Permiso      | Descripción               |
| ------ | ---------------------- | ------------ | ------------------------- |
| GET    | `/sales`               | sales        | Historial de ventas       |
| GET    | `/sales/summary/today` | sales        | Resumen del día           |
| GET    | `/sales/:id`           | sales        | Detalle de venta          |
| GET    | `/sales/:id/receipt`   | sales        | Descargar comprobante PDF |
| POST   | `/sales`               | sales.create | Registrar nueva venta     |

**Filtros para GET `/sales`:**

```
?startDate=2026-01-01
?endDate=2026-12-31
?userId=uuid
?clientId=uuid
?page=1&limit=20
```

---

### CLIENTES

| Método | Ruta                           | Permiso      | Descripción          |
| ------ | ------------------------------ | ------------ | -------------------- |
| GET    | `/clients`                     | clients      | Listar clientes      |
| GET    | `/clients/search?dni=12345678` | autenticado  | Buscar por DNI       |
| GET    | `/clients/:id`                 | clients      | Perfil del cliente   |
| GET    | `/clients/:id/history`         | clients      | Historial de compras |
| GET    | `/clients/:id/points`          | clients      | Resumen de puntos    |
| PUT    | `/clients/:id`                 | clients.edit | Actualizar datos     |

---

### REPORTES

| Método | Ruta                    | Permiso | Descripción            |
| ------ | ----------------------- | ------- | ---------------------- |
| GET    | `/reports/sales`        | reports | Reporte de ventas      |
| GET    | `/reports/top-products` | reports | Productos más vendidos |
| GET    | `/reports/inventory`    | reports | Estado del inventario  |
| GET    | `/reports/clients`      | reports | Ranking de clientes    |
| GET    | `/reports/points`       | reports | Resumen de puntos      |
| GET    | `/reports/export/csv`   | reports | Exportar en CSV        |

**Filtros para reportes:**

```
?period=today|week|month|quarter|custom
?startDate=2026-01-01   (solo con period=custom)
?endDate=2026-12-31     (solo con period=custom)
?userId=uuid            (solo para sales)
```

---

### AUDITORÍA

| Método | Ruta                  | Rol   | Descripción                |
| ------ | --------------------- | ----- | -------------------------- |
| GET    | `/audit`              | ADMIN | Todos los logs con filtros |
| GET    | `/audit/:id`          | ADMIN | Detalle de log             |
| GET    | `/audit/user/:userId` | ADMIN | Logs de un usuario         |

**Filtros para GET `/audit`:**

```
?userId=uuid
?module=inventory|sales|users|settings|auth
?action=create|update|delete|login|password_reset
?startDate=2026-01-01
?endDate=2026-12-31
?page=1&limit=50
```

---

### ALERTAS

| Método | Ruta             | Auth | Descripción                 |
| ------ | ---------------- | ---- | --------------------------- |
| GET    | `/alerts`        | ✅   | Todas las alertas activas   |
| GET    | `/alerts/stock`  | ✅   | Solo alertas de stock       |
| GET    | `/alerts/expiry` | ✅   | Solo alertas de vencimiento |
| GET    | `/alerts/count`  | ✅   | Conteo de alertas           |

---

### CONFIGURACIÓN

| Método | Ruta                      | Rol   | Descripción                   |
| ------ | ------------------------- | ----- | ----------------------------- |
| GET    | `/settings`               | ADMIN | Obtener configuración general |
| PUT    | `/settings`               | ADMIN | Actualizar configuración      |
| GET    | `/settings/discounts`     | ADMIN | Listar reglas de descuento    |
| POST   | `/settings/discounts`     | ADMIN | Crear regla                   |
| PUT    | `/settings/discounts/:id` | ADMIN | Editar regla                  |
| DELETE | `/settings/discounts/:id` | ADMIN | Eliminar regla                |

---

### DASHBOARD

| Método | Ruta               | Auth | Descripción             |
| ------ | ------------------ | ---- | ----------------------- |
| GET    | `/dashboard/stats` | ✅   | Estadísticas del día    |
| GET    | `/dashboard/chart` | ✅   | Ingresos últimos 7 días |

---

### PERFIL

| Método | Ruta                       | Auth | Descripción                        |
| ------ | -------------------------- | ---- | ---------------------------------- |
| GET    | `/profile`                 | ✅   | Perfil propio                      |
| PUT    | `/profile`                 | ✅   | Actualizar perfil                  |
| POST   | `/profile/change-password` | ✅   | Cambiar contraseña voluntariamente |

---

## Sistema de Permisos

### Roles

- **ADMIN**: acceso total a todos los módulos sin restricciones
- **USER**: acceso solo a los módulos habilitados por el administrador

### Permisos por defecto al crear un usuario

```json
[
  {
    "module": "dashboard",
    "canAccess": true,
    "canCreate": false,
    "canEdit": false,
    "canDelete": false
  },
  {
    "module": "sales",
    "canAccess": true,
    "canCreate": true,
    "canEdit": false,
    "canDelete": false
  },
  {
    "module": "clients",
    "canAccess": true,
    "canCreate": false,
    "canEdit": false,
    "canDelete": false
  },
  {
    "module": "reports",
    "canAccess": true,
    "canCreate": false,
    "canEdit": false,
    "canDelete": false
  }
]
```

### Módulos con permisos adicionales

Los módulos `inventory`, `audit`, `users` y `settings` están bloqueados por defecto. El administrador los habilita mediante `PUT /users/:id/permissions`.

### Formato de respuesta estándar

**Éxito:**

```json
{
  "success": true,
  "data": { ... }
}
```

**Éxito paginado:**

```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

**Error:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Datos inválidos",
  "errors": ["El correo es requerido"],
  "timestamp": "2026-05-02T10:00:00.000Z"
}
```

---

## Scripts Disponibles

```bash
npm run start:dev       # Servidor en modo desarrollo con hot-reload
npm run start:prod      # Servidor en modo producción
npm run build           # Compilar TypeScript

npx prisma migrate dev  # Crear y aplicar nueva migración
npx prisma generate     # Regenerar cliente de Prisma
npm run prisma:studio   # Abrir GUI de base de datos
npm run prisma:seed     # Ejecutar seed de datos iniciales
npm run prisma:reset    # Resetear base de datos (ELIMINA TODO)
```

---

_Salud Nova Backend · NestJS + TypeScript + Prisma + Supabase_
