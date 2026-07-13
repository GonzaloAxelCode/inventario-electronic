
export interface CompraProveedor {
    id: number;
    nombre: string;
    ruc: string;
}

export interface CompraItem {
    producto: string;
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
}

export interface ComprobanteCompra {
    id: number;
    tipo_comprobante: string;
    tipo_comprobante_display?: string;
    serie: string;
    correlativo: string;
    fecha_emision: string;
    fecha_vencimiento?: string;
    forma_pago?: string;
    moneda: string;
    gravadas: number;
    op_exoneradas: number;
    op_inafectas: number;
    op_gratuitas: number;
    dctos_totales: number;
    icbper: number;
    igv: number;
    total: number;
    tipo_documento_proveedor?: string;
    numero_documento_proveedor?: string;
    nombre_proveedor?: string;
    documento_relacionado?: string;
    enlace_verificacion?: string;
    proveedor: CompraProveedor | string;
    items: CompraItem[];
    observaciones: string;
    archivo_xml: string;
    archivo_pdf: string;
    date_created: string;
}

export interface CreateCompra {
    tipo_comprobante: string;
    serie: string;
    correlativo: string;
    fecha_emision: string;
    fecha_vencimiento?: string;
    forma_pago?: string;
    moneda?: string;
    gravadas?: number;
    op_exoneradas?: number;
    op_inafectas?: number;
    op_gratuitas?: number;
    dctos_totales?: number;
    icbper?: number;
    igv?: number;
    total?: number;
    tipo_documento_proveedor?: string;
    numero_documento_proveedor?: string;
    nombre_proveedor?: string;
    documento_relacionado?: string;
    enlace_verificacion?: string;
    observaciones?: string;
    items?: CompraItem[];
    archivo_xml?: File;
}
