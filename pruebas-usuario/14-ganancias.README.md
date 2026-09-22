# 14 — Ganancias — Pruebas de Usuario (AMPLIADO)

> Ruta: `/app/ganancias` · Precondición: ventas con costo≠precio + compra + anulación + devolución.

## 1. Filtros/cálculos/reportes — qué pasaría si...

- [ ] Día/rango/mes/tienda/producto/categoría filtran; invertido → error; sin ventas → 0 + vacío
- [ ] Caso: compra 60 vende 100×2 −10 = ganancia 70; verificar exacto con calculadora
- [ ] Costo 0 → ¿100%? no Infinity; precio<costo → ganancia negativa visible (no 0)
- [ ] Descuento reduce ganancia; 100% → ganancia = −costo (anotar)
- [ ] Anulación/devolución restan; 3 ventas suma = total; PEN/USD no mezclan
- [ ] 500 ventas <3s; exportar PDF/Excel abre; gráfico tooltip = tabla
- [ ] API caída → error aislado; cambio tienda recalcula; F5 mantiene filtro (anotar)

## Fallas encontradas

```text
ID-FALLA:
Pasos / Dato usado:
Esperado / Obtenido:
Severidad:
```
