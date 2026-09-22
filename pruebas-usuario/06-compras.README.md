# 06 — Compras — Pruebas de Usuario (AMPLIADO)

> Ruta: `/app/compras` (Listallcompras + Registrarcompra + Subirexcel)
> Precondición: proveedor RUC, XML SUNAT real + XML corrupto + CSV válido/inválido.

## 1. Historial y detalle

- [ ] Paginado sin duplicados; filtros fecha/proveedor/tipo solos y combinados
- [ ] Filtro fecha invertida → error; rango 2 años → carga con loading
- [ ] Detalle muestra comprobante+items+XML; XML descarga y abre válido
- [ ] Compra con 50 items scrollea sin congelar

## 2. Formulario — campo por campo qué pasaría si...

- [ ] Tipo Factura 01 / Boleta 03 / otro → código correcto; vacío → bloquea
- [ ] Serie `F001` ok; vacía/ `###` / 20 car. → valida formato
- [ ] Correlativo `123` ok; `0`/negativo/texto/duplicado serie+correlativo → bloquea/avisa duplicado
- [ ] Emisión vacía/futura `2030-01-01` → bloquea/avisa
- [ ] Vencimiento < emisión en Crédito → avisa; en Contado vacío ok
- [ ] Contado/Crédito + PEN/USD cada combo se guarda; USD muestra símbolo/tipo cambio (anotar)
- [ ] Proveedor tipo DNI 8 / CE 9 / RUC 11 / Pasaporte 12: probar longitudes ±1 → bloquea
- [ ] Doc con letras → bloquea; duplicado proveedor → sugiere existente
- [ ] Nombre proveedor vacío → bloquea; 100 car. + `Ñ&Co.` ok
- [ ] Item nombre vacío → bloquea; cantidad `0`/`-2`/`abc`/`2.5` → valida; precio `0`/negativo/texto → valida
- [ ] Descuento > subtotal item → bloquea o deja 0, nunca negativo
- [ ] 20 items agregan bien; quitar 1 recalcula; vaciar todo bloquea guardar
- [ ] Caso cálculo: 10×100−10 + 5×50 = grav 1340 + IGV 241.2 = total 1581.2 exacto
- [ ] Exoneradas/Inafectas/Gratuitas/ICBPER: poner 1 de cada una suma bien
- [ ] Doble clic Guardar → 1 sola compra; sin internet → error sin fantasma
- [ ] Tras guardar limpia form y aparece en historial con totales iguales

## 3. XML y Excel — casos

- [ ] XML SUNAT válido autocompleta tipo/serie/correlativo/fecha/moneda/proveedor+items exactos
- [ ] XML con tildes/ñ `PEÑA` → muestra bien, no `??`
- [ ] XML corrupto (abrir en notepad y borrar mitad) → error claro, no crea vacía
- [ ] XML no-SUNAT (cualquiera) → rechaza
- [ ] XML 50 items → crea 50 sin congelar; XML 0 items → avisa
- [ ] 2 XML mismo correlativo → segundo avisa duplicado
- [ ] CSV 1 archivo preview headers+5 filas+nombre/tamaño/filas; 5 archivos lista c/u con eliminar
- [ ] CSV duplicado 2 veces → detecta; CSV separador `;` vs `,` → detecta o avisa (anotar)
- [ ] CSV con `"a, b"` entre comillas no parte columna; con saltos línea ok
- [ ] .txt/.xlsx renombrado, vacío 0KB, 10k filas → rechaza o maneja sin congelar

## Fallas encontradas

```text
ID-FALLA:
Pasos / Dato usado:
Esperado / Obtenido:
Severidad:
```
