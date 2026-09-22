# 11 — Tiendas y Multi-tienda — Pruebas de Usuario (AMPLIADO)

> Ruta: `/app/tiendas` + Choosestore · Precondición: superuser + normal solo Tienda A.

## 1. Lista/detalle/crear campo por campo

- [ ] Normal solo ve A; superuser ve A+B; inactiva marca estado, no opera
- [ ] Detalle muestra datos+usuarios+estadísticas; ID `99999` → error amigable
- [ ] Crear nombre vacío/espacios → bloquea; 100 car. + `Ñ` ok; duplicado → ¿avisa? anotar
- [ ] Razón vacía ¿permite? anotar; RUC 11 ok, 8/10/duplicado/letras → bloquea
- [ ] Dirección vacía → bloquea; 150 car. ok; ubigeo 5/letras → bloquea
- [ ] Teléfono letras → bloquea; email `a@b` → bloquea
- [ ] Serie `B001/F001` ok, vacía/`###` → bloquea; correlativos 0/negativo/texto → bloquea; `1` ok
- [ ] Logo JPG/PNG/WebP ok + preview; >5MB avisa; .pdf/.exe → rechaza; sin logo placeholder
- [ ] SOL usuario/clave con `p@$$/&` se guardan y muestran (enmascarada ideal)
- [ ] Asignar 0 usuarios ¿permite tienda huérfana? anotar; asignar 2 → les aparece
- [ ] Doble clic crear → 1 tienda

## 2. Editar/multitienda — qué pasaría si...

- [ ] Editar persiste; cambiar serie no rompe correlativos ya emitidos (siguiente = max+1)
- [ ] Cambiar A→B refresca inventario/ventas/dashboard/ganancias con datos B
- [ ] Vender en B descuenta B, A intacto (antes/después)
- [ ] Usuario pierde asignación (admin lo quita) + recargar → ya no ve esa tienda
- [ ] Crear venta sin tienda activa → bloquea con mensaje, no venta huérfana
- [ ] Permisos create/modify/delete/view store uno por uno

## Fallas encontradas

```text
ID-FALLA:
Pasos / Dato usado:
Esperado / Obtenido:
Severidad:
```
