
export interface CompraProveedor {
    id?: number;
    nombre?: string;
    ruc?: string;
    tipo_documento?: string;
    numero_documento?: string;
}

export interface CompraProveedorInput {
    id?: number;
    nombre?: string;
    tipo_documento?: string;
    numero_documento?: string;
}

export interface CompraItem {
    producto?: string;
    descripcion?: string;
    codigo?: string;
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
}

export interface CompraItemInput {
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
    descripcion?: string;
    codigo?: string;
    /** Alias legacy: se mapea a descripcion al enviar */
    producto?: string;
}

export interface ComprobanteCompra {
    id: number;
    tipo_comprobante: string;
    tipo_comprobante_display?: string;
    serie: string;
    correlativo: string;
    /** Serie-Correlativo concatenado (backend nuevo) */
    numero_comprobante?: string;
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
    proveedor: CompraProveedor | string | null;
    items: CompraItem[];
    observaciones: string;
    archivo_xml?: string;
    archivo_pdf?: string;
    /** Backend nuevo: urls directas */
    xml_url?: string | null;
    pdf_url?: string | null;
    image_url?: string | null;
    con_pdf?: boolean;
    con_xml?: boolean;
    date_created: string;
}

export interface CreateCompra {
    tipo_comprobante: '01' | '03' | string;
    serie: string;
    correlativo: string;
    fecha_emision: string;
    fecha_vencimiento?: string;
    forma_pago?: string;
    moneda?: string;
    /** Nuevo formato. Si se usa el legacy (tipo/numero/nombre_proveedor), el service lo mapea. */
    proveedor?: CompraProveedorInput;
    total?: number;
    igv?: number;
    gravadas?: number;
    op_exoneradas?: number;
    op_inafectas?: number;
    op_gratuitas?: number;
    dctos_totales?: number;
    icbper?: number;
    documento_relacionado?: string | null;
    enlace_verificacion?: string | null;
    observaciones?: string;
    items: CompraItemInput[];
    /** Solo-URL (sin subir archivo). Si hay File, usar los campos File de abajo. */
    xml_url?: string | null;
    pdf_url?: string | null;
    image_url?: string | null;
    // ---------- Files (multipart) ----------
    /** Keys backend: xml (alias archivo_xml) */
    xml?: File;
    /** Keys backend: pdf (alias archivo_pdf) */
    pdf?: File;
    /** Keys backend: imagen (alias image/foto/archivo_imagen) */
    imagen?: File;
    // ---------- Legacy (compat, se mapean al nuevo formato) ----------
    /** @deprecated usar proveedor */
    tipo_documento_proveedor?: string;
    /** @deprecated usar proveedor */
    numero_documento_proveedor?: string;
    /** @deprecated usar proveedor */
    nombre_proveedor?: string;
    /** @deprecated usar xml */
    archivo_xml?: File;
    /** @deprecated usar pdf */
    archivo_pdf?: File;
}

export interface ComprobanteFile {
    id: number;
    tienda: number;
    tipo_comprobante: string;
    tipo_comprobante_codigo: string;
    xml_url: string | null;
    pdf_url: string | null;
    observaciones: string;
    date_created: string;
}

export interface SubirFileResponse {
    message: string;
    data: {
        id: number;
        tienda: number;
        tipo_comprobante: string;
        xml_url: string | null;
        pdf_url: string | null;
        observaciones: string;
        date_created: string;
    };
}

export interface ComprobanteFilesResponse {
    message: string;
    data: {
        id: number;
        tienda: number;
        tipo_comprobante: string;
        xml_url: string | null;
        pdf_url: string | null;
        observaciones: string;
        date_created: string;
    };
}

/**
 * Cambios parciales para PATCH /api/compras/actualizar/<id>/.
 * Solo se envía lo que cambia; el resto se conserva.
 * Archivos por kind: File = Reemplazar, eliminar_* = Quitar, omitir = Restaurar.
 */
export interface UpdateCompra {
    tipo_comprobante?: string;
    serie?: string;
    correlativo?: string;
    fecha_emision?: string;
    fecha_vencimiento?: string;
    forma_pago?: string;
    moneda?: string;
    proveedor?: CompraProveedorInput;
    items?: CompraItemInput[];
    total?: number;
    igv?: number;
    gravadas?: number;
    op_exoneradas?: number;
    op_inafectas?: number;
    op_gratuitas?: number;
    dctos_totales?: number;
    icbper?: number;
    documento_relacionado?: string | null;
    enlace_verificacion?: string | null;
    observaciones?: string;
    /** Reemplazar: File. Quitar: eliminar_* true o url null. Restaurar: omitir. */
    xml?: File | null;
    pdf?: File | null;
    imagen?: File | null;
    eliminar_xml?: boolean;
    eliminar_pdf?: boolean;
    eliminar_imagen?: boolean;
    xml_url?: string | null;
    pdf_url?: string | null;
    image_url?: string | null;
}
