# 10 — Proveedores — Pruebas de Usuario (AMPLIADO)

> Ruta: `/app/proveedores`

## 1. Lista y formulario campo por campo

- [ ] Buscar `ferre`, `FERRE`, RUC parcial encuentran; `zzz` → vacío
- [ ] Crear nombre/razón vacío/espacios → bloquea; 100 car. `Ferretería Ñandú S.A.C. &` ok
- [ ] RUC 11 ok; 8/10/letras → bloquea; `20000000001` ok
- [ ] RUC duplicado con/without espacios → rechaza
- [ ] Contacto nombre/teléfono/email: teléfono letras → bloquea; email `a@b` → bloquea; vacíos ¿permiten? anotar
- [ ] Dirección 150 car. ok; documento tipo DNI 8 / CE 9 / RUC 11 / Pasaporte 12 cada uno valida longitud
- [ ] Doble clic → 1 proveedor; aparece en lista y en combo compras
- [ ] Editar persiste; eliminar pide confirmación
- [ ] Eliminar con compras → ¿bloquea? probar: historial compras no se rompe (no `proveedor null`)
- [ ] Nombre `<script>` como texto; permisos create/modify/delete/view se respetan

## Fallas encontradas

```text
ID-FALLA:
Pasos / Dato usado:
Esperado / Obtenido:
Severidad:
```
