/** Registro mínimo de una compra. El detalle vive en el XML (R2). */
export interface ComprobanteCompra {
    id: number;
    tienda?: number | null;
    proveedor?: number | null;
    proveedor_nombre?: string | null;
    ruc_proveedor: string;
    tipo_comprobante: string;
    tipo_comprobante_display?: string;
    serie: string;
    correlativo: string;
    total?: number;
    xml_constancia?: string | null;
    xml_comprobante?: string | null;
    pdf_url?: string | null;
    estado_codigo?: string | null;
    estado_descripcion?: string | null;
    date_created?: string;
}

/** POST comprobante/compra/validar/ y comprobante/compra/guardar/ */
export interface ValidarCompraRequest {
    rucProveedor: string;
    tipoDoc: '01' | '03' | '07' | string;
    serie: string;
    correlativo: number;
}

export interface ValidarCompraResponse {
    success: boolean;
    valido: boolean;
    solicitante_ruc?: string;
    ruc_proveedor: string;
    tipo_doc: string;
    serie: string;
    correlativo: string;
    codigo: string;
    mensaje: string;
    detalle?: string;
}

export interface GuardarSunatResponse {
    success: boolean;
    message?: string;
    comprobante: string;
    estado_codigo: string;
    estado_descripcion: string;
    xml_url: string;
}

/** POST compras/guardar/ */
export interface GuardarCompraRequest {
    proveedor_id?: number | null;
    rucProveedor?: string;
    tipo_comprobante: string;
    serie: string;
    correlativo: number | string;
    total?: number;
    xml_constancia: string;
    estado_codigo?: string;
    estado_descripcion?: string;
}

export interface CompraResponse {
    count: number;
    next: number | null;
    previous: number | null;
    index_page: number;
    length_pages: number;
    results: ComprobanteCompra[];
}

export interface QuerySearchCompra {
    q?: string;
    tipo_comprobante?: string;
    numero_comprobante?: string;
    proveedor_id?: number;
}
