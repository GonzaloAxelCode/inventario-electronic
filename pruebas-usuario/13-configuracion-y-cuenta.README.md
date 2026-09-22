# 13 — Configuración y Cuenta — Pruebas de Usuario (AMPLIADO)

> Ruta: `/app/settings` + `/app/perfil`

## 1. Mi cuenta / Perfil / Seguridad campo por campo

- [ ] Username/nombre/email/fecha/rol/tienda RUC/dirección/logo correctos; sin foto → iniciales
- [ ] Foto JPG/PNG/WebP ok; >5MB avisa; .pdf rechaza; quitar vuelve a iniciales
- [ ] Actual errónea rechaza; nueva<6 / !=confirm bloquea; `123456` avisa débil
- [ ] `P@$$w0rd` con especiales ok; doble clic → 1 cambio; loading evita reenvío
- [ ] Tras cambio: nueva entra, vieja no; otras sesiones ¿siguen? anotar
- [ ] Sesiones IP/fecha/activa coherentes; mensaje asunto vacío / <10 car. bloquea; 1000 car. ok
- [ ] Logout limpia tokens/usuario/IndexedDB → `/login`; atrás no entra; sin wifi igual limpia

## 2. Permisos vista / Temas / Suscripción / Mi-tienda / Módulos

- [ ] Acordeón categorías coincide con permisos reales; switches solo lectura no guardan
- [ ] Dark/light sin partes rotas en tablas/diálogos/gráficos; persiste + respeta sistema + Reset
- [ ] Zoom 200% + 320px móvil legible; teclado Tab llega a todo
- [ ] Suscripción plan/fecha/estado + pagar/renovar; vencido muestra aviso y limita (anotar qué limita)
- [ ] Mi-tienda guarda y refleja en comprobantes; Módulos off oculta menú y URL directa bloquea
- [ ] Desactivar todo no deja app vacía rota

## Fallas encontradas

```text
ID-FALLA:
Pasos / Dato usado:
Esperado / Obtenido:
Severidad:
```
