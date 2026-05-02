# 🧪 Guía de Pruebas — API Salud Nova Backend

### Cómo verificar que todos los endpoints funcionan correctamente

---

## Configuración Inicial

### URL Base

```
http://localhost:4000/api
```

### Asegúrate de que el servidor esté corriendo

```bash
npm run start:dev
```

### Herramientas recomendadas

- **Thunder Client** (extensión de VS Code) — recomendado
- **Postman** — alternativa

---

## Variables de Entorno en Thunder Client / Postman

Crea las siguientes variables de entorno para reutilizarlas:

| Variable      | Valor inicial                        |
| ------------- | ------------------------------------ |
| `base_url`    | `http://localhost:4000/api`          |
| `token`       | (se llenará después del login)       |
| `admin_token` | (se llenará después del login admin) |

En Thunder Client: **Env → New Environment → "Local"** y agrega las variables.

---

## FASE 1 — Autenticación

### 1.1 Login como Administrador

```
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "admin@botica.com",
  "password": "Admin123"
}
```

**Respuesta esperada — 200 OK:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "mustChangePassword": false,
    "user": {
      "id": "uuid",
      "firstName": "Admin",
      "lastName": "Sistema",
      "email": "admin@botica.com",
      "role": "ADMIN",
      "permissions": [...]
    }
  }
}
```

✅ **Copia el valor de `token`** y guárdalo en la variable `admin_token`.

---

### 1.2 Obtener usuario activo

```
GET {{base_url}}/auth/me
Authorization: Bearer {{admin_token}}
```

**Respuesta esperada — 200 OK:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "firstName": "Admin",
    "email": "admin@botica.com",
    "role": "ADMIN",
    "permissions": [...]
  }
}
```

---

### 1.3 Login con credenciales incorrectas

```
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "admin@botica.com",
  "password": "contraseña_incorrecta"
}
```

**Respuesta esperada — 401 Unauthorized:**

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Credenciales inválidas"
}
```

---

### 1.4 Acceso sin token

```
GET {{base_url}}/auth/me
(sin header Authorization)
```

**Respuesta esperada — 401 Unauthorized:**

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Token inválido o expirado"
}
```

---

## FASE 2 — Usuarios

> Todos los endpoints de usuarios requieren rol ADMIN.

### 2.1 Crear un usuario nuevo

```
POST {{base_url}}/users
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "firstName": "María",
  "lastName": "García",
  "email": "maria.garcia@botica.com",
  "dni": "12345678",
  "phone": "987654321",
  "position": "Vendedora",
  "role": "USER"
}
```

**Respuesta esperada — 201 Created:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-nuevo-usuario",
    "firstName": "María",
    "lastName": "García",
    "email": "maria.garcia@botica.com",
    "dni": "12345678",
    "role": "USER",
    "mustChangePassword": true,
    "isActive": true,
    "permissions": [
      { "module": "dashboard", "canAccess": true, ... },
      { "module": "sales",     "canAccess": true, ... },
      ...
    ]
  }
}
```

✅ **Guarda el `id` del usuario creado** para las siguientes pruebas.

---

### 2.2 Listar usuarios

```
GET {{base_url}}/users
Authorization: Bearer {{admin_token}}
```

**Parámetros opcionales:**

```
?page=1&limit=10
?search=María
?role=USER
```

---

### 2.3 Ver detalle de un usuario

```
GET {{base_url}}/users/{{user_id}}
Authorization: Bearer {{admin_token}}
```

---

### 2.4 Actualizar permisos del usuario

```
PUT {{base_url}}/users/{{user_id}}/permissions
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "permissions": [
    { "module": "dashboard", "canAccess": true,  "canCreate": false, "canEdit": false, "canDelete": false },
    { "module": "sales",     "canAccess": true,  "canCreate": true,  "canEdit": false, "canDelete": false },
    { "module": "clients",   "canAccess": true,  "canCreate": false, "canEdit": false, "canDelete": false },
    { "module": "reports",   "canAccess": true,  "canCreate": false, "canEdit": false, "canDelete": false },
    { "module": "inventory", "canAccess": true,  "canCreate": true,  "canEdit": true,  "canDelete": false }
  ]
}
```

---

### 2.5 Login con el nuevo usuario (primer acceso)

```
POST {{base_url}}/auth/login
Content-Type: application/json

{
  "email": "maria.garcia@botica.com",
  "password": "12345678"
}
```

**Respuesta esperada — 200 OK con `mustChangePassword: true`:**

```json
{
  "success": true,
  "data": {
    "token": "...",
    "mustChangePassword": true,
    "user": { ... }
  }
}
```

---

### 2.6 Cambiar contraseña obligatoria

```
POST {{base_url}}/auth/change-password
Authorization: Bearer <token_del_nuevo_usuario>
Content-Type: application/json

{
  "currentPassword": "12345678",
  "newPassword": "NuevaPass123",
  "confirmPassword": "NuevaPass123"
}
```

**Respuesta esperada — 200 OK con `mustChangePassword: false`**

---

### 2.7 Resetear contraseña al DNI

```
POST {{base_url}}/users/{{user_id}}/reset-password
Authorization: Bearer {{admin_token}}
```

**Respuesta esperada:**

```json
{
  "success": true,
  "data": {
    "message": "Contraseña restablecida al DNI correctamente"
  }
}
```

---

## FASE 3 — Inventario

### 3.1 Crear un producto

```
POST {{base_url}}/products
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "commercialName": "Paracetamol 500mg",
  "genericName": "Acetaminofén",
  "description": "Analgésico y antipirético",
  "category": "Analgésicos",
  "pharmaceuticalForm": "Tableta",
  "concentration": "500mg",
  "presentation": "Caja x 100 tabletas",
  "laboratory": "Farmindustria",
  "purchasePrice": 8.50,
  "salePrice": 12.00,
  "currentStock": 150,
  "minimumStock": 20,
  "expirationDate": "2027-12-31",
  "lot": "LOT-2024-001",
  "sku": "MED-001",
  "barcode": "7891234567890",
  "physicalLocation": "Estante A-1",
  "taxApplicable": true,
  "saleUnit": "caja"
}
```

**Respuesta esperada — 201 Created**

✅ **Guarda el `id` del producto** para las siguientes pruebas.

---

### 3.2 Crear un segundo producto con stock bajo

```
POST {{base_url}}/products
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "commercialName": "Ibuprofeno 400mg",
  "genericName": "Ibuprofeno",
  "category": "Antiinflamatorios",
  "pharmaceuticalForm": "Tableta",
  "purchasePrice": 6.00,
  "salePrice": 9.50,
  "currentStock": 5,
  "minimumStock": 20,
  "expirationDate": "2026-06-15",
  "sku": "MED-002",
  "saleUnit": "unidad"
}
```

---

### 3.3 Listar productos

```
GET {{base_url}}/products
Authorization: Bearer {{admin_token}}
```

**Con filtros:**

```
GET {{base_url}}/products?search=paracetamol
GET {{base_url}}/products?category=Analgésicos
GET {{base_url}}/products?stockStatus=low
GET {{base_url}}/products?page=1&limit=5
```

---

### 3.4 Ver alertas de stock

```
GET {{base_url}}/products/alerts
Authorization: Bearer {{admin_token}}
```

**Respuesta esperada:** Lista de productos con stock bajo o próximos a vencer. El Ibuprofeno debe aparecer aquí.

---

### 3.5 Buscar por código de barras

```
GET {{base_url}}/products/barcode/7891234567890
Authorization: Bearer {{admin_token}}
```

---

### 3.6 Actualizar un producto

```
PUT {{base_url}}/products/{{product_id}}
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "currentStock": 200,
  "salePrice": 13.50
}
```

---

## FASE 4 — Ventas

### 4.1 Registrar una venta sin cliente

```
POST {{base_url}}/sales
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "items": [
    {
      "productId": "{{product_id}}",
      "quantity": 2
    }
  ]
}
```

**Respuesta esperada — 201 Created:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "saleNumber": "VTA-000001",
    "subtotal": 24.00,
    "discountAmount": 0,
    "taxAmount": 4.32,
    "total": 24.00,
    "pointsEarned": 24,
    "receiptPath": "receipt_VTA-000001_timestamp.pdf",
    "items": [...],
    "user": { "firstName": "Admin", "lastName": "Sistema" },
    "client": null
  }
}
```

✅ **Guarda el `id` de la venta** para descargar el comprobante.

---

### 4.2 Registrar una venta con cliente

```
POST {{base_url}}/sales
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "clientDni": "87654321",
  "clientName": "Juan Pérez",
  "clientPhone": "999888777",
  "items": [
    {
      "productId": "{{product_id}}",
      "quantity": 3
    }
  ]
}
```

---

### 4.3 Resumen de ventas del día

```
GET {{base_url}}/sales/summary/today
Authorization: Bearer {{admin_token}}
```

**Respuesta esperada:**

```json
{
  "success": true,
  "data": {
    "todaySales": 2,
    "todayRevenue": 60.0,
    "averageTicket": 30.0,
    "date": "2026-05-02"
  }
}
```

---

### 4.4 Historial de ventas

```
GET {{base_url}}/sales
Authorization: Bearer {{admin_token}}
```

---

### 4.5 Detalle de una venta

```
GET {{base_url}}/sales/{{sale_id}}
Authorization: Bearer {{admin_token}}
```

---

### 4.6 Descargar comprobante PDF

```
GET {{base_url}}/sales/{{sale_id}}/receipt
Authorization: Bearer {{admin_token}}
```

**Respuesta esperada:** Archivo PDF descargado con el comprobante de la venta.

---

### 4.7 Intentar vender con stock insuficiente

```
POST {{base_url}}/sales
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "items": [
    {
      "productId": "{{product_id}}",
      "quantity": 9999
    }
  ]
}
```

**Respuesta esperada — 400 Bad Request:**

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Stock insuficiente para \"Paracetamol 500mg\". Disponible: ..."
}
```

---

## FASE 5 — Clientes

### 5.1 Buscar cliente por DNI

```
GET {{base_url}}/clients/search?dni=87654321
Authorization: Bearer {{admin_token}}
```

---

### 5.2 Listar clientes

```
GET {{base_url}}/clients
Authorization: Bearer {{admin_token}}
```

---

### 5.3 Ver historial de compras de un cliente

```
GET {{base_url}}/clients/{{client_id}}/history
Authorization: Bearer {{admin_token}}
```

---

### 5.4 Ver puntos de un cliente

```
GET {{base_url}}/clients/{{client_id}}/points
Authorization: Bearer {{admin_token}}
```

---

## FASE 6 — Alertas

### 6.1 Todas las alertas

```
GET {{base_url}}/alerts
Authorization: Bearer {{admin_token}}
```

### 6.2 Conteo de alertas

```
GET {{base_url}}/alerts/count
Authorization: Bearer {{admin_token}}
```

**Respuesta esperada:**

```json
{
  "success": true,
  "data": {
    "count": 2,
    "critical": 1
  }
}
```

---

## FASE 7 — Dashboard

### 7.1 Estadísticas del día

```
GET {{base_url}}/dashboard/stats
Authorization: Bearer {{admin_token}}
```

**Respuesta esperada:**

```json
{
  "success": true,
  "data": {
    "todaySales": 2,
    "todayRevenue": 60.0,
    "averageTicket": 30.0,
    "alertsCount": 2,
    "criticalAlerts": 1,
    "totalProducts": 2,
    "lowStockCount": 1
  }
}
```

### 7.2 Gráfico de ingresos

```
GET {{base_url}}/dashboard/chart
Authorization: Bearer {{admin_token}}
```

---

## FASE 8 — Reportes

### 8.1 Reporte de ventas del mes

```
GET {{base_url}}/reports/sales?period=month
Authorization: Bearer {{admin_token}}
```

### 8.2 Productos más vendidos

```
GET {{base_url}}/reports/top-products?period=month
Authorization: Bearer {{admin_token}}
```

### 8.3 Estado del inventario

```
GET {{base_url}}/reports/inventory
Authorization: Bearer {{admin_token}}
```

### 8.4 Exportar a CSV

```
GET {{base_url}}/reports/export/csv?period=month
Authorization: Bearer {{admin_token}}
```

**Respuesta esperada:** Archivo CSV descargado.

---

## FASE 9 — Configuración

### 9.1 Ver configuración actual

```
GET {{base_url}}/settings
Authorization: Bearer {{admin_token}}
```

**Respuesta esperada:**

```json
{
  "success": true,
  "data": {
    "botica_name": "Botica San Juan",
    "ruc": "10000000000",
    "address": "Av. Principal 123",
    "igv_rate": "18",
    "points_per_sol": "1",
    "points_value": "0.01"
  }
}
```

---

### 9.2 Actualizar configuración

```
PUT {{base_url}}/settings
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "settings": {
    "botica_name": "Botica San Juan SAC",
    "igv_rate": "18",
    "points_per_sol": "2"
  }
}
```

---

### 9.3 Crear regla de descuento

```
POST {{base_url}}/settings/discounts
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "name": "Descuento por monto mínimo S/. 50",
  "type": "BY_MINIMUM_AMOUNT",
  "value": 10,
  "condition": "{\"minimumAmount\": 50}",
  "isActive": true,
  "priority": 1
}
```

---

## FASE 10 — Auditoría

### 10.1 Ver todos los logs

```
GET {{base_url}}/audit
Authorization: Bearer {{admin_token}}
```

### 10.2 Filtrar logs por módulo

```
GET {{base_url}}/audit?module=sales&page=1&limit=10
Authorization: Bearer {{admin_token}}
```

### 10.3 Ver logs de un usuario específico

```
GET {{base_url}}/audit/user/{{user_id}}
Authorization: Bearer {{admin_token}}
```

---

## FASE 11 — Perfil

### 11.1 Ver perfil propio

```
GET {{base_url}}/profile
Authorization: Bearer {{admin_token}}
```

### 11.2 Actualizar perfil

```
PUT {{base_url}}/profile
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "phone": "999111222"
}
```

### 11.3 Cambiar contraseña voluntariamente

```
POST {{base_url}}/profile/change-password
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
  "currentPassword": "Admin123",
  "newPassword": "NuevoAdmin456",
  "confirmPassword": "NuevoAdmin456"
}
```

---

## FASE 12 — Pruebas de Permisos

### 12.1 Usuario sin permiso intenta acceder a inventario

Primero obtén el token del usuario `maria.garcia@botica.com` (si ya cambió su contraseña usa `NuevaPass123`):

```
POST {{base_url}}/auth/login
{
  "email": "maria.garcia@botica.com",
  "password": "NuevaPass123"
}
```

Guarda el token y luego intenta acceder a un módulo no permitido:

```
GET {{base_url}}/users
Authorization: Bearer {{token_usuario_normal}}
```

**Respuesta esperada — 403 Forbidden:**

```json
{
  "success": false,
  "statusCode": 403,
  "message": "No tienes el rol requerido para esta acción"
}
```

---

### 12.2 Verificar que sí puede acceder a ventas

```
GET {{base_url}}/sales
Authorization: Bearer {{token_usuario_normal}}
```

**Respuesta esperada — 200 OK** (tiene permiso de ventas por defecto)

---

## Checklist de Verificación

Usa esta lista para confirmar que todo funciona:

### Autenticación

- [ ] Login con credenciales correctas retorna 200 + token
- [ ] Login con credenciales incorrectas retorna 401
- [ ] Acceso sin token retorna 401
- [ ] `GET /auth/me` retorna el usuario autenticado
- [ ] Primer login retorna `mustChangePassword: true`
- [ ] Cambio de contraseña actualiza el flag a `false`

### Usuarios

- [ ] Crear usuario asigna permisos por defecto
- [ ] Crear usuario con DNI duplicado retorna 409
- [ ] Actualizar permisos funciona correctamente
- [ ] Reset de contraseña vuelve a poner el DNI

### Inventario

- [ ] Crear producto con SKU duplicado retorna 409
- [ ] Listar con filtros funciona
- [ ] Alertas muestra productos con stock bajo
- [ ] Búsqueda por código de barras funciona

### Ventas

- [ ] Registrar venta descuenta el stock del producto
- [ ] Registrar venta con cliente acumula puntos
- [ ] Venta con stock insuficiente retorna 400
- [ ] Comprobante PDF se genera y descarga

### Sistema

- [ ] Alertas detectan stock bajo y vencimientos
- [ ] Dashboard stats refleja las ventas del día
- [ ] Reportes filtran por período correctamente
- [ ] Exportación CSV descarga el archivo
- [ ] Auditoría registra las acciones realizadas
- [ ] Usuario sin permiso obtiene 403

---

## Errores Comunes y Soluciones

| Error                        | Causa                        | Solución                            |
| ---------------------------- | ---------------------------- | ----------------------------------- |
| `401 Token inválido`         | Token expirado o mal copiado | Volver a hacer login                |
| `403 Sin permiso`            | Usuario sin acceso al módulo | Verificar permisos con admin        |
| `409 Registro duplicado`     | SKU o correo ya existe       | Usar un valor diferente             |
| `400 Stock insuficiente`     | Cantidad > stock disponible  | Reducir la cantidad                 |
| `404 No encontrado`          | ID inexistente               | Verificar el ID en la base de datos |
| `P1001 Can't reach database` | URL de BD incorrecta         | Revisar `.env` DATABASE_URL         |

---

_Salud Nova — Guía de pruebas de API · v1.0_
