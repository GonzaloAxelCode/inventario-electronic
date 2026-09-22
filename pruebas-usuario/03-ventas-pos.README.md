# 03 — Ventas / POS — Pruebas de Usuario (AMPLIADO)

> Rutas: `/app/ventas`, `/app/ventas/crear` (HacerventaComponent)
> Precondición: cliente DNI, cliente RUC, anónimo, productos stock 0/2/50, sin imagen, costo 0, tienda con serie+correlativos.

## 1. Historial (ListallventasComponent) — filtros y descargas

- [ ] Tabla paginada carga sin duplicados ni saltos al cambiar página
- [ ] Filtro fecha desde=hoy/hasta=hoy → solo hoy; desde>hasta → error controlado
- [ ] Filtro rango 1 año → carga <5s con loading
- [ ] Filtro cliente por nombre parcial, DNI, RUC → encuentra; sinMatch → vacío amigable
- [ ] Filtro método YAPE/PLIN/Efectivo/Transferencia → cada uno filtra; "Todos" restaura
- [ ] Filtros combinados fecha+cliente+método funcionan juntos
- [ ] Limpiar filtros restaura todo
- [ ] Clic detalle abre comprobante correcto (no el de la fila vecina)
- [ ] Descarga XML abre como XML válido; PDF abre y muestra totales; CDR descarga; Ticket imprime formato térmico
- [ ] Descargar con wifi caído → error claro, no archivo corrupto 0KB
- [ ] Estado SUNAT Aceptado/Observado/Rechazado/Enviando muestra etiqueta + tooltip motivo si hay

## 2. Ventas hoy / última / anuladas / top

- [ ] Todaysalestable solo hoy, totales = suma manual
- [ ] A las 00:05 del día siguiente la lista se vacía (cambio de día)
- [ ] Todaysale muestra la última (crear una y verificar que cambia)
- [ ] Canceledsales solo CANCELADO con motivo; anular una y verificar que aparece aquí y desaparece de hoy
- [ ] Mostsalesproducts ranking coincide con cantidades (vender 5x prodA y 1x prodB → A primero)

## 3. Crear venta — Cliente a fondo

- [ ] Buscar DNI 8 dígitos existente → autocompleta nombre/dirección
- [ ] Buscar DNI inexistente → permite crear nuevo o muestra no-encontrado + opción nuevo
- [ ] Buscar DNI 7 / 9 dígitos → bloquea por longitud
- [ ] Buscar DNI con letras `1234abcd` → bloquea
- [ ] Buscar RUC 11 existente → autocompleta razón/dirección
- [ ] RUC 10 / 12 dígitos → bloquea
- [ ] API `/api/consulta-documento/` ok → autocompleta; API caída/timeout → permite manual + aviso
- [ ] API devuelve nombre distinto al guardado → ¿sobrescribe o respeta local? anotar
- [ ] Modo Nuevo manual: guardar sin nombre → bloquea; sin documento (Anónima) → permite
- [ ] Boleta + DNI ok; Boleta + RUC → verificar regla (¿permite? anotar)
- [ ] Factura + RUC ok; Factura + DNI → debe bloquear
- [ ] Anónima sin cliente → permite y comprobante sale sin datos cliente
- [ ] Toggle guardar-cliente crea el cliente (buscarlo luego en /clientes)
- [ ] Cliente con nombre `José Ñandú <test>` / 100 car. / emojis → se guarda y muestra bien en comprobante
- [ ] Cambiar de cliente a mitad de venta no borra productos

## 4. Crear venta — Productos a fondo

- [ ] Buscar `cafe` encuentra `Café Molido` (tildes/case-insensitive)
- [ ] Buscar por SKU exacto, con guiones/espacios/minúsculas encuentra (normalizeSku)
- [ ] Buscar texto inexistente `zzz999` → vacío, no error
- [ ] Pistola física lee y agrega (probar 3 pitidos seguidos → 3 cantidades, no 3 filas)
- [ ] Cámara móvil escanea QR/barras con buena y mala luz
- [ ] Código de 2 caracteres → ignora (mín 3); código con Enter agrega
- [ ] Diálogo selectproducts: elegir 5 de una vez los agrega todos
- [ ] Stock 0 → bloquea con aviso; stock 2 intentar vender 3 → bloquea o limita a 2
- [ ] Costo 0 → avisa/bloquea según regla
- [ ] Precio con decimales 9.99 × 3 = 29.97 exacto (no 29.969999)
- [ ] Duplicado incrementa cantidad; eliminar fila recalcula; vaciar todo muestra total 0 + bloquea cobrar
- [ ] Cantidad 0 / -1 / 999999 / texto `abc` → valida
- [ ] Descuento mayor al subtotal → bloquea o deja en 0, nunca negativo
- [ ] Descuento 100% → total 0 pero permite emitir (anotar)
- [ ] Producto sin imagen → placeholder; imagen rota no rompe tabla
- [ ] Cambiar tienda a mitad de venta → ¿limpia productos o mantiene? anotar (ideal limpiar/avisar)

## 5. Pagos, comprobante, cálculos — qué pasaría si...

- [ ] YAPE/PLIN/Transferencia/Efectivo cada uno se guarda y filtra luego
- [ ] Contado por defecto; probar cambiar si hay Crédito (anotar)
- [ ] Boleta/Factura/Anónima cambian serie correlativo (verificar serie distinta)
- [ ] Toggle SUNAT ON vende y marca Enviando/Aceptado; OFF vende sin enviar
- [ ] SUNAT caído con toggle ON → venta se guarda local + marca Observado/Rechazado, no se pierde
- [ ] Subtotal/caso real: 2×100 −10 + 5×20 = verificar 290 + IGV 18% = total exacto con calculadora
- [ ] IGV incluido vs más IGV: verificar si precio ya incluye IGV (anotar regla para no duplicar)
- [ ] Recálculo instantáneo al editar cantidad/descuento sin F5
- [ ] Crear → POST + updateStockMultiple descuentan (ver stock antes/después)
- [ ] Tras éxito muestra comprobante temporal + limpia form para la siguiente
- [ ] Doble clic Cobrar → solo 1 venta (revisar que no crea 2 correlativos)
- [ ] Cerrar pestaña a mitad del POST → ¿crea o no? verificar en historial (ideal no duplicar)
- [ ] Sin internet al cobrar → error + no descuenta stock fantasma
- [ ] Serie agotada / correlativo duplicado → error claro, no comprobante repetido
- [ ] Venta de 50 líneas → tabla scrollea, total calcula, no se congela

## 6. Anulación, nota crédito, devoluciones

- [ ] Anular pide motivo obligatorio; vacío → bloquea
- [ ] Anular devuelve stock (antes/después)
- [ ] Anulada sale de totales hoy y entra a canceladas
- [ ] Anular 2 veces la misma → bloquea segunda
- [ ] Nota crédito genera su serie/correlativo, referencia a la original
- [ ] Devolución parcial (2 de 5) ajusta stock +2 y registra motivo
- [ ] Devolución total equivale a anular (anotar)
- [ ] Sin `can_cancel_sale` no ve anular/devolver

## 7. Flujo cruzado venta→inventario→ganancias→dashboard

- [ ] Vender → inventario baja → ganancias suben → dashboard hoy sube (mismo monto en los 4)
- [ ] Anular → los 4 vuelven atrás

## Fallas encontradas

```text
ID-FALLA:
Pasos / Dato usado:
Esperado / Obtenido:
Severidad:
```
