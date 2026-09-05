# Plan: Corregir valores de `tipo_style_boleta_ticket` y `tipo_style_factura_pdf` (solo Angular)

## Objetivo
En el frontend Angular, hacer que el body enviado a `PATCH /tiendas/styles/{id}/` use los nombres de archivo `.twig` (sin extensión) en `tipo_style_boleta_ticket` y `tipo_style_factura_pdf`, en lugar de los slug cortos actuales.

## Alcance
- **Dentro del alcance**: editar `admintiendadetail.component.ts` y, si hace falta, el tipado del servicio/modelo.
- **Fuera del alcance**: backend, plantillas `.twig`, migración de datos en BD.

## Mapeo confirmado por el usuario

| UI key | Valor a enviar al backend | Archivo de plantilla |
|---|---|---|
| `t80_1` | `ticket_v1_clasico` | `ticket_v1_clasico.html.twig` |
| `t80_2` | `ticket_v2_minimal` | `ticket_v2_minimal.html.twig` |
| `t80_3` | `ticket_v3_bold` | `ticket_v3_bold.html.twig` |
| `t80_4` | `ticket_v4_punteado` | `ticket_v4_punteado.html.twig` |
| `t80_5` | `ticket_v5_condensado` | `ticket_v5_condensado.html.twig` |
| `t80_6` | `ticket_v6_enmarcado` | `ticket_v6_enmarcado.html.twig` |
| `pdf_1` | `factura_v1_corporate` | `factura_v1_corporate.html.twig` |
| `pdf_2` | `factura_v2_minimal` | `factura_v2_minimal.html.twig` |
| `pdf_3` | `factura_v3_executive` | `factura_v3_executive.html.twig` |
| `pdf_4` | `factura_v4_modern` | `factura_v4_modern.html.twig` |
| `pdf_5` | `factura_v5_ledger` | `factura_v5_ledger.html.twig` |
| `pdf_6` | `factura_v6_bold` | `factura_v6_bold.html.twig` |

## Cambios

### Único archivo: `src/app/pages/admin/admintiendadetail/admintiendadetail.component.ts`

1. **Derivar los mapas de los arrays ya existentes** `ticketTemplates` (líneas 48-55) e `invoiceTemplates` (57-64), usando el campo `file` y quitando el sufijo `.html.twig`. Esto evita duplicación y deja una sola fuente de verdad.

   - Reemplazar `ticketStyleMap` por un getter que devuelva:
     ```ts
     get ticketStyleMap(): Record<TicketKey, string> {
       return Object.fromEntries(
         this.ticketTemplates.map(t => [t.key, t.file.replace(/\.html\.twig$/, '')])
       ) as Record<TicketKey, string>;
     }
     ```
   - Idem para `invoiceStyleMap` desde `invoiceTemplates`.
   - Reemplazar `ticketStyleReverseMap` e `invoiceStyleReverseMap` por getters análogos que inviertan los anteriores.

2. **`persistStyles()`** (línea 140): no requiere cambios. El `body` ya se construye con `ticketStyleMap[this.selectedTicket]` y `invoiceStyleMap[this.selectedInvoice]`.

3. **Tipo de las claves**: mantener los union types `t80_1 | t80_2 | ... | t80_6` y `pdf_1 | pdf_2 | ... | pdf_6` para `selectedTicket`/`selectedInvoice`; solo cambia el valor asociado en el mapa.

### Archivos NO tocados
- `src/app/models/tienda.models.ts` — `tipo_style_boleta_ticket?: string | null` y `tipo_style_factura_pdf?: string | null` siguen siendo válidos.
- `src/app/services/tienda.service.ts` — `updateTiendaStyles(id, body)` ya acepta `string` genérico.

## Validación (a ejecutar por el agente implementador)
1. `npm run lint` (si existe).
2. `npm run build` para verificar tipos.
3. Manual UI: en `/admin/store/:id` tab "diseno", seleccionar cada ticket y cada PDF; el toast debe mostrar `Diseño actualizado · Ticket: ticket_vX_nombre · Factura: factura_vX_nombre`.
4. Recargar la página: `applyStylesFromTienda()` debe hidratar la selección correcta.
5. Inspeccionar en BD: los campos `tipo_style_boleta_ticket` / `tipo_style_factura_pdf` deben contener los nombres sin `.html.twig`.

## Riesgos
- **Datos legacy en BD**: tiendas ya persistidas con los slug antiguos (`clasico`, `corporate`, ...) no harán match en los `ReverseMap` y la UI caerá al valor por defecto (`t80_1` / `pdf_1`). Mitigación (fuera de alcance de Angular): migración backend que traduzca los slug antiguos a los nombres nuevos antes del deploy. Anotar al equipo backend.
