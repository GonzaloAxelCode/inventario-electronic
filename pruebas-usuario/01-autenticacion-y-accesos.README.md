# 01 — Autenticación y Accesos — Pruebas de Usuario (AMPLIADO)

> Ruta: `/login` · Guards: authGuard, loginGuard, superUserGuard, normalUserGuard, roleRedirectGuard
> Precondición: tener 1 superuser, 1 normal activo, 1 inactivo, 1 sin tienda, 1 sin permisos.

## 1. Formulario login — campo por campo

### Campo usuario

- [ ] Vacío + login → bloquea con validación, no llama backend
- [ ] Solo espacios `"   "` → trata como vacío
- [ ] Usuario inexistente `noexiste123` → error credenciales inválidas, no revela si existe
- [ ] Usuario con mayúsculas `ADMIN` vs `admin` → anotar si es sensible (probar ambos)
- [ ] Usuario con espacios al inicio/fin `" admin "` → anotar si recorta o falla
- [ ] Usuario de 100+ caracteres → no rompe layout, muestra error controlado
- [ ] Usuario con emojis / ñ / tildes `ñandú_ñoño` → no crash, error controlado
- [ ] Pegar usuario con Ctrl+V funciona y no deja espacios raros
- [ ] Autocompletado del navegador / gestor contraseñas rellena bien

### Campo contraseña

- [ ] Vacía + login → bloquea
- [ ] Solo espacios → trata como vacía
- [ ] Contraseña errónea (1 letra distinta) → error inválido
- [ ] Contraseña con espacios al final `"clave123 "` → anotar si falla o recorta
- [ ] Contraseña de 1 carácter → error, no crash
- [ ] Contraseña de 200 caracteres → no congela ni rompe
- [ ] Contraseña con caracteres especiales `P@$$w0rd#%&*/\` → acepta y envía bien
- [ ] Ojo mostrar/ocultar (si existe) alterna tipo password/text
- [ ] Enter en campo contraseña envía el form (sin clic)
- [ ] Tab desde usuario llega a contraseña y luego a botón
- [ ] Copiar/pegar contraseña con espacios no la corrompe

### Botón y UX login

- [ ] Doble / triple clic rápido → solo 1 petición POST (revisar Network)
- [ ] Durante carga muestra spinner/disabled, no deja reenviar
- [ ] Backend lento (throttling 3G) → sigue usable, timeout con mensaje
- [ ] Backend caído / sin wifi → error red amigable, no pantalla blanca
- [ ] Error 500 del backend → mensaje genérico amigable, no stacktrace
- [ ] Error 401 → mensaje credenciales inválidas, no "Unauthorized" crudo
- [ ] Caps Lock activado → ¿avisa? (anotar, ideal avisar)
- [ ] Teclado móvil muestra teclado adecuado y el botón no queda tapado

## 2. Matriz de logins — qué pasa si...

- [ ] Superuser correcto → entra y va a `/admin`
- [ ] Normal correcto → entra y va a `/app`
- [ ] Usuario inactivo / `desactivate_account=true` → no entra, mensaje cuenta desactivada
- [ ] Usuario sin tienda asignada → ¿entra? ¿muestra elegir tienda vacía o error? anotar
- [ ] Usuario sin ningún permiso → entra pero menú vacío + mensaje, no crash
- [ ] 5 intentos fallidos seguidos → ¿bloquea temporalmente? anotar
- [ ] Login en 2 pestañas a la vez con mismo user → ambas funcionan o una invalida a la otra
- [ ] Login en 2 dispositivos (PC + móvil) → ¿permite o cierra la otra? anotar
- [ ] Login con token viejo en localStorage → lo reemplaza, no duplica
- [ ] Recargar a mitad del POST login → no deja sesión a medias
- [ ] Volver atrás tras login → no vuelve al form logueado
- [ ] Sesión recordada tras cerrar y abrir navegador (si hay refresh) → sigue o pide login según regla
- [ ] Login con DevTools → contraseña no aparece en URL, solo en body POST cifrado (https)
- [ ] Login con email en vez de username → ¿acepta o rechaza? anotar regla

## 3. Tokens y sesión a fondo

- [ ] Tras login existen `accessToken` + `refreshToken` en localStorage
- [ ] Access manipulado (cambiar 1 letra en DevTools + recargar) → detecta inválido y va a `/login`
- [ ] Borrar solo access y recargar → ¿refresca con refresh o pide login? anotar
- [ ] Borrar ambos y entrar a `/app` → va a `/login`
- [ ] Refresh expirado → pide login, limpia todo
- [ ] Cada petición lleva `Authorization: Bearer ...` (revisar Network en ventas/productos)
- [ ] Sin token la API responde 401 y la app redirige, no muestra tabla vacía infinita
- [ ] Reloj PC adelantado 1 día → ¿token parece expirado? anotar
- [ ] Logout limpia tokens + usuario + caché inventario (IndexedDB) y va a `/login`
- [ ] Tras logout, botón atrás no entra a `/app` (guards lo bloquean)
- [ ] Logout con wifi apagado → igual limpia local y redirige

## 4. Guards y roles — matriz URL

- [ ] Sin login: `/app`, `/app/ventas`, `/app/productos`, `/app/compras`, `/admin` → todos a `/login`
- [ ] Normal → `/admin`, `/admin/store`, `/admin/config`, `/admin/planes` → bloqueado/redirigido
- [ ] Superuser → `/app/ventas/crear` → ¿permite o redirige a `/admin`? anotar según roleRedirectGuard
- [ ] Logueado (cualquiera) → `/login` → redirige a home (loginGuard)
- [ ] URL con `/app/settings/permisos` como normal sin permiso → ¿muestra u oculta? anotar
- [ ] Entrar directo por URL profunda (`/app/guia-remision/nueva`) sin permiso → bloquea
- [ ] Cambiar rol en backend mientras está logueado + recargar → aplica nuevo rol sin crash

## 5. Permisos RBAC — qué ve cada rol

- [ ] Sin `can_make_sale` → no ve / no entra a `ventas/crear`
- [ ] Sin `can_cancel_sale` → no ve anular en ventas/pedidos
- [ ] Sin `view_product` → no ve menú Productos; entrada directa por URL bloqueada
- [ ] Sin `can_create_product` → ve lista pero no botón crear
- [ ] Sin `can_delete_*` → no ve botones eliminar en su módulo
- [ ] Solo `view_*` en todo → modo solo lectura, ningún crear/editar visible
- [ ] Solo `can_create_user` → puede crear usuarios (verificar no escala a superuser solo)
- [ ] Quitar permiso en caliente (admin lo quita mientras el vendedor está dentro) + recargar → desaparece opción
- [ ] `user_permissions_list + all_permissions_meta` coinciden con lo que muestra UI

## 6. Ataques básicos / robustez (sin herramientas, solo inputs)

- [ ] Usuario `' OR '1'='1` → trata como texto, no entra
- [ ] Usuario `<script>alert(1)</script>` → no ejecuta, muestra error normal
- [ ] Contraseña `<img src=x onerror=alert(1)>` → no ejecuta
- [ ] Intentar enumerar usuarios (probar `admin` vs `zzzzz`): mensajes idénticos, no revela cuál existe
- [ ] Respuesta login no expone hash ni datos sensibles en Network preview

## 7. Accesibilidad login

- [ ] Solo teclado Tab/Enter completa login
- [ ] Lector de pantalla anuncia errores (aria)
- [ ] Contraste del form en dark y light legible
- [ ] Zoom 200% no rompe el form

## Fallas encontradas

```text
ID-FALLA:
Pasos:
Esperado / Obtenido:
Severidad:
Rol / Navegador:
```
