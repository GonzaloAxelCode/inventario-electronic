# 15 — Admin (Superuser) — Pruebas de Usuario (AMPLIADO)

> Rutas: `/admin`, `/admin/config`, `/admin/store`, `/admin/store/:id`, `/admin/planes`

## 1. Accesos/gestión/planes — qué pasaría si...

- [ ] Normal → `/admin*` bloqueado; sin login → `/login`; superuser ve Home
- [ ] `store/:id` válido abre usuarios+stats; `99999`/`abc` → error amigable
- [ ] Tabs Gestión/Reportes/Config no pierden datos; skeleton → datos <3s
- [ ] Crear tienda aparece; desactivar bloquea a sus usuarios; borrar con usuarios → ¿bloquea? anotar
- [ ] Config global se refleja en `/app`; historial ordenado con filtros; cambio plan refleja en suscripción
- [ ] Plan vencido limita (anotar qué: crear venta/tienda/productos); 50 tiendas pagina sin congelar

## Fallas encontradas

```text
ID-FALLA:
Pasos / Dato usado:
Esperado / Obtenido:
Severidad:
```
