🗺️ PLAN DE CONSTRUCCIÓN — ORDEN DE IMPLEMENTACIÓN

🔵 BACKEND (NestJS) — Primero, porque el frontend depende de él
FASE 1 — Base del proyecto

Inicializar proyecto NestJS + configurar tsconfig, variables de entorno y estructura de carpetas
Configurar Prisma + PostgreSQL: escribir el schema completo con todos los modelos y correr la migración inicial
Crear el PrismaService y PrismaModule en infrastructure

FASE 2 — Infraestructura compartida

Crear shared/filters: HttpExceptionFilter y PrismaExceptionFilter
Crear shared/interceptors: ResponseTransformInterceptor
Crear shared/pipes: ValidationPipe global y ParsePaginationPipe
Crear shared/decorators: @CurrentUser, @Public, @Roles, @RequirePermission
Crear shared/guards: JwtAuthGuard, RolesGuard, PermissionGuard
Registrar todo en AppModule de forma global

FASE 3 — Infraestructura de servicios

Crear MailModule + MailService + templates de correos
Crear PdfModule + PdfService + templates de comprobante y reporte
Crear ExportModule + ExportService para CSV
Crear StorageService para manejo de archivos subidos

FASE 4 — Módulos de negocio (en orden de dependencia)

Módulo Auth: strategy JWT, guards, login, change-password
Módulo Users: CRUD de usuarios + gestión de permisos
Módulo Settings: configuración general + reglas de descuento (necesario para ventas)
Módulo Audit: servicio de log (necesario para todos los demás módulos)
Módulo Inventory: CRUD de productos + alertas de stock
Módulo Clients: resolución y gestión de clientes
Módulo Sales: registro de ventas + CartCalculatorService + generación de PDF
Módulo Alerts: consolidación de alertas de stock y vencimiento
Módulo Reports: agregaciones + exportación PDF/CSV
Módulo Dashboard: stats del día + datos del gráfico
Módulo Profile: edición de perfil personal

FASE 5 — Cierre backend

Seed inicial: crear usuario administrador por defecto
Probar todos los endpoints con Postman/Thunder Client
