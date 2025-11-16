import { Inventario } from '@/app/models/inventario.models';
import { Injectable } from '@angular/core';
import { QuerySearchInventario } from '../inventario.service';

@Injectable({
    providedIn: 'root'
})
export class InventarioSearchService {

    constructor() { }

    filtrarInventario(inventarios: Inventario[], query: QuerySearchInventario): { found: boolean, data: Inventario[] } {
        const resultado = inventarios.filter(item => {
            if (query.nombre) {
                const term = query.nombre.toLowerCase();


                if (
                    !item.producto_nombre.toLowerCase().includes(term) &&
                    !item.producto_sku.toLowerCase().includes(term)
                ) {
                    return false;
                }
            }
            if (query.categoria && item.categoria_id !== query.categoria) {
                return false;
            }
            if (query.stock_min != null && item.cantidad < query.stock_min) return false;
            if (query.stock_max != null && item.cantidad > query.stock_max) return false;
            if (query.precio_compra_min != null && item.costo_compra < query.precio_compra_min) return false;
            if (query.precio_compra_max != null && item.costo_compra > query.precio_compra_max) return false;
            if (query.precio_venta_min != null && item.costo_venta < query.precio_venta_min) return false;
            if (query.precio_venta_max != null && item.costo_venta > query.precio_venta_max) return false;
            return true;
        });

        return {
            found: resultado.length > 0,
            data: resultado
        };
    }
}
