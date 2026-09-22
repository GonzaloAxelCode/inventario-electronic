# 04 — Productos y Categorías — Pruebas de Usuario (AMPLIADO)

> Ruta: `/app/productos`
> Precondición: 2 categorías, 1 producto con imagen, 1 sin imagen, 1 desactivado.

## 1. Lista — búsqueda y tabla

- [ ] Paginado no duplica; infinite scroll suma sin saltos
- [ ] Buscar `cafe` encuentra `CAFÉ`, `cafe-molido`, ` Café ` (normalizado)
- [ ] Buscar SKU `abc-123` encuentra `ABC123`, `abc 123`, `ABC-123`
- [ ] Buscar `zzz000` sinMatch → vacío amigable
- [ ] Filtro categoría A/B/Todas + búsqueda combinados
- [ ] Orden (si hay) por nombre/precio/stock funciona
- [ ] Fila muestra imagen o placeholder, nunca icono roto
- [ ] Editar/eliminar/detalle abren el producto de esa fila (probar fila 1 vs 5)

## 2. Crear producto — campo por campo

- [ ] Nombre vacío → bloquea; solo espacios → bloquea
- [ ] Nombre 1 carácter `A` → ¿permite? anotar; 150 car. → ¿corta o permite?
- [ ] Nombre `<script>alert(1)</script>` → se guarda como texto, no ejecuta en lista
- [ ] Nombre duplicado exacto → ¿permite o avisa? anotar
- [ ] Descripción vacía → permite; 500 car. + emojis + saltos línea → se guarda y muestra bien
- [ ] SKU vacío → ¿autogenera o exige? anotar
- [ ] SKU duplicado `ABC-1` vs `abc1` → debe detectar duplicado normalizado
- [ ] SKU con `/`, `ñ`, espacios, `000123` con ceros → se guarda y barcode no crash
- [ ] Categoría vacía → bloquea; crear con categoría recién creada aparece al instante
- [ ] Marca/modelo vacíos → permite; con 50 car. raros → guarda
- [ ] Precio vacío/texto/0/negativo `−5`/ `9.999` → valida (solo >0 con 2 decimales)
- [ ] Precio 9999999 → ¿permite? anotar tope
- [ ] Costo (si existe) 0 → anotar regla; costo > precio → ¿avisa pérdida?
- [ ] Stock inicial (si está en producto) negativo/texto → bloquea
- [ ] Imagen JPG/PNG/WebP ok + preview; >5MB avisa; .pdf/.exe/.svg con script → rechaza
- [ ] Sin imagen → guarda con placeholder
- [ ] Características JSON: agregar 3 pares ok; clave vacía → bloquea; valor 200 car. ok
- [ ] JSON con comillas/código `<b>` → se muestra como texto, no ejecuta
- [ ] Guardar con doble clic → solo 1 producto (no duplicado)
- [ ] Tras crear aparece en lista + en buscador inventario + en POS

## 3. Editar / Eliminar — qué pasaría si...

- [ ] Editar nombre/precio/categoría + recargar → persiste
- [ ] Cambiar SKU a uno existente → rechaza
- [ ] Cambiar imagen → nueva se ve, vieja no queda link roto
- [ ] Quitar imagen → vuelve a placeholder
- [ ] Eliminar pide confirmación; Cancelar no borra
- [ ] Eliminar con stock >0 → ¿bloquea o permite? anotar + revisar inventario queda coherente
- [ ] Eliminar con ventas asociadas → historial ventas sigue mostrando ese producto (no se rompe)
- [ ] Eliminar ya eliminado (doble clic) → error controlado
- [ ] Sin `can_update_product` no ve editar; sin `can_delete_product` no ve eliminar
- [ ] Editar en 2 pestañas a la vez → último guardado gana sin corromper

## 4. Categorías a fondo

- [ ] Crear `Bebidas` ok; duplicada `bebidas` minúsculas → rechaza
- [ ] Nombre vacío/espacios → bloquea; 80 car. → anotar; con emojis → guarda/muestra
- [ ] Editar nombre se refleja en filtro productos y en producto detalle
- [ ] Eliminar vacía → ok; con 10 productos → ¿bloquea o deja huérfanos? probar y anotar
- [ ] Eliminar + crear mismo nombre de nuevo → permite
- [ ] Permisos create/modify/delete/view category se respetan uno por uno

## 5. Barcode, gráficos, alertas, CSV — casos

- [ ] Barcode genera para SKU normal, con ceros, largo 20, con `ñ-/` (anotar cuáles fallan)
- [ ] Barcode se imprime legible y pistola lo lee de vuelta
- [ ] Gráficos con 0 ventas → vacíos, no crash; con 1000 ventas → cargan <5s
- [ ] Tooltip valores coinciden con tabla
- [ ] Alertas: 0-3 Crítico, 4-10 Advertencia, 11+ Ok; stock negativo (si existe) → marca error
- [ ] CSV válido → preview headers+10 filas + nombre/tamaño/filas; importar crea productos
- [ ] CSV sin headers / columnas cambiadas / filas vacías / 2000 filas → error o importa parcial con reporte (anotar)
- [ ] CSV con SKU duplicado interno → detecta y avisa línea
- [ ] CSV con comas dentro de `"nombre, con coma"` → parsea bien, no parte columna
- [ ] Archivo .xlsx renombrado .csv / .txt / vacío 0KB → rechaza con mensaje
- [ ] Quitar archivo limpia todo y permite subir otro

## Fallas encontradas

```text
ID-FALLA:
Pasos / Dato usado:
Esperado / Obtenido:
Severidad:
```
