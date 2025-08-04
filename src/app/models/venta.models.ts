

export interface Venta {
    id: number;
    usuario: number;
    tienda: number;
    fecha_hora: string;
    fecha_realizacion?: string | null;
    fecha_cancelacion?: string | null;
    metodo_pago: string;
    estado: string;
    activo: boolean;
    tipo_comprobante: string
    productos: Partial<ProductSale>[]
    subtotal: number;
    gravado_total: number
    igv_total: number
    total: number
    productos_json: string
    comprobante: ComprobanteElectronico

}

export interface ComprobanteElectronico {
    tipo_comprobante: string;
    serie: string;
    correlativo: string
    numero: string;
    moneda: string;

    tipo_documento_cliente: string;
    numero_documento_cliente: string;
    nombre_cliente: string;

    gravadas: number;
    igv: number;
    valorVenta: number;
    sub_total: number;
    total: number;

    leyenda: string;
    estado_sunat: string;

    xml_url: string;
    pdf_url: string;
    cdr_url: string;
    ticket_url: string;
    items: ItemComprobante[];
}
export interface ItemComprobante {
    igv: number;
    codigo: string;
    unidad: string;
    baseIgv: number;
    cantidad: number;
    valorVenta: number;
    descripcion: string;
    porcentajeIgv: number;
    valorUnitario: number;
    precioUnitario: number;
    totalImpuestos: number;
    tipoAfectacionIgv: string;
}

export interface VentaProducto {
    id: number;
    producto: number;
    producto_nombre: string;
    cantidad: number;
    valor_unitario: number;
    valor_venta: number;
    base_igv: number;
    porcentaje_igv: number;
    igv: number;
    tipo_afectacion_igv: string;
    total_impuestos: number;
    precio_unitario: number;
}

export interface CreateVenta {
    dniRuc: string;
    cliente: ClienteTemp;
    metodoPago: string;
    formaPago: string;
    tipoComprobante: string
    subTotal: number;
    descuentos: number;
    igv: number;
    totalPagar: number;
    productos: ProductoVenta[];
}

export interface ClienteTemp {
    numero: string;
    nombre_completo: string;
    nombres: string;
    apellido_paterno: string;
    apellido_materno: string;
    codigo_verificacion: number;
    ubigeo_sunat: string;
    ubigeo: (string | null)[];
    direccion: string;
}

export interface ProductoVenta {
    inventarioId: number;
    cantidad_final: string;
    producto_nombre: string;
    costo_venta: string;
    productoId: number;
}
export interface ProductSale {
    id: number;
    producto: number;
    producto_nombre: string;
    cantidad: number;
    valor_unitario: number;
    valor_venta: number;
    base_igv: number;
    porcentaje_igv: number;
    igv: number;
    tipo_afectacion_igv: string;
    total_impuestos: number;
    precio_unitario: number;
}
