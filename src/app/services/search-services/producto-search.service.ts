import { Producto } from '@/app/models/producto.models';
import { Injectable } from '@angular/core';
import { QuerySearchProduct } from '../utils/querys';

@Injectable({
    providedIn: 'root'
})
export class ProductoSearchService {

    constructor() { }

    filtrarProducto(productos: Producto[], query: Partial<QuerySearchProduct>): { found: boolean, data: Producto[] } {
        const resultado = productos.filter((item: Producto) => {
            const texto = `${item.nombre} ${item.descripcion || ''}`.toLowerCase();

            if (query.nombre && !texto.includes(query.nombre.toLowerCase())) return false;
            if (query.categoria && item.categoria !== query.categoria) {
                return false;
            }
            if (query.sku && !item.sku.toLowerCase().includes(query.sku.toLowerCase())) return false;

            return true;
        });

        return {
            found: resultado.length > 0,
            data: resultado
        };
    }
}
