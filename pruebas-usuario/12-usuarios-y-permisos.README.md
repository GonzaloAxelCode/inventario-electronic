# 12 — Usuarios y Permisos — Pruebas de Usuario (AMPLIADO)

> Ruta: tabla usuarios · Precondición: superuser + normal.

## 1. Lista/crear campo por campo

- [ ] Buscar por nombre/usuario/tienda/rol/estado encuentran; `zzz` → vacío
- [ ] Username vacío/espacios/duplicado (`Admin` vs `admin` → anotar case) → bloquea
- [ ] Username `a` 1car./50car./con espacios/`ñ` → anotar regla
- [ ] Contraseña vacía/<6/`123456`/`password` → bloquea o avisa débil (anotar); 72 car. + `P@$$` ok
- [ ] Nombre/apellido vacíos ¿permiten? anotar; 80 car. + tildes ok
- [ ] Email vacío ¿permite?; inválido bloquea; duplicado ¿avisa?
- [ ] Tienda vacía/inexistente → bloquea; inactivo no loguea; doble clic → 1 usuario

## 2. Editar/contraseña/desactivar + permisos qué pasaría si...

- [ ] Editar persiste; actual errónea rechaza; nueva!=confirm bloquea; nueva<6 bloquea
- [ ] Tras cambio, nueva entra / vieja no; `desactivate_account` bloquea inmediato incluso con sesión abierta
- [ ] Reactivar permite de nuevo
- [ ] Solo `view_product` → lista sí, crear/editar no; sin `can_make_sale` → sin POS; sin `can_cancel_sale` → sin anular
- [ ] Dar `can_create_user` no da superuser solo; quitar todos → menú vacío no crash
- [ ] Cambio en caliente + F5 aplica; usuario intentando auto-darse superuser → bloquea
- [ ] `user_permissions_list` = UI; crear usuario con `is_superuser=true` desde normal → bloquea

## Fallas encontradas

```text
ID-FALLA:
Pasos / Dato usado:
Esperado / Obtenido:
Severidad:
```
