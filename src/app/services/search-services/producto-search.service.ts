import { Producto } from '@/app/models/producto.models';
import { Injectable } from '@angular/core';
import { QuerySearchProduct } from '../utils/querys';
export const normalizeSku = (sku: any) => {
    return sku.replace(/['-]/g, "-")
}
@Injectable({
    providedIn: 'root'
})
export class ProductoSearchService {

    constructor() { }

    filtrarProducto(productos: Producto[], query: Partial<QuerySearchProduct>): { found: boolean, data: Producto[] } {
        const resultado = productos.filter((item: Producto) => {
            const texto = `${item.nombre} ${item.descripcion || ''}`.toLowerCase();

            // Input único: coincide por nombre/descripción o por SKU
            const q = (query.q || '').trim().toLowerCase();
            if (q) {
                const palabras = q.split(/\s+/);
                const hay = palabras.every((p) =>
                    texto.includes(p) || (item.sku || '').toLowerCase().includes(p)
                );
                if (!hay) return false;
            } else {
                if (query.nombre && !texto.includes(query.nombre.toLowerCase())) return false;
                if (query.sku && !normalizeSku(item.sku).includes(normalizeSku(query.sku))) return false;
            }
            if (query.categoria && item.categoria !== query.categoria) {
                return false;
            }



            return true;
        });

        return {
            found: resultado.length > 0,
            data: resultado
        };
    }
}
