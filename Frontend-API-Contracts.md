# 📘 Contratos de la API (Salud Nova Backend) — Detallado

Este documento detalla exhaustivamente la estructura de los datos (JSON) que el Frontend enviará al Backend (Payloads) y lo que recibirá como respuesta en cada módulo. 

> [!IMPORTANT]
> Todos los endpoints (excepto `/auth/login`) requieren el header `Authorization: Bearer <token>`.

---

## 🏗️ Formato de Respuesta Estándar

Todas las respuestas del backend (sin excepción) siguen esta estructura envolvente:

**Éxito Simple:**
```json
{
  "success": true,
  "data": { ... } // Objeto único, array, o string
}
```

**Éxito Paginado (Endpoints que devuelven listas):**
```json
{
  "success": true,
  "data": [ { ... }, { ... } ],
  "pagination": {
    "total": 50,         // Total de registros en base de datos
    "page": 1,           // Página actual
    "limit": 10,         // Límite de registros por página
    "totalPages": 5      // Total de páginas calculadas
  }
}
```

**Error:**
```json
{
  "success": false,
  "statusCode": 400, // Puede ser 400, 401, 403, 404, 409 o 500
  "message": "Mensaje detallado del error (ej. 'Stock insuficiente')"
}
```

---

## 🔐 1. Módulo Auth (`/auth`)

### 🟢 Iniciar Sesión (`POST /auth/login`)
**Payload:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `email` | `string` | ✅ **Sí** | Correo del usuario |
| `password` | `string` | ✅ **Sí** | Contraseña |

**Respuesta Exitosa (`data`):**
```json
{
  "token": "eyJhbGciOi...", 
  "mustChangePassword": true, // IMPORTANTE: Si es true, el frontend debe redirigir a la vista de "Cambio de Contraseña Obligatorio"
  "user": {
    "id": "uuid",
    "firstName": "Juan",
    "lastName": "Pérez",
    "email": "usuario@botica.com",
    "role": "USER", // "ADMIN" o "USER"
    "permissions": [
      { "module": "sales", "canAccess": true, "canCreate": true, "canEdit": false, "canDelete": false }
    ]
  }
}
```

### 🟢 Cambiar Contraseña Obligatoria (`POST /auth/change-password`)
**Payload:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `currentPassword` | `string` | ✅ **Sí** | Contraseña actual |
| `newPassword` | `string` | ✅ **Sí** | Mínimo 6 caracteres |
| `confirmPassword` | `string` | ✅ **Sí** | Debe coincidir con `newPassword` |

---

## 👥 2. Módulo Usuarios (`/users`)
*Requiere rol `ADMIN`*

### 🟢 Crear Usuario (`POST /users`)
**Payload:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `firstName` | `string` | ✅ **Sí** | Nombres |
| `lastName` | `string` | ✅ **Sí** | Apellidos |
| `email` | `string` | ✅ **Sí** | Correo único |
| `dni` | `string` | ✅ **Sí** | DNI exacto de 8 a 15 caracteres (único) |
| `position` | `string` | ✅ **Sí** | Cargo del empleado (Ej. "Vendedor") |
| `role` | `string` | ✅ **Sí** | `"ADMIN"` o `"USER"` |
| `phone` | `string` | ❌ No | Teléfono |

*Nota: La contraseña se genera automáticamente igual al DNI y `mustChangePassword` se establece en `true`.*

### 🟢 Listar Usuarios (`GET /users`)
**Query Params (Filtros Opcionales):** `?page=1&limit=20&search=Juan&role=USER`

### 🟢 Actualizar Permisos (`PUT /users/:id/permissions`)
**Payload:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `permissions` | `array` | ✅ **Sí** | Arreglo de objetos de permiso |

**Estructura del Array:**
```json
{
  "permissions": [
    { 
      "module": "inventory", // sales, inventory, clients, reports, dashboard, etc.
      "canAccess": true, 
      "canCreate": true, 
      "canEdit": true, 
      "canDelete": false 
    }
  ]
}
```

---

## 📦 3. Módulo Inventario (`/products`)

### 🟢 Crear Producto (`POST /products`)
**Payload:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `commercialName` | `string` | ✅ **Sí** | Nombre comercial |
| `category` | `string` | ✅ **Sí** | Categoría (Ej. "Analgésicos") |
| `purchasePrice` | `number` | ✅ **Sí** | Precio de compra > 0 |
| `salePrice` | `number` | ✅ **Sí** | Precio de venta > 0 |
| `sku` | `string` | ✅ **Sí** | Código interno (Único) |
| `saleUnit` | `string` | ✅ **Sí** | Unidad de venta (Ej. "caja", "blister", "unidad") |
| `taxApplicable` | `boolean`| ✅ **Sí** | Aplica IGV (por defecto true) |
| `genericName` | `string` | ❌ No | Principio activo |
| `description` | `string` | ❌ No | Descripción o uso |
| `pharmaceuticalForm`| `string`| ❌ No | Ej. "Tableta", "Jarabe" |
| `concentration` | `string` | ❌ No | Ej. "500mg" |
| `presentation` | `string` | ❌ No | Ej. "Caja x 100" |
| `laboratory` | `string` | ❌ No | Marca o Laboratorio |
| `currentStock` | `number` | ❌ No | Stock inicial (default: 0) |
| `minimumStock` | `number` | ❌ No | Stock de alerta (default: 0) |
| `expirationDate` | `string` | ❌ No | Formato ISO (YYYY-MM-DDTHH:mm:ssZ) |
| `lot` | `string` | ❌ No | Lote |
| `barcode` | `string` | ❌ No | Código de barras (Único) |
| `physicalLocation` | `string` | ❌ No | Ej. "Estante 2A" |

### 🟢 Listar Productos (`GET /products`)
**Query Params:** `?page=1&limit=20&search=paracetamol&category=Analgésicos&stockStatus=low|critical|normal`

---

## 🛒 4. Módulo Ventas (`/sales`)

### 🟢 Registrar Venta (`POST /sales`)
**Payload:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `items` | `array` | ✅ **Sí** | Lista de productos a vender |
| `clientDni` | `string` | ❌ No | DNI del cliente (si da DNI, el sistema crea/actualiza el cliente) |
| `clientName`| `string` | ❌ No | Nombre del cliente |
| `clientPhone`| `string`| ❌ No | Teléfono del cliente |
| `pointsToUse`| `number`| ❌ No | Puntos a canjear en esta venta |
| `notes` | `string` | ❌ No | Observaciones de la venta |

**Estructura de `items`:**
```json
"items": [
  {
    "productId": "uuid_del_producto", // Requerido
    "quantity": 2                     // Requerido, debe ser > 0
  }
]
```

**Respuesta Exitosa (`data`):**
Retorna toda la información de la venta generada, incluyendo totales calculados en backend, puntos ganados y el **`receiptPath`** (nombre del archivo PDF del comprobante).

### 🟢 Descargar Comprobante (`GET /sales/:id/receipt`)
- Retorna directamente un archivo binario `application/pdf`. No es un JSON.

---

## 📊 5. Dashboard (`/dashboard`)

### 🟢 Obtener Estadísticas (`GET /dashboard/stats`)
**Respuesta:**
```json
{
  "todaySales": 45,             // Cantidad de ventas del día
  "todayRevenue": 1250.50,      // Dinero ingresado hoy
  "averageTicket": 27.78,       // Ticket promedio
  "alertsCount": 5,             // Total de alertas
  "criticalAlerts": 2,          // Alertas críticas (vencidos o stock 0)
  "totalProducts": 1200,        // Productos en BD
  "lowStockCount": 15           // Productos con stock bajo
}
```

### 🟢 Obtener Datos de Gráfico (`GET /dashboard/chart`)
**Respuesta:**
```json
[
  { "date": "2026-04-26", "revenue": 850.00 },
  { "date": "2026-04-27", "revenue": 1050.50 }
]
```

---

## 🤝 6. Clientes (`/clients`)

### 🟢 Listar Clientes (`GET /clients`)
**Query Params:** `?page=1&limit=20&search=juan`

### 🟢 Buscar por DNI exacto (`GET /clients/search?dni=12345678`)
- Útil para el checkout en ventas.

---

## 🔔 7. Alertas (`/alerts`)

### 🟢 Listar Alertas (`GET /alerts`, `GET /alerts/stock`, `GET /alerts/expiry`)
**Respuesta (Item de alerta):**
```json
{
  "productId": "uuid",
  "productName": "Ibuprofeno 400mg",
  "type": "LOW_STOCK", // LOW_STOCK, CRITICAL_STOCK, EXPIRING_SOON, EXPIRED
  "severity": "high", // low, medium, high, critical
  "message": "Stock crítico: solo quedan 5 unidades (Mínimo: 20)",
  "currentStock": 5,
  "minimumStock": 20
}
```

---

## ⚙️ 8. Configuración (`/settings`)

### 🟢 Actualizar Configuración (`PUT /settings`)
**Payload:**
```json
{
  "settings": {
    "botica_name": "Salud Nova SAC", // Opcional
    "ruc": "20123456789",            // Opcional
    "address": "Av. Principal 123",  // Opcional
    "igv_rate": "18",                // Opcional
    "points_per_sol": "1",           // Opcional
    "points_value": "0.01"           // Opcional
  }
}
```

### 🟢 Crear Regla de Descuento (`POST /settings/discounts`)
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `name` | `string` | ✅ **Sí** | Nombre de la regla |
| `type` | `enum` | ✅ **Sí** | `PERCENTAGE`, `FIXED_AMOUNT`, `BY_PRODUCT`, `BY_CATEGORY`, `BY_QUANTITY`, `BY_MINIMUM_AMOUNT` |
| `value` | `number` | ✅ **Sí** | Valor del descuento |
| `condition` | `string` | ❌ No | JSON stringificado con la condición específica |
| `isActive` | `boolean`| ❌ No | Default `true` |
| `priority` | `number` | ❌ No | Default `0` |

---

## 🛡️ 9. Auditoría (`/audit`)

### 🟢 Listar Logs (`GET /audit`)
**Query Params (Filtros):**
- `?page=1&limit=20`
- `?userId=uuid`
- `?module=sales` (sales, inventory, users, auth, etc.)
- `?action=create` (create, update, delete, login, etc.)
- `?startDate=2026-01-01`
- `?endDate=2026-12-31`

---

## 👤 10. Perfil (`/profile`)

### 🟢 Actualizar Perfil Propio (`PUT /profile`)
**Payload:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `phone` | `string` | ❌ No | Nuevo teléfono |
| `email` | `string` | ❌ No | Nuevo correo |
*(No se puede cambiar el rol ni los permisos desde aquí)*

### 🟢 Cambiar Contraseña Voluntariamente (`POST /profile/change-password`)
- Igual que el de Auth, pero usado desde dentro de la sesión iniciada del usuario.

---

> [!TIP]
> **Recomendación para Frontend:** Creen tipos o interfaces en TypeScript (`interfaces/Product.ts`, `interfaces/Sale.ts`) basándose exactamente en estas estructuras. El campo `id` de todos los modelos es un UUID. Las fechas devueltas siempre vienen en formato string ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`). Los campos decimales de moneda deben tratarse con 2 decimales.
