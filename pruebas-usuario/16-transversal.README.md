# 16 — Transversal (UI, Plataformas, Rendimiento, Seguridad) — Pruebas de Usuario (AMPLIADO)

> Probar en Chrome/Firefox/móvil/Electron + DevTools Network/Console.

## 1. Responsive/navegación/diálogos

- [ ] Sidebar 14rem desktop; drawer <768px; rotar no rompe; tablas scroll sin cortar botones
- [ ] Dropdown usuario cada link funciona; `/**` → NotFound + volver; atrás/adelante sin blanco
- [ ] F5 en `/app/ventas/crear` mantiene sesión y form o avisa (anotar); links con permisos ocultos no entran por URL
- [ ] Toasts success/error/warning/info distinguibles + auto-dismiss; error no muestra stack crudo
- [ ] 17 diálogos: X/Escape/clic-fuera cierran sin fondo bloqueado; 2 diálogos no se enciman roto
- [ ] Botones loading evitan doble; animación 300ms fluida en PC lenta

## 2. Impresión/scanner/archivos/PWA/offline/multi

- [ ] QZ imprime ticket legible; sin QZ guía instal; PDF/XML/CDR abren; base64 no corrupto
- [ ] Pistola 3 pitidos → cantidad 3; 2car ignora; cámara buena/mala luz; código `ñ-/` no crash
- [ ] Prod Vercel sin rojos consola; refresh ruta no 404; PWA instala; offline aviso no blanco
- [ ] IndexedDB cachea y logout limpia; Android táctil login/venta/scanner ok; Electron imprime
- [ ] Permisos cámara/mic denegados → aviso con cómo activar

## 3. Rendimiento/seguridad/accesibilidad — qué pasaría si...

- [ ] Login→dash <3s; 1000 filas paginan; 1 año gráficos <5s; 5min scroll sin fuga (Task Manager estable)
- [ ] 3G lento skeletons, no botones muertos; API 500 → toast, reintento funciona
- [ ] Pass en URL nunca; JWT en header; logout invalida; 2 pestañas logout bloquea otra
- [ ] `<script>alert(1)</script>` en nombre/cliente/obs/producto → texto, no ejecuta (probar los 4)
- [ ] `'; DROP --` y `../../etc` en búsquedas → texto, no rompe
- [ ] 401 con token roto → `/login` sin loop infinito
- [ ] Tab/Enter todo usable; foco visible; contraste AA dark/light; zoom 200% sin overlap; `lang=es`

## 4. Flujos cruzados E2E (hacer en orden)

- [ ] F1 venta completa: crear prod→inventario→cliente→venta→ver en historial/dashboard/ganancias/stock−
- [ ] F2 anular: anular F1 → stock vuelve, dashboard/ganancias bajan, aparece en canceladas
- [ ] F3 compra: XML→compra→stock sube→historial
- [ ] F4 pedido: COT→PEND→REAL→stock baja→(venta si aplica)
- [ ] F5 guía: crear con transportista→detalle→lista
- [ ] F6 multitienda: vender en B no toca A; cambiar tienda refresca todo
- [ ] F7 permisos: quitar `can_make_sale` → POS bloqueado; devolver → vuelve

## Fallas encontradas

```text
ID-FALLA:
Pasos / Dato usado:
Esperado / Obtenido:
Severidad:
Navegador/dispositivo:
```
