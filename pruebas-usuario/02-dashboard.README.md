# 02 — Dashboard — Pruebas de Usuario (AMPLIADO)

> Ruta: `/app` · Precondición: ventas hoy/semana/mes, 1 día sin ventas, stock 0/bajo, pedidos cada estado.

## 1. Tarjetas ventas — casos

- [ ] Hoy/semana/mes coinciden con suma manual de historial
- [ ] Día sin ventas → 0 + mensaje, no NaN
- [ ] Fecha futura → 0, no negativos
- [ ] Selector día `2026-02-30` inválido → no crash; mes/año bisiesto feb-29 ok
- [ ] Cambiar fecha 5 veces rápido → último valor gana, no mezcla
- [ ] Tienda A vs B muestran montos distintos; sin tienda → 0 + aviso

## 2. Gráficos — qué pasaría si...

- [ ] Rango válido dibuja; invertido → error; 1 día → 1 punto; 1 año → <5s con loading
- [ ] Rango 3 años → no congela o pagina
- [ ] Sin datos → vacío amigable, ejes no rotos
- [ ] Tooltip valores = tabla; resize ventana no deforma
- [ ] Dark/light se ven todos (ring/pie/barras/línea) sin líneas blancas invisibles
- [ ] 0 ventas + 0 productos → dashboard vacío completo, no crash

## 3. Widgets + carga

- [ ] Últimas 5-10 orden desc; clic abre la correcta
- [ ] Stock bajo solo <=mínimo; 0 crítico visible
- [ ] Pendientes solo COTIZADO/PENDIENTE; REALIZADO/CANCELADO fuera
- [ ] Pagos suman 100%; método sin ventas → 0%
- [ ] Nuevos productos últimos con placeholder si sin imagen
- [ ] Internet lento → skeletons; API caída → error aislado por widget
- [ ] Cambiar tienda refresca todo; F5 no duplica peticiones infinito

## Fallas encontradas

```text
ID-FALLA:
Pasos / Dato usado:
Esperado / Obtenido:
Severidad:
```
