# Plan: Diagnosticar y corregir carga de tiendas en modo admin producción

## Problema reportado
En modo admin, local se muestran todas las tiendas; en producción no se muestran todas. El usuario confirmó que es `is_superuser`.

## Diagnóstico preliminar
El filtro en `adminmanagestore.component.ts` aplica `t.propietario != null` **antes** de verificar `is_superuser`, por lo que aunque el usuario sea superuser, las tiendas sin `propietario` (o con valor `null`) se descartan. Es probable que en producción el backend no serialice/popule `propietario` mientras que en local sí.

## Pasos de implementación

1. **Agregar logging temporal** en `src/app/pages/admin/adminmanagestore/adminmanagestore.component.ts` dentro del `map` de `filteredTiendas$` para registrar en consola:
   - Cantidad de `tiendaState.tiendas` recibidas.
   - Cantidad con `propietario != null` antes del filtro de rol.
   - Valor de `user.is_superuser` y `user.es_propietario`.
   - Cantidad de tiendas después de cada filtro/condición.

2. **Corregir el orden de filtrado** en el mismo archivo:
   - Mover la comprobación `if (user.is_superuser) return tiendas;` al inicio, antes del filtro `propietario != null`.
   - Asegurar que los superusers reciban el array completo sin filtrar.

3. **Validar en producción** que el gráfico/admin de tiendas muestre todas las tiendas después del cambio.

4. **Limpiar el logging temporal** una vez confirmado el comportamiento esperado.

## Archivos afectados
- `src/app/pages/admin/adminmanagestore/adminmanagestore.component.ts`

## Riesgos
- Si el backend de producción filtra las tiendas por usuario a nivel de API, el cambio en frontend no alcanzará. El logging ayudará a confirmar si la respuesta del API llega completa o ya filtrada.
