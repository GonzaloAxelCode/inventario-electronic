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
    categoria_tipo?: string | null
    producto_sku: string,
    producto_marca?: string | null
    producto_modelo?: string | null
    repuesto_tipo?: string | null
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

export interface TopProductoCompra {
    inventario_id: number;
    producto: string;
    sku: string;
    categoria: string;
    cantidad: number;
    costo_compra: number;
    costo_venta: number;
}

export interface TopProductosCompraResponse {
    top_productos_compra: TopProductoCompra[];
    tipo?: string;
}

export interface ValorCategoria {
    categoria: string;
    cantidad_productos: number;
    total_unidades: number;
    valor_total: number;
}

export interface ValorPorCategoriaResponse {
    valor_por_categoria: ValorCategoria[];
    tipo?: string;
}

export interface GrupoResumen {
    total: number;
    agotados: number;
    bajo_stock: number;
    critico: number;
    alerta_total: number;
    normal: number;
    /** Solo teléfonos: celulares no disponibles. */
    no_disponibles?: number;
    /** Unidades físicas totales y valorización a costo. */
    unidades?: number;
    valorizacion?: number;
    /** Solo teléfonos: precio de venta potencial de los disponibles. */
    venta_potencial?: number;
}

export interface ResumenTiendaResponse {
    totales: {
        accesorios: number;
        telefonos: number;
        repuestos: number;
        otros: number;
        total_items: number;
    };
    stock: {
        agotados: number;
        bajo_stock: number;
        critico: number;
        alerta_total?: number;
        umbral_bajo_min?: number;
        umbral_bajo_max?: number;
        // Compat con versión anterior (≤10 / ≤3)
        umbral_bajo?: number;
        umbral_critico?: number;
    };
    grupos?: {
        accesorios: GrupoResumen;
        telefonos: GrupoResumen;
        repuestos: GrupoResumen;
    };
    telefonos_por_marca?: Array<{ marca: string; total: number }>;
    repuestos_por_tipo?: Array<{ tipo: string; total: number }>;
}

