# DOCUMENTACIÓN TÉCNICA — BACKEND

## Sistema de Gestión para Botica / Farmacia

### PRD + SDD Unificado · NestJS + TypeScript

### Versión 1.0

---

## TABLA DE CONTENIDOS

1. Resumen Ejecutivo del Backend
2. Objetivos y Alcance del Backend
3. Stack Tecnológico y Justificación
4. Arquitectura General
5. Estructura de Carpetas Completa con Archivos
6. Base de Datos y Modelos (Prisma Schema)
7. Módulo de Autenticación
8. Módulo de Usuarios y Permisos
9. Módulo de Inventario
10. Módulo de Ventas
11. Módulo de Clientes
12. Módulo de Reportes
13. Módulo de Auditoría
14. Módulo de Alertas
15. Módulo de Configuración
16. Módulo de Perfil
17. Guards y Decoradores
18. Interceptores y Pipes
19. Manejo de Errores Global
20. Referencia Completa de Endpoints
21. Seguridad
22. Variables de Entorno

---

## 1. RESUMEN EJECUTIVO DEL BACKEND

El backend del sistema de gestión de botica es una API REST construida con NestJS y TypeScript sobre una base de datos PostgreSQL gestionada mediante Prisma ORM. Expone todos los servicios de negocio que el frontend consume: autenticación con control de primer acceso, gestión de usuarios con permisos granulares por módulo, administración completa del inventario de productos, registro y procesamiento de ventas con cálculo automático de descuentos e impuestos, fidelización de clientes por puntos, generación de reportes exportables en PDF y CSV, y un sistema de auditoría que registra cada acción sensible del sistema.

NestJS fue elegido como framework por su arquitectura modular fuertemente inspirada en Angular, su integración nativa con TypeScript, su sistema de inyección de dependencias que facilita la escritura de código testeable, y su ecosistema de decoradores que hace el código más declarativo y expresivo. La arquitectura modular de NestJS encaja de forma natural con la organización por módulos que el sistema requiere.

---

## 2. OBJETIVOS Y ALCANCE DEL BACKEND

### Objetivos Funcionales

El backend debe gestionar la autenticación de usuarios con JWT, incluyendo el flujo de primer acceso con contraseña temporal, el cambio obligatorio de contraseña, las notificaciones por correo electrónico para cada evento relevante de seguridad y la recuperación de contraseña a través del administrador.

El backend debe implementar un sistema de permisos granular donde cada usuario tiene una lista de módulos habilitados con las operaciones permitidas en cada uno. El administrador tiene acceso total implícito. Los usuarios normales solo acceden a lo que se les haya otorgado explícitamente.

El backend debe gestionar el inventario completo de productos con todos sus campos técnicos y comerciales, controlar el stock en tiempo real descontando automáticamente las unidades vendidas, detectar productos con stock bajo o por vencer y exponerlos como alertas.

El backend debe registrar cada venta en una transacción atómica que garantice la consistencia entre el registro de la venta, el descuento del stock y la actualización de los puntos del cliente. Debe generar el comprobante en PDF de forma automática tras cada venta.

El backend debe registrar automáticamente en el log de auditoría cada operación que modifica datos sensibles del sistema.

### Alcance del Proyecto

El backend cubre autenticación, usuarios, inventario, ventas, clientes, reportes, auditoría, alertas, configuración del sistema y perfil de usuario. No cubre integración con SUNAT para facturación electrónica, ni integración con sistemas de POS físicos en esta versión.

---

## 3. STACK TECNOLÓGICO Y JUSTIFICACIÓN

### NestJS

Framework para aplicaciones Node.js del lado del servidor. Provee una arquitectura modular con módulos, controladores, servicios y providers. Su sistema de inyección de dependencias permite declarar las dependencias de cada clase sin instanciarlas manualmente, lo que facilita el testing y la escalabilidad. Los decoradores de NestJS hacen el código más legible: `@Controller`, `@Get`, `@Post`, `@UseGuards`, `@Body`, `@Param` son autoexplicativos.

### TypeScript

Tipado estático en toda la base de código del backend. Se define un tipo para cada modelo de datos, para cada DTO de entrada y para cada respuesta esperada. Esto reduce errores en producción y hace el código mantenible en el tiempo.

### Prisma ORM

Prisma es el ORM que gestiona la conexión con PostgreSQL, define el schema de la base de datos como única fuente de verdad, genera el cliente tipado automáticamente y maneja las migraciones. El schema de Prisma define todos los modelos: usuarios, permisos, productos, ventas, clientes, auditoría, configuración y reglas de descuento.

### PostgreSQL

Base de datos relacional. Se eligió por su robustez para datos transaccionales como ventas con múltiples items, su soporte para JSON en el campo de detalles de auditoría, y su compatibilidad con Prisma.

### JWT con Passport

NestJS tiene integración nativa con Passport para autenticación. Se usa la estrategia `passport-jwt` para validar los tokens en cada request. El módulo `@nestjs/jwt` genera y verifica los tokens. El payload del JWT contiene el ID del usuario, su rol y la lista de permisos para evitar consultas adicionales a la base de datos en cada request.

### Bcrypt

Para el hash de contraseñas. Se usa un salt de doce rondas que provee una seguridad adecuada sin un impacto de rendimiento perceptible.

### Nodemailer

Para el envío de correos electrónicos transaccionales. Se usa en el flujo de creación de usuario para enviar las credenciales iniciales, en el cambio de contraseña para confirmar la operación, y en el restablecimiento por parte del administrador para notificar al empleado.

### Class-Validator y Class-Transformer

NestJS usa estas librerías para la validación de los DTOs. Los decoradores de class-validator como `@IsEmail`, `@IsString`, `@IsNotEmpty`, `@MinLength` se aplican directamente en las propiedades del DTO. El ValidationPipe global aplica la validación automáticamente en cada endpoint antes de que el controlador reciba los datos.

### PDFKit

Para la generación de comprobantes de venta y reportes exportables en PDF. Se usa de forma programática generando el documento con los datos de la venta y guardando el archivo en el servidor.

### Fast-CSV

Para la generación de archivos CSV en las exportaciones de reportes. Permite escribir un stream de datos en formato CSV de forma eficiente.

### Multer

Para el manejo de carga de archivos. Se usa principalmente para la subida de imágenes de productos.

### Helmet

Para la configuración de headers HTTP de seguridad. Deshabilita headers que revelan información del servidor y activa headers de protección como Content-Security-Policy y X-Frame-Options.

### Throttler

El módulo `@nestjs/throttler` provee rate limiting por IP. Se aplica de forma global y con configuraciones más estrictas en los endpoints de autenticación para prevenir ataques de fuerza bruta.

### Date-fns

Para el manejo y formato de fechas en el backend. Se usa en los cálculos de alertas de vencimiento, en los filtros de reportes por período y en el formato de fechas en los PDFs generados.

---

## 4. ARQUITECTURA GENERAL

### Patrón Modular de NestJS

Cada módulo del sistema de negocio es un módulo NestJS con su propio conjunto de controladores, servicios y providers. Los módulos se registran en el AppModule principal que actúa como raíz de la aplicación. Cada módulo declara qué servicios exporta para que otros módulos puedan consumirlos, lo que crea un grafo claro de dependencias.

### Separación de Responsabilidades en Capas

La arquitectura sigue una separación estricta de responsabilidades entre capas. Los controladores son responsables únicamente de recibir el request, extraer los datos necesarios, llamar al servicio correspondiente y devolver la respuesta. No contienen lógica de negocio.

Los servicios son responsables de toda la lógica de negocio: validaciones de negocio, cálculos, orquestación de operaciones, llamadas a Prisma y llamadas a otros servicios. Son el núcleo de la aplicación.

Los DTOs son los objetos de transferencia de datos que definen la estructura esperada de cada request. Llevan los decoradores de validación de class-validator.

Los guards son responsables de la autenticación y autorización. El JwtAuthGuard verifica el token. El PermissionGuard verifica los permisos del módulo.

Los interceptores transforman las respuestas salientes para estandarizar el formato de todos los responses de la API.

Los pipes transforman y validan los datos de entrada antes de que lleguen al controlador.

### Flujo de una Petición

Todo request HTTP entra por el middleware de Helmet y el middleware de logging. Pasa por el ThrottleGuard que verifica el rate limiting. Llega al router de NestJS que lo dirige al controlador correspondiente. Antes de ejecutar el método del controlador, NestJS aplica en orden los guards registrados: primero el JwtAuthGuard que verifica el token y adjunta el usuario al request, luego el PermissionGuard que verifica el permiso específico del módulo. Si pasan los guards, el ValidationPipe valida el body contra el DTO. El controlador llama al servicio. El servicio ejecuta la lógica y llama a Prisma. La respuesta pasa por el interceptor de transformación que la envuelve en el formato estándar. El ExceptionFilter global captura cualquier excepción no manejada y devuelve un error formateado.

---

## 5. ESTRUCTURA DE CARPETAS COMPLETA CON ARCHIVOS

```
src/
│
├── modules/
│   │
│   ├── auth/
│   │   ├── controllers/
│   │   │   └── auth.controller.ts
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   ├── guards/
│   │   │   └── jwt-auth.guard.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── change-password.dto.ts
│   │   ├── interfaces/
│   │   │   ├── jwt-payload.interface.ts
│   │   │   └── auth-response.interface.ts
│   │   └── auth.module.ts
│   │
│   ├── users/
│   │   ├── controllers/
│   │   │   └── users.controller.ts
│   │   ├── services/
│   │   │   └── users.service.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   └── update-permissions.dto.ts
│   │   ├── interfaces/
│   │   │   ├── user.interface.ts
│   │   │   └── permission.interface.ts
│   │   └── users.module.ts
│   │
│   ├── inventory/
│   │   ├── controllers/
│   │   │   └── inventory.controller.ts
│   │   ├── services/
│   │   │   └── inventory.service.ts
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts
│   │   │   ├── update-product.dto.ts
│   │   │   └── product-filters.dto.ts
│   │   ├── interfaces/
│   │   │   ├── product.interface.ts
│   │   │   └── product-filters.interface.ts
│   │   └── inventory.module.ts
│   │
│   ├── sales/
│   │   ├── controllers/
│   │   │   └── sales.controller.ts
│   │   ├── services/
│   │   │   ├── sales.service.ts
│   │   │   └── cart-calculator.service.ts
│   │   ├── dto/
│   │   │   ├── create-sale.dto.ts
│   │   │   ├── create-sale-item.dto.ts
│   │   │   └── sale-filters.dto.ts
│   │   ├── interfaces/
│   │   │   ├── sale.interface.ts
│   │   │   ├── cart-item.interface.ts
│   │   │   └── sale-calculation.interface.ts
│   │   └── sales.module.ts
│   │
│   ├── clients/
│   │   ├── controllers/
│   │   │   └── clients.controller.ts
│   │   ├── services/
│   │   │   └── clients.service.ts
│   │   ├── dto/
│   │   │   ├── update-client.dto.ts
│   │   │   └── client-filters.dto.ts
│   │   ├── interfaces/
│   │   │   ├── client.interface.ts
│   │   │   └── client-history.interface.ts
│   │   └── clients.module.ts
│   │
│   ├── reports/
│   │   ├── controllers/
│   │   │   └── reports.controller.ts
│   │   ├── services/
│   │   │   ├── reports.service.ts
│   │   │   └── report-aggregator.service.ts
│   │   ├── dto/
│   │   │   └── report-filters.dto.ts
│   │   ├── interfaces/
│   │   │   ├── report-data.interface.ts
│   │   │   └── chart-data.interface.ts
│   │   └── reports.module.ts
│   │
│   ├── audit/
│   │   ├── controllers/
│   │   │   └── audit.controller.ts
│   │   ├── services/
│   │   │   └── audit.service.ts
│   │   ├── dto/
│   │   │   └── audit-filters.dto.ts
│   │   ├── interfaces/
│   │   │   ├── audit-entry.interface.ts
│   │   │   └── create-audit-entry.interface.ts
│   │   └── audit.module.ts
│   │
│   ├── alerts/
│   │   ├── controllers/
│   │   │   └── alerts.controller.ts
│   │   ├── services/
│   │   │   └── alerts.service.ts
│   │   ├── interfaces/
│   │   │   └── alert.interface.ts
│   │   └── alerts.module.ts
│   │
│   ├── settings/
│   │   ├── controllers/
│   │   │   └── settings.controller.ts
│   │   ├── services/
│   │   │   └── settings.service.ts
│   │   ├── dto/
│   │   │   ├── update-settings.dto.ts
│   │   │   ├── create-discount-rule.dto.ts
│   │   │   └── update-discount-rule.dto.ts
│   │   ├── interfaces/
│   │   │   ├── settings.interface.ts
│   │   │   └── discount-rule.interface.ts
│   │   └── settings.module.ts
│   │
│   ├── profile/
│   │   ├── controllers/
│   │   │   └── profile.controller.ts
│   │   ├── services/
│   │   │   └── profile.service.ts
│   │   ├── dto/
│   │   │   ├── update-profile.dto.ts
│   │   │   └── change-password-profile.dto.ts
│   │   └── profile.module.ts
│   │
│   └── dashboard/
│       ├── controllers/
│       │   └── dashboard.controller.ts
│       ├── services/
│       │   └── dashboard.service.ts
│       ├── interfaces/
│       │   └── dashboard-stats.interface.ts
│       └── dashboard.module.ts
│
├── shared/
│   │
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── permission.guard.ts
│   │
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   ├── roles.decorator.ts
│   │   ├── require-permission.decorator.ts
│   │   └── public.decorator.ts
│   │
│   ├── interceptors/
│   │   ├── response-transform.interceptor.ts
│   │   └── audit-log.interceptor.ts
│   │
│   ├── filters/
│   │   ├── http-exception.filter.ts
│   │   └── prisma-exception.filter.ts
│   │
│   ├── pipes/
│   │   ├── validation.pipe.ts
│   │   └── parse-pagination.pipe.ts
│   │
│   ├── middleware/
│   │   └── logger.middleware.ts
│   │
│   ├── dto/
│   │   └── pagination.dto.ts
│   │
│   └── interfaces/
│       ├── api-response.interface.ts
│       ├── paginated-response.interface.ts
│       └── request-with-user.interface.ts
│
├── infrastructure/
│   │
│   ├── database/
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   │
│   ├── mail/
│   │   ├── mail.service.ts
│   │   ├── mail.module.ts
│   │   └── templates/
│   │       ├── welcome.template.ts
│   │       ├── password-changed.template.ts
│   │       └── password-reset.template.ts
│   │
│   ├── pdf/
│   │   ├── pdf.service.ts
│   │   ├── pdf.module.ts
│   │   └── templates/
│   │       ├── receipt.template.ts
│   │       └── report.template.ts
│   │
│   ├── export/
│   │   ├── export.service.ts
│   │   └── export.module.ts
│   │
│   └── storage/
│       ├── storage.service.ts
│       └── storage.module.ts
│
├── config/
│   ├── app.config.ts
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── mail.config.ts
│   └── throttler.config.ts
│
├── constants/
│   ├── permissions.constants.ts
│   ├── modules.constants.ts
│   ├── stock.constants.ts
│   └── default-permissions.constants.ts
│
├── utils/
│   ├── hash.utils.ts
│   ├── stock.utils.ts
│   ├── expiry.utils.ts
│   ├── discount.utils.ts
│   ├── pagination.utils.ts
│   └── date.utils.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
│
├── app.module.ts
└── main.ts
```

---

## 6. BASE DE DATOS Y MODELOS (PRISMA SCHEMA)

### 6.1 Decisiones de Diseño

La base de datos está modelada siguiendo los principios de normalización. Las contraseñas nunca se almacenan en texto plano, solo su hash bcrypt. Los usuarios y productos no se eliminan físicamente de la base de datos, solo se desactivan con un campo booleano `isActive`, lo que preserva la integridad referencial de ventas históricas y logs de auditoría.

Los permisos son una tabla separada relacionada con el usuario, con un registro por cada módulo del sistema. Esto permite una granularidad máxima y una fácil extensión si se añaden nuevos módulos.

Las ventas usan un número correlativo legible en formato `VTA-000001` que es el que aparece en el comprobante, mientras que el `id` interno es un UUID para evitar enumeración.

Los logs de auditoría guardan snapshots JSON del estado anterior y posterior del registro afectado, lo que permite al administrador ver exactamente qué cambió.

### 6.2 Modelos Principales

**Modelo User:** Almacena todos los datos del empleado. Campos principales son id UUID, firstName, lastName, email único, dni único, phone opcional, position, passwordHash, role que puede ser ADMIN o USER, mustChangePassword booleano que inicia en verdadero, isActive booleano, createdAt, updatedAt y lastLogin. Tiene relaciones con UserPermission, Sale y AuditLog.

**Modelo UserPermission:** Tabla de permisos por módulo. Relacionada con User. Campos: id, userId, module como string con el nombre del módulo, canAccess, canCreate, canEdit y canDelete todos booleanos. La combinación userId más module es única para evitar permisos duplicados.

**Modelo Product:** Catálogo de productos. Campos: id UUID, commercialName, genericName opcional, description opcional, category, pharmaceuticalForm opcional, concentration opcional, presentation opcional, laboratory opcional, purchasePrice decimal, salePrice decimal, currentStock entero, minimumStock entero, expirationDate fecha opcional, lot opcional, sku único, barcode único opcional, physicalLocation opcional, taxApplicable booleano, saleUnit string con valores como caja o unidad, isActive booleano, createdAt y updatedAt. Tiene relación con SaleItem.

**Modelo Client:** Clientes de la botica. Campos: id UUID, dni único, name, phone opcional, email opcional, pointsBalance saldo actual de puntos, pointsAccumulated total histórico acumulado, pointsUsed total histórico usado, createdAt y updatedAt. Tiene relación con Sale.

**Modelo Sale:** Registro de cada venta. Campos: id UUID, saleNumber string único correlativo, userId, clientId opcional, subtotal decimal, discountAmount decimal, taxAmount decimal, total decimal, pointsEarned entero, pointsUsed entero, receiptPath string opcional con la ruta del PDF, notes opcional y createdAt. Tiene relaciones con User, Client y SaleItem.

**Modelo SaleItem:** Items individuales dentro de cada venta. Campos: id UUID, saleId, productId, quantity entero, unitPrice decimal al momento de la venta, discount decimal el descuento de esta línea y subtotal decimal. Tiene relaciones con Sale y Product.

**Modelo AuditLog:** Registro de auditoría. Campos: id UUID, userId de quien realizó la acción, module nombre del módulo afectado, action tipo de acción realizada, entityId id del registro afectado opcional, entityName nombre legible del registro afectado opcional, description texto descriptivo de la acción, before JSON con el estado anterior del registro, after JSON con el estado posterior, ipAddress opcional y createdAt.

**Modelo Settings:** Configuración del sistema en formato clave-valor. Campos: id, key único, value como string serializado, description opcional y updatedAt. Ejemplos de claves son botica_name, ruc, address, igv_rate y points_per_sol.

**Modelo DiscountRule:** Reglas de descuento configurables. Campos: id UUID, name nombre descriptivo, type enum con los valores PERCENTAGE, FIXED_AMOUNT, BY_PRODUCT, BY_CATEGORY, BY_QUANTITY, BY_MINIMUM_AMOUNT y BY_LOYALTY_POINTS, value decimal con el porcentaje o monto, condition JSON serializado con la condición de aplicación, isActive booleano, priority entero para resolver conflictos cuando aplican múltiples reglas, createdAt y updatedAt.

---

## 7. MÓDULO DE AUTENTICACIÓN

### 7.1 Descripción General

El módulo de autenticación es el más crítico del sistema. Gestiona el inicio de sesión, la emisión de JWT, el flujo obligatorio de cambio de contraseña en el primer acceso y la validación de tokens en cada request.

### 7.2 auth.module.ts

Importa PassportModule, JwtModule con la configuración de secreto y expiración desde el archivo de configuración, el PrismaModule y el MailModule. Declara AuthController, AuthService y JwtStrategy. Exporta AuthService para que otros módulos puedan verificar tokens si lo necesitan.

### 7.3 jwt.strategy.ts

Implementa la estrategia de Passport para JWT. Extrae el token del header Authorization en formato Bearer. Verifica la firma con el secreto JWT. Extrae el payload y lo adjunta al objeto request como `req.user`. El payload contiene userId, role, permissions y una marca de tiempo de emisión.

### 7.4 auth.service.ts

**Método login:** Recibe email y password del DTO. Busca al usuario en la base de datos incluyendo sus permisos. Si no existe o está inactivo retorna una excepción de credenciales inválidas. Compara la contraseña proporcionada contra el hash almacenado. Si no coincide retorna la misma excepción de credenciales inválidas, sin distinguir si fue el usuario o la contraseña lo que falló, para no dar información al atacante. Actualiza el campo lastLogin del usuario. Genera el JWT con el payload del usuario. Retorna el token, el objeto usuario sin el hash de contraseña y el flag mustChangePassword.

**Método changePassword:** Recibe el userId del usuario autenticado del request, la contraseña actual y la nueva contraseña. Busca al usuario en la base de datos. Verifica que la contraseña actual sea correcta comparando contra el hash. Si no es correcta retorna excepción. Hashea la nueva contraseña. Actualiza el usuario con el nuevo hash y establece mustChangePassword en falso. Envía un correo de confirmación mediante el MailService. Genera un nuevo JWT con el estado actualizado del usuario. Retorna el nuevo token y el usuario actualizado.

**Método validateToken:** Recibe el payload extraído del JWT por la estrategia. Verifica que el usuario siga activo en la base de datos. Retorna el usuario completo para adjuntarlo al request.

### 7.5 auth.controller.ts

Expone el endpoint POST `/auth/login` sin protección de autenticación, con el decorador Public para que el JwtAuthGuard global lo omita. Aplica el ThrottleGuard de forma individual con un límite más estricto.

Expone el endpoint POST `/auth/change-password` protegido por JWT. Usa el decorador CurrentUser para extraer el usuario del request y lo pasa al servicio junto con los datos del DTO.

Expone el endpoint GET `/auth/me` protegido por JWT que retorna el usuario autenticado actual.

### 7.6 Flujo Completo de Primer Acceso

El administrador crea al empleado mediante POST `/api/users`. El servicio de usuarios genera automáticamente la contraseña como el hash del DNI y establece mustChangePassword en verdadero. El MailService envía al correo del empleado sus credenciales: su correo como usuario y su DNI como contraseña temporal.

El empleado ingresa a la interfaz y hace POST `/api/auth/login` con sus credenciales. El backend verifica las credenciales, retorna el token y el flag mustChangePassword en verdadero. El frontend detecta el flag y redirige obligatoriamente a la pantalla de cambio de contraseña.

El empleado ingresa su DNI como contraseña actual, su nueva contraseña y la confirmación. El frontend valida la fortaleza de la contraseña localmente. Hace POST `/api/auth/change-password`. El backend verifica, actualiza y emite un nuevo token con mustChangePassword en falso. El empleado accede normalmente al sistema.

---

## 8. MÓDULO DE USUARIOS Y PERMISOS

### 8.1 users.module.ts

Importa PrismaModule, MailModule y AuditModule. Declara UsersController y UsersService. Exporta UsersService.

### 8.2 users.service.ts

**Método findAll:** Retorna la lista paginada de usuarios con sus permisos. Aplica filtros opcionales por rol, estado y búsqueda de texto en nombre o correo. Nunca retorna el hash de contraseña.

**Método findOne:** Retorna el perfil completo de un usuario con todos sus permisos. Lanza NotFoundException si no existe.

**Método create:** Recibe el DTO de creación. Verifica que el correo y el DNI no estén ya registrados, lanzando ConflictException si hay duplicados. Hashea el DNI como contraseña inicial. Crea el usuario junto con los permisos por defecto en una transacción: acceso a dashboard, ventas, clientes y reportes. Envía el correo de bienvenida con las credenciales. Registra la acción en auditoría. Retorna el usuario creado sin el hash.

**Método update:** Recibe el id y el DTO de actualización. Verifica existencia del usuario. Si se está cambiando el correo, verifica que el nuevo correo no esté ya en uso por otro usuario. Actualiza los datos. Registra en auditoría. Retorna el usuario actualizado.

**Método deactivate:** Soft delete. Establece isActive en falso. No elimina el registro de la base de datos para preservar la integridad de ventas y logs históricos. Registra en auditoría.

**Método updatePermissions:** Recibe el userId y la nueva lista de permisos por módulo. Aplica un upsert por cada módulo: si ya existe el permiso para ese módulo lo actualiza, si no existe lo crea. Registra en auditoría el cambio detallado. Si el usuario afectado tiene sesiones activas, el nuevo JWT con permisos actualizados solo tendrá efecto en el próximo login.

**Método resetPassword:** Restablece la contraseña del usuario al hash de su DNI y establece mustChangePassword en verdadero. Envía correo de notificación al empleado. Registra en auditoría.

**Método toggleActive:** Alterna el estado activo o inactivo de un usuario. No permite desactivar al último administrador del sistema. Registra en auditoría.

### 8.3 users.controller.ts

Todos los endpoints requieren autenticación JWT y rol de administrador.

Expone GET `/api/users` para listar usuarios con paginación y filtros opcionales como query params.

Expone GET `/api/users/:id` para obtener un usuario por ID.

Expone POST `/api/users` para crear un nuevo usuario. Valida el body con CreateUserDto.

Expone PUT `/api/users/:id` para actualizar datos del usuario. Valida con UpdateUserDto.

Expone DELETE `/api/users/:id` para desactivar un usuario.

Expone PUT `/api/users/:id/permissions` para actualizar los permisos. Valida con UpdatePermissionsDto.

Expone POST `/api/users/:id/reset-password` para restablecer la contraseña.

Expone PATCH `/api/users/:id/toggle-active` para activar o desactivar la cuenta.

### 8.4 DTOs del Módulo

**CreateUserDto** tiene los campos firstName, lastName, email con validación de formato, dni con longitud exacta de ocho caracteres, phone opcional, position y role con valores permitidos ADMIN o USER.

**UpdateUserDto** extiende CreateUserDto haciendo todos los campos opcionales con el helper PartialType de NestJS.

**UpdatePermissionsDto** contiene un array de objetos donde cada objeto tiene module como string y los cuatro booleanos de permiso. Valida que el array no esté vacío y que cada objeto tenga la estructura correcta.

---

## 9. MÓDULO DE INVENTARIO

### 9.1 inventory.module.ts

Importa PrismaModule y AuditModule. Declara InventoryController e InventoryService. Exporta InventoryService para que el módulo de ventas pueda consultarlo al procesar una venta.

### 9.2 inventory.service.ts

**Método findAll:** Recibe los filtros del DTO: página, límite, búsqueda de texto, categoría, forma farmacéutica, laboratorio, estado de stock y estado de vencimiento. Construye la query de Prisma dinámicamente con los filtros aplicados. La búsqueda de texto aplica sobre nombre comercial, nombre genérico y SKU. Añade a cada producto el campo calculado stockStatus y expiryStatus antes de retornar. Retorna los datos paginados.

**Método findOne:** Busca el producto por ID. Añade los campos calculados de estado. Lanza NotFoundException si no existe.

**Método findByBarcode:** Busca el producto por código de barras exacto. Se usa principalmente durante el proceso de venta.

**Método create:** Valida que el SKU no esté duplicado. Si se proporcionó código de barras, valida que tampoco esté duplicado. Crea el producto. Registra en auditoría. Retorna el producto creado.

**Método update:** Valida existencia del producto. Si se está cambiando el SKU, verifica que no colisione con otro producto. Guarda el estado anterior para la auditoría. Actualiza el producto. Registra en auditoría con el snapshot before y after. Retorna el producto actualizado.

**Método softDelete:** Establece isActive en falso. No permite eliminar un producto que tenga ventas registradas sin antes revisar el historial. Registra en auditoría.

**Método getAlerts:** Obtiene todos los productos activos y los filtra para retornar solo los que tienen stock en o por debajo del mínimo, los que tienen fecha de vencimiento en los próximos treinta días y los que ya vencieron. Ordena los resultados por severidad: primero los sin stock, luego los de stock crítico, luego los de stock bajo, luego los vencidos y finalmente los próximos a vencer.

**Método updateStock:** Método interno usado por el módulo de ventas. Decrementa el stock de un producto en la cantidad especificada. Verifica que el stock no quede negativo antes de actualizar.

### 9.3 inventory.controller.ts

GET `/api/products` accesible con permiso de acceso a inventario. Recibe filtros como query params.

GET `/api/products/alerts` accesible para cualquier usuario autenticado, ya que las alertas se muestran en el dashboard.

GET `/api/products/:id` accesible con permiso de acceso a inventario.

GET `/api/products/barcode/:code` accesible con permiso de acceso a ventas o inventario, ya que se usa en ambos contextos.

POST `/api/products` requiere permiso de creación en inventario.

PUT `/api/products/:id` requiere permiso de edición en inventario.

DELETE `/api/products/:id` requiere permiso de eliminación en inventario.

POST `/api/products/:id/image` requiere permiso de edición en inventario. Usa el interceptor de Multer para procesar la imagen.

### 9.4 DTOs del Módulo

**CreateProductDto** define todos los campos del modelo producto con sus validaciones correspondientes. Los campos de precio se validan como números positivos. El stock mínimo debe ser mayor o igual a cero. La categoría, forma farmacéutica y unidad de venta tienen listas de valores permitidos. La fecha de vencimiento se valida como un string de fecha válido.

**ProductFiltersDto** define todos los parámetros de filtro como campos opcionales con sus transformaciones necesarias, por ejemplo convertir el string de página a número.

---

## 10. MÓDULO DE VENTAS

### 10.1 sales.module.ts

Importa PrismaModule, InventoryModule para usar el servicio de stock, ClientsModule para resolver o crear clientes, SettingsModule para obtener las reglas de descuento y la configuración de puntos, AuditModule y el PdfModule. Declara SalesController, SalesService y CartCalculatorService.

### 10.2 cart-calculator.service.ts

Servicio especializado en los cálculos financieros de la venta. Responsabilidades:

**Método calculateItems:** Para cada item del carrito obtiene el precio actual del producto, aplica los descuentos de línea que correspondan según las reglas activas y calcula el subtotal de línea.

**Método applyDiscountRules:** Obtiene las reglas de descuento activas desde el SettingsService. Evalúa cada regla en orden de prioridad contra el carrito actual. Una regla puede aplicarse sobre un producto específico, sobre todos los productos de una categoría, sobre el total de la compra si supera un monto mínimo o sobre la cantidad de un producto específico. Solo aplica la regla de mayor beneficio para evitar conflictos. Retorna el monto total de descuento.

**Método calculateTax:** Suma los subtotales de los items que tienen el flag taxApplicable en verdadero y aplica el porcentaje de IGV configurado en Settings.

**Método calculatePoints:** Obtiene la configuración de puntos por sol gastado desde Settings. Multiplica el total final por la tasa de puntos para obtener los puntos a otorgar.

**Método applyLoyaltyPointsDiscount:** Si el cliente desea usar puntos, calcula el equivalente monetario y lo resta del total. Verifica que el cliente tenga saldo suficiente.

### 10.3 sales.service.ts

**Método createSale:** Este es el método más crítico del sistema. Se ejecuta completamente dentro de una transacción de Prisma para garantizar atomicidad.

Paso uno: valida el stock de cada producto solicitado. Si alguno tiene stock insuficiente lanza una excepción con el nombre del producto afectado.

Paso dos: llama al CartCalculatorService para calcular subtotales, descuentos, impuestos y puntos.

Paso tres: si se proporcionó un DNI de cliente, llama al ClientsService para buscar o crear el cliente.

Paso cuatro: genera el número correlativo de venta consultando el conteo actual.

Paso cinco: crea el registro de Sale con todos sus campos calculados.

Paso seis: crea cada SaleItem asociado a la venta.

Paso siete: decrementa el stock de cada producto vendido llamando al InventoryService.

Paso ocho: actualiza el saldo, el acumulado y el total usado de puntos del cliente si existe.

Paso nueve: confirma la transacción. Si cualquiera de los pasos anteriores falla, Prisma hace rollback automático de toda la operación.

Paso diez: fuera de la transacción, llama al PdfService para generar el comprobante. Actualiza el campo receiptPath de la venta con la ruta del archivo generado.

Paso once: registra en auditoría.

Paso doce: retorna la venta completa con sus items, cliente y ruta del comprobante.

**Método findAll:** Retorna el historial de ventas paginado con filtros por fecha, usuario y cliente. Incluye los items de cada venta y el nombre del cliente.

**Método findOne:** Retorna el detalle completo de una venta incluyendo todos los items con el nombre del producto.

**Método getReceipt:** Verifica que la venta exista y que tenga receiptPath. Si el archivo existe en disco lo retorna como stream. Si no existe intenta regenerarlo.

**Método getDailySummary:** Agrega las ventas del día actual: total en soles, número de transacciones y ticket promedio. Se usa en el widget de estadísticas del dashboard.

### 10.4 sales.controller.ts

POST `/api/sales` protegido con permiso de creación en ventas.

GET `/api/sales` protegido con permiso de acceso a ventas. Soporta filtros como query params.

GET `/api/sales/summary/today` protegido con permiso de acceso a ventas.

GET `/api/sales/:id` protegido con permiso de acceso a ventas.

GET `/api/sales/:id/receipt` protegido con permiso de acceso a ventas. Retorna el archivo PDF como stream con el Content-Type apropiado.

### 10.5 DTOs del Módulo

**CreateSaleDto** contiene clientDni opcional, clientName opcional, items como array de CreateSaleItemDto y pointsToUse opcional.

**CreateSaleItemDto** contiene productId como UUID y quantity como entero positivo mayor a cero.

---

## 11. MÓDULO DE CLIENTES

### 11.1 clients.module.ts

Importa PrismaModule. Declara ClientsController y ClientsService. Exporta ClientsService para que el módulo de ventas pueda resolver o crear clientes durante el proceso de venta.

### 11.2 clients.service.ts

**Método findAll:** Retorna la lista paginada de clientes con sus estadísticas calculadas. Permite búsqueda por DNI, nombre o teléfono. Incluye el total gastado sumado de todas sus ventas, la primera y la última fecha de compra y el saldo de puntos.

**Método findOne:** Retorna el perfil completo del cliente con todas sus estadísticas.

**Método findByDni:** Busca un cliente por DNI exacto. Retorna null si no existe. Se usa en el frontend al buscar un cliente durante la venta.

**Método resolveOrCreate:** Método interno usado por el módulo de ventas. Si el DNI existe retorna el id del cliente. Si no existe crea un nuevo cliente con el DNI y el nombre proporcionados y retorna el nuevo id.

**Método getPurchaseHistory:** Retorna el historial de ventas del cliente paginado con los items de cada venta. Permite conocer todos los productos que ha comprado y en qué fechas.

**Método getPointsSummary:** Retorna un resumen detallado de los puntos del cliente: saldo actual, total acumulado históricamente, total usado históricamente y las últimas transacciones de puntos.

**Método update:** Permite actualizar los datos de contacto del cliente como nombre, teléfono y correo.

### 11.3 clients.controller.ts

GET `/api/clients` con permiso de acceso a clientes.

GET `/api/clients/search` con query param `dni`. Accesible también desde el módulo de ventas para identificar al cliente durante la venta.

GET `/api/clients/:id` con permiso de acceso a clientes.

GET `/api/clients/:id/history` con permiso de acceso a clientes.

GET `/api/clients/:id/points` con permiso de acceso a clientes.

PUT `/api/clients/:id` con permiso de edición en clientes.

---

## 12. MÓDULO DE REPORTES

### 12.1 reports.module.ts

Importa PrismaModule, PdfModule y ExportModule. Declara ReportsController, ReportsService y ReportAggregatorService.

### 12.2 report-aggregator.service.ts

Servicio especializado en las consultas de agregación de Prisma para los distintos tipos de reporte. Encapsula la complejidad de las consultas agrupadas y calculadas.

**Método groupSalesByPeriod:** Recibe las ventas del período y el tipo de agrupación: por día, por semana, por mes o por trimestre. Retorna un array de puntos de datos con la fecha y el total de ventas para cada período, que el frontend usa para los gráficos.

**Método getTopProducts:** Ejecuta una consulta agrupada en SaleItem sumando las cantidades vendidas por producto en el rango de fechas. Retorna los diez más vendidos con su nombre, cantidad total y valor total vendido.

**Método getInventoryStatus:** Cuenta los productos por estado de stock: normal, medio, bajo y crítico. Retorna los conteos para el gráfico de dona del frontend.

**Método getTopClients:** Suma el total gastado por cada cliente en el período. Retorna los diez clientes con mayor gasto con su nombre, DNI, número de compras y total gastado.

**Método getPointsSummary:** Suma los puntos ganados y usados en todas las ventas del período.

### 12.3 reports.service.ts

Orquesta las llamadas al ReportAggregatorService para construir el objeto de respuesta completo de cada tipo de reporte. También llama al PdfService y al ExportService para generar los archivos descargables.

### 12.4 reports.controller.ts

GET `/api/reports/sales` con filtros de fecha y usuario opcional.

GET `/api/reports/top-products` con filtros de fecha.

GET `/api/reports/inventory` sin filtros, muestra el estado actual.

GET `/api/reports/clients` con filtros de fecha.

GET `/api/reports/points` con filtros de fecha.

GET `/api/reports/export/pdf` genera y descarga un PDF del reporte actual.

GET `/api/reports/export/csv` genera y descarga un CSV del reporte actual.

Todos los endpoints requieren permiso de acceso a reportes.

---

## 13. MÓDULO DE AUDITORÍA

### 13.1 audit.module.ts

Importa PrismaModule. Declara AuditController y AuditService. Exporta AuditService ampliamente porque todos los demás módulos lo consumen para registrar sus acciones.

### 13.2 audit.service.ts

**Método log:** Recibe un objeto con userId, module, action, entityId opcional, entityName opcional, description, before opcional como objeto JSON y after opcional como objeto JSON. Crea el registro en la tabla AuditLog de forma asíncrona sin bloquear el flujo principal. Si el registro falla por alguna razón, solo emite un log de error en consola pero no propaga la excepción para no afectar la operación principal que originó el log.

**Método findAll:** Retorna los logs de auditoría paginados con filtros por userId, module, action, entityId y rango de fechas. Incluye el nombre del usuario que realizó la acción.

**Método findOne:** Retorna el detalle completo de un log incluyendo los campos before y after con el snapshot JSON completo.

**Método findByUser:** Retorna todos los logs de un usuario específico, útil para investigar la actividad de un empleado.

### 13.3 audit.controller.ts

Todos los endpoints requieren rol de administrador.

GET `/api/audit` con filtros opcionales como query params.

GET `/api/audit/:id` para el detalle completo.

GET `/api/audit/user/:userId` para la actividad de un usuario.

### 13.4 AuditLogInterceptor

Existe también un interceptor en la carpeta shared que registra automáticamente en auditoría ciertas operaciones de escritura. El interceptor se aplica selectivamente mediante un decorador en los métodos del controlador que lo requieren. Captura la respuesta exitosa del controlador y registra la acción con los datos relevantes extraídos del request y la respuesta.

---

## 14. MÓDULO DE ALERTAS

### 14.1 alerts.module.ts

Importa PrismaModule. Declara AlertsController y AlertsService.

### 14.2 alerts.service.ts

**Método getAll:** Consolida todas las alertas activas del sistema. Obtiene los productos con stock en o por debajo del mínimo y los productos con fecha de vencimiento próxima o ya vencida. Para cada producto en alerta construye un objeto de alerta con el tipo, la severidad, el nombre del producto, los valores actuales y la descripción del problema.

**Método getStockAlerts:** Solo las alertas relacionadas con niveles de stock.

**Método getExpiryAlerts:** Solo las alertas relacionadas con fechas de vencimiento.

**Método getCount:** Retorna únicamente el conteo total de alertas activas. Este endpoint es el más consultado ya que el frontend lo llama periódicamente para actualizar el badge de la campana en el header.

### 14.3 Lógica de Severidad de Alertas

Una alerta de stock tiene severidad crítica cuando el stock es cero. Tiene severidad alta cuando el stock está entre uno y el cincuenta por ciento del stock mínimo. Tiene severidad media cuando el stock está entre el cincuenta y el cien por ciento del stock mínimo.

Una alerta de vencimiento tiene severidad crítica cuando el producto ya venció. Tiene severidad alta cuando vence en menos de siete días. Tiene severidad media cuando vence entre siete y treinta días.

---

## 15. MÓDULO DE CONFIGURACIÓN

### 15.1 settings.module.ts

Importa PrismaModule y AuditModule. Declara SettingsController y SettingsService. Exporta SettingsService para que el módulo de ventas pueda obtener las reglas de descuento y la configuración de puntos durante el cálculo de una venta.

### 15.2 settings.service.ts

**Método getAll:** Retorna todas las configuraciones del sistema como un objeto clave-valor.

**Método getByKey:** Retorna el valor de una clave de configuración específica. Se usa internamente por otros servicios.

**Método updateMany:** Recibe un objeto con múltiples claves a actualizar. Aplica un upsert por cada clave en una transacción. Registra en auditoría. Usado por el formulario de configuración general.

**Método getDiscountRules:** Retorna todas las reglas de descuento activas ordenadas por prioridad descendente.

**Método createDiscountRule:** Crea una nueva regla de descuento. Valida que el nombre sea único. Registra en auditoría.

**Método updateDiscountRule:** Actualiza una regla existente. Registra en auditoría.

**Método deleteDiscountRule:** Elimina una regla de descuento. Al ser configuración y no un dato operacional, sí se permite la eliminación física. Registra en auditoría.

### 15.3 settings.controller.ts

Todos los endpoints requieren rol de administrador.

GET `/api/settings` retorna la configuración general.

PUT `/api/settings` actualiza configuración general.

GET `/api/settings/discounts` lista las reglas de descuento.

POST `/api/settings/discounts` crea una nueva regla.

PUT `/api/settings/discounts/:id` actualiza una regla.

DELETE `/api/settings/discounts/:id` elimina una regla.

---

## 16. MÓDULO DE PERFIL

### 16.1 profile.module.ts

Importa PrismaModule y MailModule. Declara ProfileController y ProfileService.

### 16.2 profile.service.ts

**Método getProfile:** Retorna los datos del usuario autenticado sin el hash de contraseña. Incluye sus permisos actuales.

**Método updateProfile:** Permite al usuario autenticado actualizar su nombre, apellido, teléfono y correo. Si se cambia el correo, verifica que el nuevo correo no esté en uso por otro usuario.

**Método changePassword:** Permite al usuario autenticado cambiar su contraseña de forma voluntaria. Verifica la contraseña actual, hashea la nueva y actualiza. Envía confirmación por correo. No modifica mustChangePassword ya que en este flujo el usuario ya lo tiene en falso.

### 16.3 profile.controller.ts

GET `/api/profile` retorna el perfil del usuario autenticado.

PUT `/api/profile` actualiza datos del perfil.

POST `/api/profile/change-password` cambia la contraseña voluntariamente.

---

## 17. GUARDS Y DECORADORES

### 17.1 JwtAuthGuard

Guard global aplicado a toda la aplicación mediante la configuración del AppModule. Extiende el AuthGuard de Passport para la estrategia JWT. Verifica que cada request tenga un token válido en el header Authorization. El decorador `@Public()` permite marcar endpoints específicos como accesibles sin autenticación, como el endpoint de login.

### 17.2 RolesGuard

Guard que verifica si el usuario autenticado tiene el rol requerido. Se aplica con el decorador `@Roles(Role.ADMIN)` en controladores o métodos específicos. Solo los endpoints exclusivos de administrador usan este guard. Los endpoints con permisos granulares usan el PermissionGuard en cambio.

### 17.3 PermissionGuard

Guard que verifica si el usuario autenticado tiene habilitado el permiso específico para el módulo y tipo de operación del endpoint. Trabaja con el decorador `@RequirePermission(module, permissionType)`. Si el usuario tiene rol de administrador el guard siempre deja pasar. Si tiene rol de usuario, consulta la lista de permisos en el payload del JWT.

### 17.4 CurrentUser Decorator

Decorador de parámetro que extrae el usuario del request y lo inyecta directamente en el parámetro del método del controlador. Simplifica la obtención del usuario autenticado evitando acceder directamente al objeto request.

### 17.5 RequirePermission Decorator

Decorador de método que recibe el nombre del módulo y el tipo de permiso requerido. Almacena esta información en los metadatos del método para que el PermissionGuard pueda leerla al ejecutarse.

### 17.6 Public Decorator

Decorador que marca un endpoint como público. El JwtAuthGuard global lee este metadata y omite la verificación del token para ese endpoint.

---

## 18. INTERCEPTORES Y PIPES

### 18.1 ResponseTransformInterceptor

Interceptor global que transforma todas las respuestas exitosas en el formato estándar de la API. Envuelve el dato retornado por el controlador en un objeto con la estructura: `{ success: true, data: T, message: string }`. Para respuestas paginadas agrega el campo pagination con los datos de paginación.

### 18.2 AuditLogInterceptor

Interceptor selectivo aplicado mediante un decorador personalizado. Se configura con el módulo y la acción a registrar. Intercepta la respuesta exitosa del controlador y llama al AuditService con los datos relevantes del request y la respuesta. Se aplica principalmente en operaciones de escritura: creación, actualización y eliminación de recursos.

### 18.3 ValidationPipe Global

Configurado en el main.ts de forma global. Transforma los payloads entrantes a instancias de los DTOs correspondientes usando class-transformer. Aplica todas las validaciones de class-validator. Si la validación falla retorna un 400 con la lista de errores detallados. La opción `whitelist: true` elimina automáticamente cualquier propiedad que no esté definida en el DTO, previniendo la inyección de campos no esperados.

### 18.4 ParsePaginationPipe

Pipe que transforma los query params de paginación de string a número y aplica valores por defecto si no se proporcionan. Por defecto la página es uno y el límite es veinte.

---

## 19. MANEJO DE ERRORES GLOBAL

### 19.1 HttpExceptionFilter

Filtro de excepciones global que captura todas las excepciones de tipo HttpException de NestJS y las formatea en la respuesta estándar de la API con la estructura `{ success: false, message: string, errors: object opcional, statusCode: number }`.

### 19.2 PrismaExceptionFilter

Filtro especializado que captura las excepciones específicas de Prisma. Convierte el código de error de Prisma P2002 de violación de constraint unique en una respuesta 409 Conflict con un mensaje descriptivo. Convierte el P2025 de registro no encontrado en una respuesta 404. Convierte otros errores de Prisma en un 500 genérico sin exponer detalles técnicos al cliente.

### 19.3 Formato de Error Estándar

Todos los errores retornados por la API tienen el mismo formato independientemente de su origen. El campo success es siempre false. El campo message es un texto descriptivo en español. El campo errors es un objeto opcional con errores de validación detallados por campo, presente solo cuando el error es de validación de DTO. El campo statusCode es el código HTTP correspondiente.

---

## 20. REFERENCIA COMPLETA DE ENDPOINTS

### Auth

```
POST   /api/auth/login                      Público — Iniciar sesión
POST   /api/auth/change-password            Autenticado — Cambiar contraseña (primer acceso o forzado)
GET    /api/auth/me                         Autenticado — Obtener usuario activo
```

### Usuarios

```
GET    /api/users                           Admin — Listar usuarios paginados
GET    /api/users/:id                       Admin — Detalle de usuario
POST   /api/users                           Admin — Crear usuario
PUT    /api/users/:id                       Admin — Actualizar usuario
DELETE /api/users/:id                       Admin — Desactivar usuario
PUT    /api/users/:id/permissions           Admin — Actualizar permisos
POST   /api/users/:id/reset-password        Admin — Resetear contraseña al DNI
PATCH  /api/users/:id/toggle-active         Admin — Activar o desactivar cuenta
```

### Inventario

```
GET    /api/products                        Permiso inventory — Listar productos
GET    /api/products/alerts                 Autenticado — Alertas de stock y vencimiento
GET    /api/products/:id                    Permiso inventory — Detalle de producto
GET    /api/products/barcode/:code          Permiso inventory o sales — Buscar por código de barras
POST   /api/products                        Permiso inventory.create — Crear producto
PUT    /api/products/:id                    Permiso inventory.edit — Actualizar producto
DELETE /api/products/:id                    Permiso inventory.delete — Desactivar producto
POST   /api/products/:id/image              Permiso inventory.edit — Subir imagen
```

### Ventas

```
GET    /api/sales                           Permiso sales — Historial de ventas
GET    /api/sales/summary/today             Permiso sales — Resumen del día
GET    /api/sales/:id                       Permiso sales — Detalle de venta
GET    /api/sales/:id/receipt               Permiso sales — Descargar comprobante PDF
POST   /api/sales                           Permiso sales.create — Registrar venta
```

### Clientes

```
GET    /api/clients                         Permiso clients — Listar clientes
GET    /api/clients/search                  Permiso sales o clients — Buscar por DNI
GET    /api/clients/:id                     Permiso clients — Perfil del cliente
GET    /api/clients/:id/history             Permiso clients — Historial de compras
GET    /api/clients/:id/points              Permiso clients — Resumen de puntos
PUT    /api/clients/:id                     Permiso clients.edit — Actualizar datos
```

### Reportes

```
GET    /api/reports/sales                   Permiso reports — Reporte de ventas
GET    /api/reports/top-products            Permiso reports — Productos más vendidos
GET    /api/reports/inventory               Permiso reports — Estado del inventario
GET    /api/reports/clients                 Permiso reports — Ranking de clientes
GET    /api/reports/points                  Permiso reports — Resumen de puntos
GET    /api/reports/export/pdf              Permiso reports — Exportar en PDF
GET    /api/reports/export/csv              Permiso reports — Exportar en CSV
```

### Auditoría

```
GET    /api/audit                           Admin — Todos los logs con filtros
GET    /api/audit/:id                       Admin — Detalle de log con before/after
GET    /api/audit/user/:userId              Admin — Logs de un usuario específico
```

### Alertas

```
GET    /api/alerts                          Autenticado — Todas las alertas activas
GET    /api/alerts/stock                    Autenticado — Solo alertas de stock
GET    /api/alerts/expiry                   Autenticado — Solo alertas de vencimiento
GET    /api/alerts/count                    Autenticado — Conteo de alertas
```

### Configuración

```
GET    /api/settings                        Admin — Obtener configuración general
PUT    /api/settings                        Admin — Actualizar configuración general
GET    /api/settings/discounts              Admin — Listar reglas de descuento
POST   /api/settings/discounts              Admin — Crear regla de descuento
PUT    /api/settings/discounts/:id          Admin — Actualizar regla
DELETE /api/settings/discounts/:id          Admin — Eliminar regla
```

### Dashboard

```
GET    /api/dashboard/stats                 Autenticado — Estadísticas generales del día
GET    /api/dashboard/chart                 Autenticado — Datos del gráfico de ingresos
```

### Perfil

```
GET    /api/profile                         Autenticado — Perfil propio
PUT    /api/profile                         Autenticado — Actualizar perfil propio
POST   /api/profile/change-password         Autenticado — Cambio voluntario de contraseña
```

---

## 21. SEGURIDAD

### Contraseñas

Las contraseñas nunca se almacenan en texto plano. Siempre se usa bcrypt con doce rondas de sal. El hash resultante es lo único que se guarda en la base de datos. La verificación de contraseña siempre se hace comparando el texto proporcionado contra el hash almacenado, nunca desencriptando.

### JWT

El token JWT tiene un tiempo de expiración configurable, recomendado en ocho horas para una jornada laboral. El secreto JWT se almacena exclusivamente en las variables de entorno y nunca en el código fuente. El payload del token incluye la lista de permisos del usuario al momento del login, lo que evita consultas adicionales a la base de datos en cada request pero implica que los cambios de permisos solo tienen efecto en el próximo login del usuario.

### Rate Limiting

El ThrottleGuard global limita a cien requests por minuto por IP para todos los endpoints generales. El endpoint de login tiene un límite mucho más estricto de diez intentos por quince minutos para prevenir ataques de fuerza bruta.

### Headers HTTP

Helmet configura automáticamente los headers de seguridad recomendados: Content-Security-Policy para prevenir XSS, X-Frame-Options para prevenir clickjacking, X-Content-Type-Options para prevenir MIME sniffing, y Strict-Transport-Security para forzar HTTPS en producción.

### CORS

Solo los orígenes listados en la variable de entorno ALLOWED_ORIGINS pueden hacer peticiones a la API. En desarrollo se permite el origen del servidor de Vite. En producción solo el dominio del frontend desplegado.

### Validación de Inputs

El ValidationPipe global con whitelist activa rechaza cualquier campo no definido en el DTO correspondiente. Esto previene que un cliente malicioso inyecte campos no esperados en el cuerpo del request.

### Soft Delete

Los usuarios y productos nunca se eliminan físicamente. Esto preserva la integridad histórica de ventas, logs de auditoría y cualquier referencia existente. También permite recuperar registros desactivados por error.

### Auditoría Completa

Cada operación sensible queda registrada en el log de auditoría con el usuario responsable, la fecha, el módulo afectado y los estados anterior y posterior del registro. Esto proporciona trazabilidad completa para cualquier investigación de incidentes.

---

## 22. VARIABLES DE ENTORNO

```
NODE_ENV                Entorno de ejecución: development o production
PORT                    Puerto en el que escucha el servidor, por defecto 4000

DATABASE_URL            URL de conexión a PostgreSQL con usuario, contraseña, host y nombre de base de datos

JWT_SECRET              Secreto para firmar los tokens JWT, debe ser una cadena larga y aleatoria
JWT_EXPIRES_IN          Tiempo de expiración del JWT, por ejemplo 8h para ocho horas

BCRYPT_SALT_ROUNDS      Número de rondas de bcrypt, se recomienda 12 para producción

MAIL_HOST               Host del servidor SMTP para el envío de correos
MAIL_PORT               Puerto del servidor SMTP, usualmente 587 para TLS o 465 para SSL
MAIL_SECURE             Booleano que indica si usar SSL, true para el puerto 465
MAIL_USER               Usuario de autenticación del servidor SMTP
MAIL_PASS               Contraseña o app password del usuario SMTP
MAIL_FROM               Dirección de correo remitente que aparece en los emails

UPLOADS_DIR             Ruta absoluta del directorio donde se guardan imágenes y PDFs generados

ALLOWED_ORIGINS         Lista separada por comas de los orígenes permitidos por CORS
```

---

_Sistema de Gestión de Botica — Documentación Backend_
_Versión 1.0 | NestJS + TypeScript + Prisma + PostgreSQL_
