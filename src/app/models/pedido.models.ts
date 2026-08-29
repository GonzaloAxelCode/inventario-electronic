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
    tipo_pedido: string;
    canal_venta: string;
    prioridad: string;
    fecha_hora: string;
    fecha_realizacion?: string;
    fecha_vencimiento?: string | null;
    fecha_entrega_estimada?: string | null;
    fecha_cancelacion?: string | null;
    metodo_pago: string;
    estado: string;
    estado_pago: string;
    activo: boolean;
    subtotal: number;
    gravado_total?: number;
    igv_total: number;
    descuento_total: number;
    costo_envio: number;
    total: number;
    monto_adelanto?: number;
    metodo_pago_adelanto?: string | null;
    tipo_documento_cliente?: string;
    numero_documento_cliente?: string;
    nombre_cliente: string;
    email_cliente?: string;
    telefono_cliente?: string;
    direccion_envio?: string;
    referencia_ubicacion?: string;
    observaciones?: string;
    notas_internas?: string;
    motivo_cancelacion?: string | null;
    referencia_externa?: string;
    productos: PedidoProducto[];
    productos_json?: any[];
    date_created: string;
}

export interface CreatePedido {
    cliente?: {
        tipo_documento: string;
        numero: string;
        nombre_completo: string;
        correo_cliente?: string;
        telefono_cliente?: string;
        direccion_cliente?: string;
    };
    tipo_pedido?: string;
    canal_venta?: string;
    prioridad?: string;
    metodoPago: string;
    observaciones?: string;
    notas_internas?: string;
    direccion_envio?: string;
    referencia_ubicacion?: string;
    costo_envio?: number;
    referencia_externa?: string;
    productos: {
        inventarioId: number;
        cantidad_final: number;
        descuento?: number;
    }[];
}

export interface PedidoSearchFilters {
    from_date?: number[];
    to_date?: number[];
    numero_pedido?: string;
    metodo_pago?: string;
    estado?: string;
    tipo_pedido?: string;
    canal_venta?: string;
    estado_pago?: string;
    prioridad?: string;
    nombre_cliente?: string;
    numero_documento_cliente?: string;
    email_cliente?: string;
    telefono_cliente?: string;
    referencia_externa?: string;
}

export interface PedidoResponse {
    count: number;
    next: number | null;
    previous: number | null;
    index_page: number;
    length_pages: number;
    results: Pedido[];
    search_pedidos_found: string;
}
