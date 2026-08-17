# 📦 INVENTARIO-WEB-AXEL — Árbol de Funcionalidades (Detallado)

---

## 1. 🔐 AUTENTICACIÓN Y AUTORIZACIÓN

```
├── 1.1 Login
│   ├── Formulario: usuario + contraseña
│   ├── POST /api/auth/jwt/create/custom/ → JWT access + refresh tokens
│   ├── Almacenamiento en localStorage (accessToken, refreshToken)
│   ├── Manejo de errores (credenciales inválidas)
│   └── Redirección automática según rol (superuser → /admin, normal → /app)
│
├── 1.2 Guards de Rutas
│   ├── authGuard → Verifica token válido con POST /auth/jwt/verify/
│   ├── loginGuard → Si ya autenticado, redirige a home
│   ├── superUserGuard → Solo permite is_superuser === true
│   ├── normalUserGuard → Solo permite usuarios no superuser
│   └── roleRedirectGuard → Redirige a /admin o /app según rol
│
├── 1.3 Tokens
│   ├── Access token (corto plazo)
│   ├── Refresh token (largo plazo)
│   ├── HTTP Interceptor → Adjunta token a cada petición
│   └── Verificación periódica de autenticidad
│
└── 1.4 Permisos (RBAC - 30+ permisos granulares)
    ├── can_make_sale
    ├── can_cancel_sale
    ├── can_create_inventory / can_modify_inventory / can_update_inventory / can_delete_inventory
    ├── can_create_product / can_update_product / can_delete_product
    ├── can_create_category / can_modify_category / can_delete_category
    ├── can_create_supplier / can_modify_supplier / can_delete_supplier
    ├── can_create_store / can_modify_store / can_delete_store
    ├── can_create_user
    ├── view_sale / view_inventory / view_product / view_category / view_supplier / view_store
    └── user_permissions_list + all_permissions_meta
```

---

## 2. 📊 DASHBOARD (Estadísticas)

```
├── 2.1 Tarjetas de Resumen de Ventas (DashboardSalesCardsComponent)
│   ├── Ventas de hoy (todaySales)
│   ├── Ventas de la semana (thisWeekSales)
│   ├── Ventas del mes (thisMonthSales)
│   ├── Selector de fecha (día específico)
│   ├── Selector de mes/año
│   └── Dispatch: cargarResumenVentasByDate (day_month_year / month_year)
│
├── 2.2 Gráficos de Ventas entre Fechas (ChartsalesbetweentwodatesComponent)
│   ├── Rango de fechas personalizable
│   └── Gráficos de línea/barras
│
├── 2.3 Productos Más Vendidos (DashboardProductsMostSalesComponent)
│   ├── Top productos por cantidad vendida
│   └── Ranking de productos
│
├── 2.4 Gráficos de Inicio (GraficosInicioComponent)
│   ├── Ring Chart: distribución por categoría
│   ├── Pie Chart: productos más vendidos
│   ├── Barras verticales: ventas por mes
│   ├── Línea de tendencia: ventas diarias
│   └── Barras horizontales: top productos por ingresos
│
├── 2.5 Últimas Ventas (DashboardLatestSalesComponent)
├── 2.6 Stock Bajo (DashboardLowStockComponent)
├── 2.7 Pedidos Pendientes (DashboardPendingOrdersComponent)
├── 2.8 Métodos de Pago (DashboardPaymentMethodsComponent)
└── 2.9 Nuevos Productos (DashboardNewProductsComponent)
```

---

## 3. 🛍️ VENTAS (Punto de Venta / POS)

```
├── 3.1 Historial de Ventas (ListallventasComponent)
│   ├── Tabla paginada de todas las ventas
│   ├── Filtros por fecha, cliente, método de pago
│   ├── Detalle de venta (comprobante electrónico)
│   └── Descarga de XML, PDF, CDR
│
├── 3.2 Ventas de Hoy (TodaysalestableComponent)
│   ├── Lista de ventas del día actual
│   └── Totales del día
│
├── 3.3 Última Venta (TodaysaleComponent)
│   └── Resumen de la última venta realizada
│
├── 3.4 Ventas Anuladas (CanceledsalesComponent)
│   ├── Lista de ventas canceladas
│   └── Motivos de cancelación
│
├── 3.5 Top Productos Vendidos (MostsalesproductsComponent)
│   └── Ranking de productos más vendidos en el día
│
├── 3.6 Crear Venta / POS (HacerventaComponent)
│   ├── Selección de Cliente
│   │   ├── Modo "Buscar" → Buscar cliente existente por DNI/RUC
│   │   ├── Modo "Nuevo" → Crear cliente nuevo
│   │   ├── Consulta DNI/RUC a API externa (/api/consulta-documento/)
│   │   ├── Auto-completado de datos (nombre, dirección)
│   │   └── Validación: Boleta → 8 dígitos, Factura → 11 dígitos
│   │
│   ├── Selección de Productos
│   │   ├── Búsqueda manual de productos en inventario
│   │   ├── Escáner de código de barras (lector físico)
│   │   ├── Escáner de código de barras (cámara/móvil)
│   │   ├── Diálogo de selección de productos (DialogselectproductsComponent)
│   │   ├── Validación de stock disponible
│   │   ├── Validación de costo > 0
│   │   └── Incremento automático de cantidad si producto ya existe
│   │
│   ├── Datos de la Venta
│   │   ├── Método de pago: YAPE, PLIN, Transferencia, Efectivo
│   │   ├── Forma de pago: Contado
│   │   ├── Tipo comprobante: Boleta, Factura, Anónima
│   │   ├── Envío a SUNAT (toggle)
│   │   └── Guardar cliente como registrado (toggle)
│   │
│   ├── Cálculos Automáticos
│   │   ├── Subtotal (cantidad × precio unitario)
│   │   ├── Descuentos por producto
│   │   ├── IGV (18%)
│   │   ├── Total a pagar
│   │   └── Recálculo en tiempo real al cambiar cantidades/descuentos
│   │
│   ├── Tabla de Productos Seleccionados
│   │   ├── Imagen del producto
│   │   ├── Nombre y categoría
│   │   ├── Precio unitario
│   │   ├── Cantidad (select 1-10)
│   │   ├── Descuento por producto
│   │   ├── Subtotal por producto
│   │   └── Botón eliminar producto
│   │
│   └── Finalización
│       ├── Dispatch: crearVenta → POST al backend
│       ├── Dispatch: updateStockMultiple → Actualizar stock
│       ├── Vista temporal del comprobante generado
│       └── Reset del formulario
│
├── 3.7 Comprobante Electrónico
│   ├── Tipo comprobante: Boleta / Factura
│   ├── Serie y correlativo automático
│   ├── Datos del cliente (DNI/RUC, nombre, dirección)
│   ├── Items con IGV incluido
│   ├── Totales: gravadas, IGV, total
│   ├── Estado SUNAT: Aceptado / Observado / Rechazado
│   ├── Descarga: XML, PDF, CDR, Ticket
│   └── Nota de crédito (anulación/observación)
│
└── 3.8 Devoluciones (DialogdevolucionComponent)
    └── Registro de devoluciones de productos
```

---

## 4. 📦 PRODUCTOS

```
├── 4.1 Lista de Productos (TableproductComponent)
│   ├── Tabla paginada
│   ├── Búsqueda por nombre, SKU, categoría
│   ├── Filtros por categoría
│   ├── Acciones: editar, eliminar, ver detalle
│   └── Infinite scroll
│
├── 4.2 Crear Producto (DialogcreateproductComponent)
│   ├── Nombre (requerido)
│   ├── Descripción
│   ├── SKU (código único)
│   ├── Categoría (select)
│   ├── Marca
│   ├── Modelo
│   ├── Imagen (subir archivo)
│   └── Características (JSON dinámico)
│
├── 4.3 Editar Producto (DialogupdateproductComponent)
│   ├── Todos los campos editables
│   └── Actualización de imagen
│
├── 4.4 Eliminar/Desactivar Producto
│   ├── Confirmación antes de eliminar
│   └── Desactivado lógico (activo: false)
│
├── 4.5 Categorías (TablecategoriesComponent)
│   ├── Lista de categorías
│   ├── Crear categoría (DialogcreatecategoriaComponent)
│   ├── Editar categoría (DialogupdatecategoriaComponent)
│   └── Eliminar categoría
│
├── 4.6 Código de Barras (BarcodeComponent)
│   ├── Generación automática de código de barras (JsBarcode)
│   ├── Visualización del código
│   └── Asociado al SKU del producto
│
├── 4.7 Gráficos de Productos (GraficosProductosComponent)
│   ├── Ring Chart: Productos más vendidos
│   ├── Pie Chart: Distribución por categoría
│   ├── Barras verticales: Ventas por mes
│   ├── Línea de tendencia: Ventas diarias
│   └── Barras horizontales: Top productos por ingresos
│
├── 4.8 Alertas de Stock (AlertasStockComponent)
│   ├── Tabla de productos con stock bajo
│   ├── Clasificación: Crítico (0-3), Advertencia (4-10)
│   ├── Ring Chart: Distribución por estado
│   ├── Pie Chart: Distribución por categoría
│   └── Bar chart: Productos por nivel de stock
│
└── 4.9 Subir CSV de Productos (SubircsvproductosComponent)
    ├── Drag & drop de archivo .csv
    ├── Preview de datos (headers + 10 filas)
    ├── Validación de formato
    ├── Nombre de archivo, tamaño, total de filas
    └── Botón eliminar archivo
```

---

## 5. 🏪 INVENTARIO

```
├── 5.1 Tabla de Inventario (TableinventarioComponent)
│   ├── Tabla paginada con todos los items
│   ├── Búsqueda por producto, tienda, categoría
│   ├── Filtros por tienda, categoría, estado
│   ├── Columnas: producto, tienda, cantidad, costo, estado
│   └── Infinite scroll
│
├── 5.2 Crear Inventario (DialogcreateinventarioComponent)
│   ├── Producto (select/search)
│   ├── Tienda (select)
│   ├── Cantidad inicial
│   ├── Stock mínimo (alerta)
│   ├── Stock máximo
│   ├── Costo de compra
│   ├── Costo de venta
│   ├── Lote (opcional)
│   ├── Fecha de vencimiento (opcional)
│   ├── Responsable (auto-asignado)
│   └── Descripción
│
├── 5.3 Editar Inventario (DialogeditinventarioComponent)
│   ├── Modificar cantidades
│   ├── Modificar costos
│   ├── Modificar stock mínimo/máximo
│   └── Modificar estado
│
├── 5.4 Eliminar Inventario
│   └── Desactivado lógico
│
└── 5.5 Búsqueda de Inventario (InventarioSearchService)
    ├── Búsqueda por SKU
    ├── Búsqueda por nombre de producto
    └── Normalización de SKU (normalizeSku)
```

---

## 6. 💰 COMPRAS

```
├── 6.1 Historial de Compras (ListallcomprasComponent)
│   ├── Tabla paginada de compras
│   ├── Filtros por fecha, proveedor, tipo comprobante
│   ├── Detalle de compra
│   └── Descarga de archivos XML
│
├── 6.2 Registrar Compra (RegistrarcompraComponent)
│   ├── Datos del Comprobante
│   │   ├── Tipo comprobante: Factura (01) / Boleta (03)
│   │   ├── Serie
│   │   ├── Correlativo
│   │   ├── Fecha de emisión
│   │   ├── Fecha de vencimiento
│   │   ├── Forma de pago: Contado / Crédito
│   │   └── Moneda: PEN / USD
│   │
│   ├── Proveedor
│   │   ├── Tipo documento: DNI (01) / Carnet Extranjería (04) / RUC (07) / Pasaporte (11)
│   │   ├── Número de documento
│   │   └── Nombre del proveedor
│   │
│   ├── Items (FormArray dinámico)
│   │   ├── Nombre/descripción del producto
│   │   ├── Cantidad
│   │   ├── Precio unitario
│   │   ├── Descuento por item
│   │   └── Subtotal por item
│   │
│   ├── Cálculos Automáticos
│   │   ├── Gravadas (subtotal - descuentos)
│   │   ├── Op. Exoneradas
│   │   ├── Op. Inafectas
│   │   ├── Op. Gratuitas
│   │   ├── Descuentos totales
│   │   ├── ICBPER
│   │   ├── IGV (18%)
│   │   └── Total
│   │
│   ├── Importación XML
│   │   ├── Subir archivo .xml
│   │   ├── Parseo automático del XML (parseXmlCompra)
│   │   ├── Auto-completado de: tipo comprobante, serie, correlativo, fecha, moneda, proveedor
│   │   └── Auto-creación de items desde XML
│   │
│   └── Finalización
│       ├── Dispatch: crearCompra
│       ├── Limpieza del formulario
│       └── Recálculo de totales
│
├── 6.3 Subir Excel de Compras (SubirexcelComponent)
│   ├── Drag & drop de archivos .csv
│   ├── Múltiples archivos
│   ├── Preview: headers + 5 filas
│   ├── Detección de duplicados
│   ├── Validación de formato
│   ├── Nombre, tamaño, total de filas
│   └── Botón eliminar por archivo
│
└── 6.4 Detalle de Compra
    ├── Ver comprobante completo
    ├── Items detallados
    └── Archivos adjuntos (XML)
```

---

## 7. 📋 PEDIDOS

```
├── 7.1 Historial de Pedidos (ListallpedidosComponent)
│   ├── Tabla paginada de pedidos
│   ├── Filtros: fecha (desde/hasta), número pedido, método pago, estado, cliente
│   ├── Estados: COTIZADO / PENDIENTE / REALIZADO / CANCELADO
│   ├── Verificar stock disponible
│   └── Acciones: ver detalle, cambiar estado
│
├── 7.2 Registrar Pedido (RegistrarpedidoComponent)
│   ├── Selección de Cliente
│   │   ├── Modo "Buscar" → Cliente existente por DNI/RUC
│   │   ├── Modo "Nuevo" → Datos manuales
│   │   ├── Consulta API DNI/RUC
│   │   └── Auto-completado de datos
│   │
│   ├── Selección de Productos
│   │   ├── Búsqueda manual
│   │   ├── Escáner de código de barras (físico)
│   │   ├── Diálogo de selección
│   │   ├── Validación de stock
│   │   └── Incremento automático si duplicado
│   │
│   ├── Datos del Pedido
│   │   ├── Método de pago: YAPE, PLIN, Transferencia, Efectivo
│   │   ├── Observaciones (texto libre)
│   │   └── Descuentos por producto
│   │
│   ├── Cálculos Automáticos
│   │   ├── Subtotal, IGV (18%), Descuentos, Total
│   │   └── Recálculo en tiempo real
│   │
│   └── Finalización
│       ├── Dispatch: crearPedido
│       ├── Reset del formulario
│       └── Vista temporal del pedido
│
└── 7.3 Estados del Pedido
    ├── COTIZADO → PENDIENTE → REALIZADO → CANCELADO
    └── Transiciones controladas por permisos
```

---

## 8. 🚚 GUÍAS DE REMISIÓN

```
├── 8.1 Lista de Guías (ListaguiasComponent)
│   ├── Tabla paginada
│   ├── Filtros por fecha, estado
│   ├── Ver detalle de guía
│   └── Editar guía
│
├── 8.2 Crear/Editar Guía (FormguiaComponent)
│   ├── Datos Generales
│   │   ├── Fecha de emisión
│   │   ├── Fecha de traslado
│   │   └── Observaciones
│   │
│   ├── Remitente
│   │   ├── RUC (auto-completado de tienda)
│   │   ├── Razón social
│   │   ├── Dirección
│   │   └── Ubigeo
│   │
│   ├── Destinatario
│   │   ├── RUC (11 dígitos, validación)
│   │   ├── Razón social
│   │   ├── Dirección
│   │   └── Ubigeo
│   │
│   ├── Puntos de Traslado
│   │   ├── Punto de partida
│   │   └── Punto de llegada
│   │
│   ├── Transportista
│   │   ├── Razón social de empresa transportista
│   │   ├── RUC transportista
│   │   ├── Nombre del chofer
│   │   ├── DNI del chofer (8 dígitos)
│   │   ├── Placa del vehículo
│   │   └── Número de licencia
│   │
│   ├── Motivo de Traslado
│   │   └── VENTA (por defecto)
│   │
│   ├── Items (FormArray dinámico)
│   │   ├── Código del producto
│   │   ├── Descripción
│   │   ├── Unidad de medida: PIEZA, CAJA, KG, GALÓN, JUEGO, METRO, ROLLO, PAR, DOCENA
│   │   ├── Cantidad
│   │   └── Peso en KG
│   │
│   ├── Totales
│   │   ├── Peso total KG (mínimo 0.1)
│   │   └── Número de bultos (mínimo 1)
│   │
│   └── Finalización
│       ├── Dispatch: crearGuia
│       └── Validación de todos los campos requeridos
│
└── 8.3 Detalle de Guía (DetalleguiaComponent)
    ├── Vista completa de la guía
    ├── Datos del remitente y destinatario
    ├── Datos del transportista
    ├── Items detallados
    └── Estado de la guía
```

---

## 9. 👥 CLIENTES

```
├── 9.1 Mis Clientes (TableClientesComponent)
│   ├── Tabla paginada de clientes
│   ├── Búsqueda por nombre, DNI/RUC
│   ├── Datos: nombre, documento, dirección, teléfono, email
│   └── Infinite scroll
│
├── 9.2 Últimos Agregados
│   └── Lista de clientes registrados recientemente
│
├── 9.3 Estadísticas de Clientes (EstadisticasClientesComponent)
│   ├── Clientes más frecuentes (top 5)
│   ├── Clientes que más compraron (monto total)
│   ├── Nuevos clientes por semana (barras)
│   └── Nuevos clientes por mes (barras)
│
├── 9.4 Sorteos de Clientes (SorteosClientesComponent)
│   ├── Ruleta animada con clientes
│   ├── Selección aleatoria de ganador
│   ├── Animación de giro (4.2 segundos)
│   ├── Diálogo con ganador
│   └── Colores: rojo, naranja, dorado, verde, cyan, azul, índigo, violeta, rosa, fucsia
│
└── 9.5 Selección de Cliente para Venta (SelectclienteforsaleComponent)
    ├── Búsqueda por DNI/RUC
    ├── Lista de clientes existentes
    └── Selección rápida
```

---

## 10. 🏢 PROVEEDORES

```
├── 10.1 Listado de Proveedores (ListallproveedoresComponent)
│   ├── Tabla paginada
│   ├── Búsqueda por nombre, RUC
│   ├── Acciones: editar, eliminar
│   └── Infinite scroll
│
├── 10.2 Registrar Proveedor (RegistrarproveedorComponent)
│   ├── Nombre / Razón social
│   ├── RUC
│   ├── Datos de contacto
│   └── Formulario reactivo con validaciones
│
├── 10.3 Editar Proveedor (DialogupdateproveedorComponent)
│   └── Modificar todos los campos
│
└── 10.4 Eliminar Proveedor
    └── Confirmación antes de eliminar
```

---

## 11. 🏬 TIENDAS

```
├── 11.1 Lista de Tiendas (TabletiendasComponent)
│   ├── Tabla de tiendas
│   ├── Datos: nombre, RUC, dirección, estado
│   └── Acciones: editar, ver detalle
│
├── 11.2 Crear Tienda (DialogcreatetiendaComponent)
│   ├── Nombre (requerido)
│   ├── Razón social
│   ├── RUC
│   ├── Dirección
│   ├── Teléfono
│   ├── Email
│   ├── Serie de comprobantes
│   ├── Correlativo inicial Boleta
│   ├── Correlativo inicial Factura
│   ├── Correlativo inicial Nota Crédito
│   ├── Logo (subir imagen)
│   ├── Credenciales SOL (Sunat)
│   │   ├── Usuario SOL
│   │   └── Contraseña SOL
│   └── Asignar usuarios a la tienda
│
├── 11.3 Editar Tienda (DialogupdattiendaComponent)
│   └── Modificar todos los campos
│
├── 11.4 Seleccionar Tienda Activa (ChoosestoreComponent)
│   ├── Lista de tiendas del usuario
│   └── Cambio de tienda activa
│
└── 11.5 Detalle de Tienda (DialogdetailtiendaComponent)
    ├── Datos completos de la tienda
    ├── Usuarios asignados
    └── Estadísticas de la tienda
```

---

## 12. 👤 GESTIÓN DE USUARIOS

```
├── 12.1 Lista de Usuarios (TableusersComponent)
│   ├── Tabla paginada
│   ├── Datos: nombre, usuario, rol, estado, tienda
│   └── Acciones: editar, permisos, contraseña
│
├── 12.2 Crear Usuario (DialogcreateuserComponent)
│   ├── Username (requerido)
│   ├── Contraseña (requerido)
│   ├── Nombre
│   ├── Apellido
│   ├── Estado activo/inactivo
│   └── Asignar tienda
│
├── 12.3 Editar Usuario (DialogedituserpersmissionsComponent)
│   ├── Modificar datos personales
│   ├── Activar/desactivar
│   └── Asignar tienda
│
├── 12.4 Cambiar Contraseña (DialogupdatepasswordComponent)
│   ├── Contraseña actual
│   ├── Nueva contraseña
│   └── Confirmar contraseña
│
├── 12.5 Gestionar Permisos (DialogedituserpersmissionsComponent)
│   ├── 30+ permisos granulares
│   ├── Toggle por cada permiso
│   ├── Permisos de ventas, inventario, productos, categorías
│   ├── Permisos de proveedores, tiendas, usuarios
│   └── Visualización de permisos asignados
│
└── 12.6 Desactivar Cuenta
    └── Toggle desactivate_account
```

---

## 13. ⚙️ CONFIGURACIÓN

```
├── 13.1 Mi Cuenta (MyaccountComponent)
│   ├── Datos del usuario
│   │   ├── Username
│   │   ├── Nombre completo
│   │   ├── Email
│   │   ├── Fecha de registro
│   │   └── Rol
│   ├── Datos de la tienda
│   │   ├── Nombre
│   │   ├── RUC
│   │   ├── Dirección
│   │   └── Logo
│   └── Foto de perfil (photo_url)
│
├── 13.2 Seguridad (SeguridadComponent)
│   ├── Cambiar Contraseña
│   │   ├── Contraseña actual (mínimo 6 caracteres)
│   │   ├── Nueva contraseña (mínimo 6 caracteres)
│   │   ├── Confirmar contraseña
│   │   └── Botón con loading state
│   ├── Sesiones Recientes
│   │   ├── Chrome - Windows (IP, fecha, activa)
│   │   ├── App Mobile - Android (IP, fecha)
│   │   └── Firefox - Windows (IP, fecha)
│   ├── Enviar Mensaje al Admin
│   │   ├── Asunto
│   │   ├── Mensaje (mínimo 10 caracteres)
│   │   └── Confirmación de envío
│   └── Cerrar Sesión
│       ├── Limpieza de tokens
│       ├── Limpieza de usuario
│       ├── Limpieza de caché inventario
│       └── Redirección a /login
│
├── 13.3 Permisos (PermisossettingsComponent)
│   ├── Visualización de permisos asignados
│   ├── Acordion por categoría
│   │   ├── Ventas (crear, cancelar, ver)
│   │   ├── Inventario (crear, modificar, actualizar, eliminar, ver)
│   │   ├── Productos (crear, actualizar, eliminar, ver)
│   │   ├── Categorías (crear, modificar, eliminar, ver)
│   │   ├── Proveedores (crear, modificar, eliminar, ver)
│   │   ├── Tiendas (crear, modificar, eliminar, ver)
│   │   └── Usuarios (crear)
│   └── Switch por cada permiso (solo visualización)
│
└── 13.4 Temas (TemasSettingsComponent)
    ├── Toggle Modo Oscuro / Claro
    ├── Persistencia en localStorage
    ├── Detección automática del sistema operativo
    ├── Reset a tema del sistema
    └── Integración con TUI_DARK_MODE de Taiga UI
```

---

## 14. 🔧 ADMIN PANEL (Solo SuperUsuarios)

```
├── 14.1 Home Admin (AdminhomeComponent)
│   └── Panel de administración principal
│
├── 14.2 Historial Admin (AdminhistoryComponent)
│   └── Historial de actividad del sistema
│
├── 14.3 Configuración Admin (AdminsettingsComponent)
│   └── Configuración global del sistema
│
├── 14.4 Gestión de Tiendas (AdminmanagestoreComponent)
│   ├── Tabs: Gestión / Reportes / Configuración
│   ├── Tabla de todas las tiendas
│   ├── Crear tienda
│   └── Skeleton loading
│
└── 14.5 Detalle de Tienda (AdmintiendadetailComponent)
    ├── Datos completos de tienda
    ├── Usuarios asignados
    └── Estadísticas
```

---

## 15. 📱 FUNCIONALIDADES TÉCNICAS

```
├── 15.1 Multi-Plataforma
│   ├── Web (Angular 17)
│   │   ├── Build: ng build --configuration=production
│   │   ├── Dev: ng serve
│   │   └── Deploy: Vercel
│   ├── Android (Capacitor 7.4.3)
│   │   ├── capacitor.config.ts
│   │   ├── android/ (carpeta nativa)
│   │   └── Build: ng build && npx cap sync
│   └── Electron (Desktop)
│       ├── electron/main.js
│       ├── tsconfig.electron.json
│       └── Build: ng build && electron .
│
├── 15.2 UI/UX
│   ├── Taiga UI (v4.61+)
│   │   ├── @taiga-ui/core
│   │   ├── @taiga-ui/kit
│   │   ├── @taiga-ui/layout
│   │   ├── @taiga-ui/addon-table
│   │   ├── @taiga-ui/addon-charts
│   │   ├── @taiga-ui/addon-commerce
│   │   ├── @taiga-ui/addon-mobile
│   │   ├── @taiga-ui/legacy
│   │   └── @taiga-ui/experimental
│   ├── Tailwind CSS (v3.4+)
│   ├── Dark Mode
│   │   ├── Toggle global
│   │   ├── Persistencia en localStorage
│   │   ├── Detección del sistema
│   │   └── CSS: dark:bg-*, dark:text-*
│   ├── Responsive
│   │   ├── Sidebar desktop (fijo 14rem)
│   │   ├── Drawer mobile (tui-drawer)
│   │   └── Breakpoint: md (768px)
│   ├── Sidebar Colapsable
│   │   ├── Logo de tienda
│   │   ├── Links de navegación con iconos SVG
│   │   ├── Menú de usuario (dropdown)
│   │   │   ├── Avatar con iniciales
│   │   │   ├── Nombre y rol
│   │   │   ├── Mi Cuenta
│   │   │   ├── Seguridad
│   │   │   ├── Mis Permisos
│   │   │   ├── Tema (toggle)
│   │   │   └── Cerrar Sesión
│   │   └── Acceso condicional (Tiendas solo superuser)
│   └── Animaciones
│       ├── expandCollapse (300ms ease-in-out)
│       ├── Transiciones de tabs
│       └── Loading states
│
├── 15.3 State Management (NgRx v17)
│   ├── Actions (13 archivos)
│   │   ├── auth.actions.ts
│   │   ├── categoria.actions.ts
│   │   ├── cliente.actions.ts
│   │   ├── compra.actions.ts
│   │   ├── guia-remision.actions.ts
│   │   ├── inventario.actions.ts
│   │   ├── pedido.actions.ts
│   │   ├── producto.actions.ts
│   │   ├── proveedor.actions.ts
│   │   ├── tienda.actions.ts
│   │   ├── user.actions.ts
│   │   └── venta.actions.ts
│   ├── Reducers (13 archivos)
│   │   ├── Mismo esquema que actions
│   │   └── Estados tipados con interfaces
│   ├── Effects (14 archivos)
│   │   ├── Llamadas HTTP asíncronas
│   │   ├── Manejo de errores
│   │   └── Side effects (navegación, notificaciones)
│   ├── Selectors (12 archivos)
│   │   ├── Selección de estado
│   │   ├── Computed selectors
│   │   └── selectAuth, selectUser, selectPermissions, etc.
│   └── AppState (app.state.ts)
│       └── Interfaz global del estado
│
├── 15.4 Búsqueda
│   ├── ClienteSearchService → Búsqueda de clientes
│   ├── InventarioSearchService → Búsqueda de inventario
│   ├── ProductoSearchService → Búsqueda de productos
│   │   └── normalizeSku() → Normalización de códigos
│   └── Integración con NgRx (acciones de búsqueda)
│
├── 15.5 Impresión
│   └── QZ Tray (qz-tray v2.2.5)
│       ├── Conexión con impresoras térmicas
│       ├── Impresión de comprobantes
│       └── Tipos: @types/qz-tray
│
├── 15.6 Código de Barras
│   ├── Generador (JsBarcode v3.12.1)
│   │   ├── Generación de código desde SKU
│   │   └── Visualización en componente
│   ├── Escáner de Barras (BarcodeScannerComponent)
│   │   ├── Escáner por cámara (móvil)
│   │   └── Lectura de código
│   └── Escáner Físico
│       ├── HostListener: window:keypress
│       ├── Buffer de caracteres
│       ├── Timeout 100ms entre teclas
│       ├── Longitud mínima: 3 caracteres
│       └── Procesamiento al detectar Enter
│
├── 15.7 Gráficos
│   ├── CanvasJS Charts (@canvasjs/charts v3.16)
│   ├── ApexCharts (ng-apexcharts v2.0.4)
│   ├── AG Charts (ag-charts-angular v13.3.1)
│   ├── Taiga UI Charts
│   │   ├── TuiRingChart
│   │   ├── TuiPieChart
│   │   ├── TuiBarChart
│   │   └── TuiAxes
│   └── Gráficos customizados (SVG inline)
│
├── 15.8 Internacionalización
│   └── ngx-translate (@ngx-translate/core v15)
│
├── 15.9 Notificaciones
│   ├── TuiAlertService (Taiga UI)
│   │   ├── Tipos: success, error, warning, info
│   │   ├── Auto-dismiss
│   │   └── Labels descriptivos
│   └── ngx-toastr (v19)
│
├── 15.10 Otros
│   ├── Infinite Scroll (ngx-infinite-scroll v21)
│   ├── PWA (Service Worker - @angular/service-worker)
│   ├── Caché Local (IndexedDB via idb v8.0.3)
│   ├── Máscaras de entrada (@maskito v3.11)
│   │   ├── Teléfono
│   │   └── Formatos personalizados
│   ├── Telefonía (libphonenumber-js v1.13.7)
│   ├── URLs amigables (url-slug v4.0.1)
│   ├── Fechas (date-fns v4.1, dayjs v1.11.19)
│   ├── Intersección Observer (@ng-web-apis)
│   ├── Mutación Observer (@ng-web-apis)
│   ├── Resize Observer (@ng-web-apis)
│   ├── Orientación de pantalla (@ng-web-apis)
│   └── Scroll infinito (ngx-infinite-scroll)
│
├── 15.11 Servicios UI
│   ├── DialogService → Apertura de diálogos
│   ├── SidebarService → Control del sidebar
│   ├── CustomAlertService → Alertas personalizadas
│   └── 15 Dialog Services específicos
│       ├── DialogCreateCategoriaService
│       ├── DialogCreateInventarioService
│       ├── DialogCreateProductService
│       ├── DialogCreateUserService
│       ├── DialogCreateProveedorService
│       ├── DialogDetailTiendaService
│       ├── DialogEditInventarioService
│       ├── DialogEditUserPermissionsService
│       ├── DialogUpdatePasswordUserService
│       ├── DialogUpdateCategoriaService
│       ├── DialogUpdateProductService
│       ├── DialogUpdateProveedorService
│       ├── DialogUpdateTiendaService
│       ├── DialogVentaDetailService
│       └── DialogService (general)
│
└── 15.12 Utilidades
    ├── endpoints.ts → URL_BASE, URL_BASE_FRONT, api_version
    ├── http-auth-interceptor.ts → Interceptor JWT
    ├── localstorage-functions.ts → Gestión de localStorage
    ├── pages-sizes.ts → Tamaños de página
    ├── print-errors.ts → Manejo de errores
    ├── querys.ts → Construcción de queries
    ├── capitalize.ts → Capitalización de texto
    └── xml-parser.ts → Parseo de XML de compras
```

---

## 16. 🔌 SERVICIOS BACKEND (API)

```
├── 16.1 Auth
│   ├── POST /api/auth/jwt/create/custom/ → Login
│   ├── POST /auth/jwt/verify/ → Verificar token
│   └── GET /auth/users/me/ → Datos del usuario autenticado
│
├── 16.2 Consultas Externas
│   ├── POST /api/consulta-documento/ → Consultar DNI
│   └── POST /api/consulta-documento/ → Consultar RUC
│
├── 16.3 CRUDs
│   ├── Categorías → /api/categorias/
│   ├── Clientes → /api/clientes/
│   ├── Compras → /api/compras/
│   ├── Guías de Remisión → /api/guias-remision/
│   ├── Inventario → /api/inventario/
│   ├── Pedidos → /api/pedidos/
│   ├── Productos → /api/productos/
│   ├── Proveedores → /api/proveedores/
│   ├── Tiendas → /api/tiendas/
│   ├── Usuarios → /api/usuarios/
│   ├── Ventas → /api/ventas/
│   └── Consultas (estadísticas) → /api/consultas/
│
└── 16.4 Modelos de Datos (12 interfaces)
    ├── auth.models.ts → AuthState, Tokens, UserAuth, LoginType
    ├── categoria.models.ts → Categoria
    ├── cliente.models.ts → Cliente
    ├── compra.models.ts → CompraProveedor, CompraItem, ComprobanteCompra, CreateCompra
    ├── guia-remision.models.ts → GuiaRemisionRemitente, Transportista, GuiaRemisionItem
    ├── inventario.models.ts → Inventario, InventarioCreate
    ├── pedido.models.ts → Pedido, PedidoProducto, CreatePedido, PedidoSearchFilters
    ├── producto.models.ts → Producto, ProductoCreate, ProductoState
    ├── proveedor.models.ts → Proveedor
    ├── tienda.models.ts → Tienda, TiendaCreate, TiendaState
    ├── user.models.ts → User, UserPermissions, CreateUser
    └── venta.models.ts → Venta, VentaProducto, CreateVenta, ComprobanteElectronico, NotaCredito
```

---

## 17. 📁 ESTRUCTURA DE COMPONENTES

```
src/app/
├── components/
│   ├── barcode/ → Generación de código de barras
│   ├── bardcode-scanner/ → Escáner de código de barras
│   ├── buttonupdate/ → Botón de actualización
│   ├── choosestore/ → Selector de tienda
│   ├── clientescomponents/
│   │   ├── estadisticas-clientes/ → Gráficos de clientes
│   │   └── sorteos-clientes/ → Ruleta de sorteos
│   ├── comprascomponents/
│   │   ├── listallcompras/ → Historial de compras
│   │   ├── registrarcompra/ → Formulario de compra
│   │   └── subirexcel/ → Subir CSV de compras
│   ├── dashboardcomponents/
│   │   ├── chartsalesbetweentwodates/ → Gráfico de ventas por fecha
│   │   ├── dashboard-latest-sales/ → Últimas ventas
│   │   ├── dashboard-low-stock/ → Stock bajo
│   │   ├── dashboard-new-products/ → Nuevos productos
│   │   ├── dashboard-payment-methods/ → Métodos de pago
│   │   ├── dashboard-pending-orders/ → Pedidos pendientes
│   │   ├── dashboard-products-most-sales/ → Top productos
│   │   ├── dashboard-sales-cards/ → Tarjetas de resumen
│   │   └── graficos-inicio/ → Gráficos del dashboard
│   ├── darkmode/ → Toggle modo oscuro
│   ├── Dialogs/ (17 diálogos)
│   │   ├── dialogcreatecategoria/
│   │   ├── dialogcreateinventario/
│   │   ├── dialogcreateproduct/
│   │   ├── dialogcreateproveedor/
│   │   ├── dialogcreatetienda/
│   │   ├── dialogcreateuser/
│   │   ├── dialogdetailtienda/
│   │   ├── dialogdevolucion/
│   │   ├── dialogeditinventario/
│   │   ├── dialogedituserpersmissions/
│   │   ├── dialogselectproducts/
│   │   ├── dialogupdatecategoria/
│   │   ├── dialogupdatepassword/
│   │   ├── dialogupdateproduct/
│   │   ├── dialogupdateproveedor/
│   │   ├── dialogupdattienda/
│   │   └── dialogventadetail/
│   ├── Forms/
│   │   ├── formaddstore/ → Formulario de tienda
│   │   └── formproveedor/ → Formulario de proveedor
│   ├── guiaremisioncomponents/
│   │   ├── detalleguia/ → Detalle de guía
│   │   ├── formguia/ → Formulario de guía
│   │   └── listaguias/ → Lista de guías
│   ├── header/ → Barra superior
│   ├── pedidoscomponents/
│   │   ├── listallpedidos/ → Historial de pedidos
│   │   └── registrarpedido/ → Formulario de pedido
│   ├── productoscomponents/
│   │   ├── alertas-stock/ → Alertas de stock bajo
│   │   ├── graficos-productos/ → Gráficos de productos
│   │   └── subircsvproductos/ → Subir CSV de productos
│   ├── proveedorescomponents/
│   │   ├── listallproveedores/ → Lista de proveedores
│   │   └── registrarproveedor/ → Formulario de proveedor
│   ├── selectclienteforsale/ → Selector de cliente para venta
│   ├── settingscomponents/
│   │   ├── myaccount/ → Mi cuenta
│   │   ├── perfilsettings/ → Perfil
│   │   ├── permisossettings/ → Permisos
│   │   ├── seguridad/ → Seguridad
│   │   ├── settingslayout/ → Layout de configuración
│   │   └── temassettings/ → Temas
│   ├── sidenav/ → Sidebar de navegación
│   ├── sidenavadmin/ → Sidebar de administración
│   ├── Tables/ (7 tablas)
│   │   ├── tablecategories/
│   │   ├── tableclientes/
│   │   ├── tableinventario/
│   │   ├── tableproduct/
│   │   ├── tableproveedor/
│   │   ├── tabletiendas/
│   │   └── tableusers/
│   └── ventascomponents/
│       ├── canceledsales/ → Ventas anuladas
│       ├── listallventas/ → Historial de ventas
│       ├── mostsalesproducts/ → Top productos
│       ├── todaysale/ → Última venta
│       └── todaysalestable/ → Ventas de hoy
│
├── guards/ → 5 guards de autenticación
├── layouts/
│   ├── adminlayout/ → Layout de administración
│   ├── authlayout/ → Layout de autenticación
│   └── mainlayout/ → Layout principal
├── models/ → 12 modelos de datos
├── pages/ → 16 páginas principales
├── services/ → 19 servicios
├── state/ → NgRx (actions, reducers, effects, selectors)
└── utils/ → Utilidades (barcode, xml-parser)
```

---

## 📊 RESUMEN ESTADÍSTICO

| Categoría | Cantidad |
|-----------|----------|
| Páginas principales | 16 |
| Componentes | ~120+ |
| Servicios | 19 |
| Modelos de datos | 12 |
| Guards | 5 |
| NgRx Actions | 13 |
| NgRx Reducers | 13 |
| NgRx Effects | 14 |
| NgRx Selectors | 12 |
| Diálogos | 17 |
| Tablas | 7 |
| Utilidades | 8 |

---

**Sistema completo de inventario multi-plataforma con:**
- POS (punto de venta) con escáner de código de barras
- Facturación electrónica SUNAT (Boleta, Factura, Nota de Crédito)
- Gestión de inventario multi-tienda
- Control de pedidos con estados (Cotizado → Pendiente → Realizado → Cancelado)
- Registro de compras con importación XML
- Guías de remisión con transportista
- RBAC con 30+ permisos granulares
- Dashboard con gráficos y estadísticas
- Dark mode con persistencia
- Despliegue: Web, Android (Capacitor), Desktop (Electron)
