export interface PedidoProducto {
    id?: number;
    producto?: number;
    producto_nombre?: string;
    cantidad: number;
    stock_disponible?: boolean;
    valor_unitario: number;
    valor_venta?: number;
    base_igv?: number;
    porcentaje_igv?: number;
    igv?: number;
    tipo_afectacion_igv?: string;
    total_impuestos?: number;
    precio_unitario: number;
    costo_original?: number;
    descuento?: number;
}

export interface Pedido {
    id: number;
    numero_pedido: string;
    usuario?: number;
    tienda?: number;
    fecha_hora: string;
    fecha_realizacion?: string;
    fecha_cancelacion?: string;
    metodo_pago: string;
    estado: 'COTIZADO' | 'PENDIENTE' | 'REALIZADO' | 'CANCELADO';
    activo: boolean;
    total: number;
    subtotal: number;
    gravado_total?: number;
    igv_total: number;
    descuento_total: number;
    tipo_documento_cliente?: string;
    numero_documento_cliente?: string;
    nombre_cliente: string;
    email_cliente?: string;
    telefono_cliente?: string;
    direccion_cliente?: string;
    observaciones?: string;
    productos: PedidoProducto[];
    productos_json?: any[];
    date_created: string;
}

export interface CreatePedido {
    cliente: {
        tipo_documento: string;
        numero: string;
        nombre_completo: string;
        correo_cliente?: string;
        telefono_cliente?: string;
        direccion_cliente?: string;
    };
    metodoPago: string;
    observaciones?: string;
    productos: {
        inventarioId: number;
        cantidad_final: number;
        descuento?: number;
    }[];
}

export interface PedidoSearchFilters {
    from_date?: string | number[];
    to_date?: string | number[];
    numero_pedido?: string;
    metodo_pago?: string;
    estado?: string;
    nombre_cliente?: string;
    numero_documento_cliente?: string;
    stock_disponible?: string;
}

export interface PedidoResponse {
    count: number;
    results: Pedido[];
}

export interface PedidoSearchResponse {
    count: number;
    next: number | null;
    previous: number | null;
    index_page: number;
    length_pages: number;
    results: Pedido[];
    search_pedidos_found: string;
}
