export interface Inventario {
    id: number
    producto: number;
    tienda: number;
    cantidad: number;
    stock_minimo: number;
    stock_maximo: number;
    costo_compra: number;
    costo_venta: number;
    fecha_actualizacion: Date;
    activo: boolean;
    lote?: string;
    fecha_vencimiento?: Date | null;
    estado: string;
    //proveedor: number | any
    responsable: number | any
    descripcion: string
    producto_nombre: string,
    tienda_nombre: string,
    date_created?: any
    //proveedor_nombre: string,
    responsable_nombre: string
    categoria_nombre: string
    categoria_id: number
    producto_sku: string,
    imagen_producto: string
}

export type InventarioCreate = Omit<Inventario, 'id' |
    'fecha_actualizacion' |
    'activo' |
    'estado' | 'responsable' |
    'lote'>;

export interface DistribucionStock {
    sin_stock: number;
    critico: number;
    bajo: number;
    normal: number;
}

export interface DistribucionStockResponse {
    distribucion: DistribucionStock;
}

export interface RangoPrecio {
    rango: string;
    cantidad: number;
}

export interface PorRangoPreciosResponse {
    por_precio_compra: RangoPrecio[];
    por_precio_venta: RangoPrecio[];
}

export interface ValorizacionCategoria {
    categoria: string;
    cantidad_productos: number;
    total_compra: number;
    total_venta: number;
}

export interface ValorizacionInventarioResponse {
    valorizacion: ValorizacionCategoria[];
}

export interface TopCategoriaCompra {
    categoria: string;
    total_unidades: number;
    total_gastado: number;
}

export interface TopCategoriasCompraResponse {
    top_categorias_compra: TopCategoriaCompra[];
}

