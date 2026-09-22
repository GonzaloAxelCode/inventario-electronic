# 09 — Clientes — Pruebas de Usuario (AMPLIADO)

> Ruta: `/app/clientes`

## 1. Tabla y crear — campo por campo

- [ ] Buscar `juan`, `JUAN`, ` juan `, DNI, RUC encuentran; `zzz` → vacío amigable
- [ ] Infinite scroll sin duplicar; últimos agregados primero
- [ ] Crear DNI 8 ok; 7/9/letras/espacios → bloquea; `01234567` con cero ok
- [ ] Crear RUC 11 ok; 10/12 → bloquea
- [ ] Duplicado exacto y con espacios `12345678` vs ` 12345678 ` → rechaza ambos
- [ ] Nombre vacío/espacios → bloquea; 100 car. `José Ñoño <&>` + emojis → guarda y muestra bien
- [ ] Dirección vacía ¿permite? anotar; 150 car. ok
- [ ] Teléfono `999888777` ok; letras/`123` corto/`+51 999` → valida según máscara libphonenumber
- [ ] Email vacío ¿permite? anotar; `a@b` / `sin@` / `a@b.c` → valida; duplicado → ¿avisa?
- [ ] Doble clic guardar → 1 cliente; sin internet → error sin fantasma
- [ ] Editar persiste tras F5; eliminar pide confirmación
- [ ] Eliminar con ventas → ¿bloquea o permite? probar: historial sigue intacto, no `null`
- [ ] Cliente `<script>` se ve como texto en tabla, POS y comprobante

## 2. Estadísticas, sorteos, selector

- [ ] Top frecuentes y top montos ordenan y coinciden con historial; sin clientes → vacío no crash
- [ ] Barras semana/mes dibujan; semana sin nuevos → barra 0
- [ ] Ruleta gira 4.2s, diálogo ganador válido; 5 giros no siempre mismo
- [ ] 1 cliente funciona o pide mínimo; 0 clientes → aviso, no ruleta rota
- [ ] 200 clientes ruleta carga sin congelar; colores diferenciados
- [ ] Selector venta busca rápido y pasa cliente al POS sin perderlo; cambiar cliente no borra productos

## Fallas encontradas

```text
ID-FALLA:
Pasos / Dato usado:
Esperado / Obtenido:
Severidad:
```
