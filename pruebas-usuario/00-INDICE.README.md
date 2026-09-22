# 00 — Índice de Pruebas de Usuario — Inventario Web Axel

> Cómo usar esta carpeta: abre el README del módulo a testear, marca cada casilla `- [ ]` → `- [x]` cuando pase, y reporta fallas al final del archivo con la plantilla dada.
> Leyenda: `[ ]` pendiente · `[x]` pasa · `[!]` falla (anota ID de falla).

## Módulos

- [ ] `01-autenticacion-y-accesos.README.md` — Login, guards, tokens, permisos RBAC
- [ ] `02-dashboard.README.md` — Tarjetas, gráficos, stock bajo, últimas ventas
- [ ] `03-ventas-pos.README.md` — Hacer venta, cliente DNI/RUC, comprobante SUNAT, anulaciones, devoluciones
- [ ] `04-productos-y-categorias.README.md` — CRUD producto, categorías, barcode, CSV, alertas stock
- [ ] `05-inventario.README.md` — CRUD inventario, búsqueda SKU, stock min/max, multi-tienda
- [ ] `06-compras.README.md` — Registrar compra, XML, Excel/CSV, cálculos IGV
- [ ] `07-pedidos.README.md` — Registrar pedido, estados COTIZADO→PENDIENTE→REALIZADO→CANCELADO
- [ ] `08-guias-remision.README.md` — Crear/editar guía, remitente, destinatario, transportista, items
- [ ] `09-clientes.README.md` — CRUD clientes, estadísticas, sorteos/ruleta
- [ ] `10-proveedores.README.md` — CRUD proveedores
- [ ] `11-tiendas-y-multitienda.README.md` — CRUD tiendas, choose store, correlativos, credenciales SOL
- [ ] `12-usuarios-y-permisos.README.md` — CRUD usuarios, contraseñas, 30+ permisos
- [ ] `13-configuracion-y-cuenta.README.md` — Mi cuenta, seguridad, permisos vista, temas dark/light, suscripción, mi-tienda, módulos
- [ ] `14-ganancias.README.md` — Página ganancias (filtros, cálculos, reportes)
- [ ] `15-admin.README.md` — Panel admin, gestión tiendas, planes, config global
- [ ] `16-transversal.README.md` — Responsive, PWA/offline, impresión QZ, scanner, notificaciones, rendimiento, seguridad

## Datos base sugeridos para todas las pruebas

- [ ] Tener 2 tiendas creadas (Tienda A / Tienda B)
- [ ] Tener 2 usuarios: `admin_superuser` (is_superuser=true) y `vendedor_normal` (solo can_make_sale + view_*)
- [ ] Tener 3 categorías, 5 productos (con SKU, con/sin imagen, con stock 0, stock 2, stock 50)
- [ ] Tener 2 clientes (DNI 8 dígitos + RUC 11 dígitos) y 1 proveedor con RUC válido
- [ ] Anotar URL testeada (local / vercel / electron / android) y fecha en cada reporte

## Plantilla de reporte de falla (copiar al final de cada README)

```text
ID-FALLA: MOD-001
Módulo / pantalla:
Pasos:
Dato usado:
Esperado:
Obtenido (error textual + captura):
Severidad: [bloqueante / alta / media / baja]
Rol usado: [superuser / normal / sin login]
Navegador/dispositivo:
¿Reproducible? [si / no / a veces]
```
