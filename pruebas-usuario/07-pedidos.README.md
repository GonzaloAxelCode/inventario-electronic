# 07 — Pedidos — Pruebas de Usuario (AMPLIADO)

> Ruta: `/app/pedidos` · Estados: COTIZADO → PENDIENTE → REALIZADO → CANCELADO

## 1. Historial — filtros

- [ ] Paginado ok; filtros fecha/número/método/estado/cliente solos y combinados
- [ ] Fecha invertida → error; número parcial `12` encuentra `PED-0012`
- [ ] Método YAPE/PLIN/Efectivo/Transferencia + estado cada uno filtran; limpiar restaura
- [ ] Stock disponible muestra real (comparar con inventario)

## 2. Formulario — campo por campo

- [ ] Cliente Buscar DNI/RUC existente autocompleta; inexistente → opción nuevo
- [ ] Doc longitud errónea / letras → bloquea; Nuevo sin nombre → bloquea
- [ ] API DNI/RUC caída → manual + aviso
- [ ] Producto buscar/escáner/diálogo agregan; inexistente → vacío
- [ ] Stock 5 intentar 6 → bloquea/limita; stock 0 → bloquea
- [ ] Duplicado suma cantidad; cantidad 0/-1/9999/abc → valida
- [ ] Observaciones vacía ok; 500 car. + emojis + saltos ok; `<script>` como texto
- [ ] Método pago cada uno se guarda; vacío → bloquea
- [ ] Descuento > subtotal → bloquea, nunca negativo
- [ ] Totales recalculan instantáneo; caso 3×50−30 + IGV = verificar exacto
- [ ] Doble clic crear → 1 pedido; sin internet → error sin fantasma

## 3. Estados — qué pasaría si...

- [ ] COTIZADO→PENDIENTE→REALIZADO en orden ok, cada cambio pide confirmación
- [ ] Saltar COTIZADO→REALIZADO → ¿permite? anotar
- [ ] PENDIENTE→COTIZADO atrás → ¿permite? anotar
- [ ] CANCELADO pide motivo; vacío bloquea; cancelado no vuelve a REALIZADO
- [ ] REALIZADO descuenta stock; CANCELADO no; COTIZADO/PENDIENTE no descuentan (verificar)
- [ ] REALIZADO aparece/convierte a venta según flujo (anotar)
- [ ] Cambiar estado 2 veces rápido → 1 transición, no corrupto
- [ ] Sin permiso cambio estado → botón oculto; URL directa bloqueada
- [ ] Pedido REALIZADO con producto luego eliminado → detalle sigue visible

## Fallas encontradas

```text
ID-FALLA:
Pasos / Dato usado:
Esperado / Obtenido:
Severidad:
```
