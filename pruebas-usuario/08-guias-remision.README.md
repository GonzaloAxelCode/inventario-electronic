# 08 — Guías de Remisión — Pruebas de Usuario (AMPLIADO)

> Rutas: `/app/guia-remision`, `/app/guia-remision/nueva`

## 1. Lista/detalle/editar

- [ ] Paginado ok; filtros fecha/estado solos y combinados; fecha invertida → error
- [ ] Detalle muestra remitente/destinatario/transportista/items/estado completos
- [ ] Editar guarda y se refleja en lista; editar ID inexistente `99999` → error amigable

## 2. Formulario campo por campo — qué pasaría si...

- [ ] Emisión vacía/futura → bloquea/avisa; traslado < emisión → avisa; traslado muy futuro (+30d) → avisa
- [ ] Observaciones vacía ok; 500 car./emojis ok
- [ ] Remitente RUC autocompleta tienda; RUC 10/12/letras → bloquea; razón/dirección vacías → bloquean
- [ ] Ubigeo 5/7 dígitos/letras → bloquea; `150101` Lima ok
- [ ] Destinatario RUC 11 ok, 8/10 → bloquea; razón/dirección/ubigeo vacíos → bloquean
- [ ] Partida/llegada vacías → bloquean; iguales → avisa; 100 car. con `Ñ` ok
- [ ] Transportista razón/RUC vacíos → bloquean; RUC inválido → bloquea
- [ ] Chofer nombre vacío → bloquea; DNI 7/9/letras → bloquea; `12345678` ok
- [ ] Placa vacía/`ABC123` sin guion/`AB` corta → valida formato; licencia vacía → bloquea
- [ ] Item código/descripción vacíos → bloquean; unidad cada una PIEZA/CAJA/KG/GALÓN/JUEGO/METRO/ROLLO/PAR/DOCENA se guarda
- [ ] Cantidad 0/-1/abc → bloquea; 1000 ok si stock permite
- [ ] Peso 0/negativo → bloquea; total <0.1 → bloquea; bultos 0 → bloquea, 1 ok
- [ ] Peso total = suma manual; motivo distinto a VENTA se guarda
- [ ] Guardar con 5 faltantes marca los 5, no guarda a medias; doble clic → 1 guía
- [ ] Sin internet → error sin fantasma; tras crear aparece en lista

## Fallas encontradas

```text
ID-FALLA:
Pasos / Dato usado:
Esperado / Obtenido:
Severidad:
```
