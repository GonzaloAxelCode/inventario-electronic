# 05 — Inventario — Pruebas de Usuario (AMPLIADO)

> Ruta: Inventario (TableinventarioComponent)
> Precondición: Tienda A/B, productos P1/P2/P3, items stock 0 / 3 / 50.

## 1. Tabla — filtros qué pasaría si...

- [ ] Buscar `cafe`, `CAFE`, ` cafe ` encuentra igual; `zzz` → vacío amigable
- [ ] Filtro tienda A muestra solo A; B solo B; Todas ambas
- [ ] Filtro categoría + estado + búsqueda combinados
- [ ] Cambiar página mantiene filtros; limpiar restaura
- [ ] Stock 0 rojo/crítico visible; stock negativo (si sale) marca error
- [ ] Columnas producto/tienda/cantidad/costo/estado siempre llenas, nunca `undefined`

## 2. Crear — campo por campo

- [ ] Producto vacío → bloquea; escribir 2 letras sugiere coincidencias
- [ ] Elegir producto inexistente a mano → bloquea
- [ ] Tienda vacía → bloquea; tienda inactiva → bloquea
- [ ] Cantidad vacía/texto `abc`/ `-5` / `2.5` / `99999999` → valida (solo entero >=0, tope anotar)
- [ ] Cantidad 0 → permite pero avisa que quedará crítico
- [ ] Stock mínimo vacío/texto/negativo → valida; mínimo 5 + cantidad 3 → aparece en alertas
- [ ] Stock máximo < mínimo (min 10 max 5) → bloquea/avisa
- [ ] Máximo 0 → bloquea
- [ ] Costo compra vacío/0/texto/negativo → anotar regla; `10.50` decimales ok
- [ ] Costo venta 0 → anotar; venta < compra (10 vs 5) → ¿avisa pérdida?
- [ ] Venta con 3 decimales `9.999` → redondea o bloquea (anotar)
- [ ] Lote vacío ok; 30 car. raros ok
- [ ] Vencimiento pasado → avisa; futuro ok; vacío ok
- [ ] Responsable auto = yo; no deja elegir otro (anotar)
- [ ] Descripción 300 car. + emojis ok
- [ ] Duplicado producto+tienda → bloquea con mensaje (ideal) o suma (anotar)
- [ ] Mismo producto otra tienda → permite
- [ ] Doble clic Guardar → solo 1 item
- [ ] Sin internet → error + no crea fantasma

## 3. Editar / Eliminar / Búsqueda + consistencia

- [ ] Editar cantidad 50→5 → entra a stock bajo; 5→0 → crítico
- [ ] Editar min/max/costos/estado persisten tras F5
- [ ] Desactivar → no sale en POS ni búsqueda venta, sí en tabla con etiqueta
- [ ] Eliminar pide confirmación; con movimientos asociados → ¿bloquea? anotar
- [ ] `normalizeSku`: `ABC-123` = `abc123` = `ABC 123`
- [ ] Vender X descuenta; anular devuelve; compra suma (si aplica) — probar cadena completa
- [ ] 2 usuarios editan mismo item a la vez → no corrompe
- [ ] Sin `can_create/modify/update/delete_inventory` cada botón se oculta/bloquea

## Fallas encontradas

```text
ID-FALLA:
Pasos / Dato usado:
Esperado / Obtenido:
Severidad:
```
