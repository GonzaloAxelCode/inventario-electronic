
export interface GuiaRemisionRemitente {
    id: number;
    serie: string;
    correlativo: string;
    fecha_emision: string;
    fecha_traslado: string;

    ruc_remitente: string;
    razon_social_remitente: string;
    direccion_remitente: string;
    ubigeo_remitente: string;

    ruc_destinatario: string;
    razon_social_destinatario: string;
    direccion_destinatario: string;
    ubigeo_destinatario: string;

    punto_partida: string;
    punto_llegada: string;

    motivo_traslado: string;
    motivo_traslado_display?: string;

    datos_transportista: Transportista;

    items: GuiaRemisionItem[];
    peso_total_kg: number;
    num_bultos: number;

    estado: string;
    estado_display?: string;

    observaciones: string;
    date_created: string;
    date_updated: string;

    /** Respuesta de SUNAT al crear con "enviar": true o al enviar un borrador. */
    envio?: EnvioGuiaResponse | null;
}

export interface EnvioGuiaResponse {
    ok?: boolean;
    numero_guia?: string;
    ambiente?: string;
    xml_url?: string;
    pdf_url?: string;
    cdr_url?: string;
}

export interface Transportista {
    razon_social: string;
    ruc: string;
    nombre_chofer: string;
    dni_chofer: string;
    placa_vehiculo: string;
    numero_licencia: string;
}

export interface GuiaRemisionItem {
    codigo: string;
    descripcion: string;
    unidad_medida: string;
    cantidad: number;
    peso_kg?: number;
}

export interface CreateGuiaRemision {
    serie?: string;
    correlativo?: string;
    fecha_emision?: string;
    fecha_traslado?: string;

    ruc_remitente?: string;
    razon_social_remitente?: string;
    direccion_remitente?: string;
    ubigeo_remitente?: string;

    ruc_destinatario?: string;
    razon_social_destinatario?: string;
    direccion_destinatario?: string;
    ubigeo_destinatario?: string;

    punto_partida?: string;
    punto_llegada?: string;

    motivo_traslado?: string;

    datos_transportista?: Transportista;

    items?: GuiaRemisionItem[];
    peso_total_kg?: number;
    num_bultos?: number;

    observaciones?: string;
}

/* ==================== API nueva (SUNAT) ==================== */

export interface GuiaSearchQuery {
    serie?: string;
    numero_guia?: string;
    estado?: string;
    estado_sunat?: string;
    mod_traslado?: string;
    cod_traslado?: string;
    dest_nombre?: string;
    dest_num_doc?: string;
    vehiculo_placa?: string;
    search?: string;
}

export interface GuiaSearchPayload {
    from_date?: string;
    to_date?: string;
    page?: number;
    page_size?: number;
    query?: GuiaSearchQuery;
}

export interface GuiaSearchResponse {
    count: number;
    next: any;
    previous: any;
    index_page: number;
    length_pages: number;
    results: any[];
}

export interface GuiaConductorPayload {
    tipo: string;
    tipo_doc: string;
    nro_doc: string;
    nombres: string;
    apellidos: string;
    licencia: string;
}

export interface GuiaItemPayload {
    codigo: string;
    descripcion: string;
    unidad: string;
    cantidad: number;
    cod_prod_sunat?: string;
    atributos?: { code: string; name: string; value: string }[];
}

export interface GuiaVehiculoSecundario {
    placa: string;
    nroCirculacion?: string;
    nroAutorizacion?: string;
    codEmisor?: string;
}

export interface CreateGuiaPayload {
    serie: string;
    observacion?: string;
    emisor_ubigeo?: string;
    emisor_departamento?: string;
    emisor_provincia?: string;
    emisor_distrito?: string;
    dest_tipo_doc: string;
    dest_num_doc: string;
    dest_nombre: string;
    dest_direccion?: string;
    mod_traslado: string;
    cod_traslado?: string;
    des_traslado?: string;
    fec_traslado: string;
    peso_total: number;
    und_peso_total?: string;
    peso_items?: number;
    sustento_peso?: string;
    num_bultos: number;
    partida_ubigeo: string;
    partida_direccion: string;
    partida_cod_local?: string;
    partida_ruc?: string;
    llegada_ubigeo: string;
    llegada_direccion: string;
    llegada_cod_local?: string;
    llegada_ruc?: string;
    vehiculo_placa: string;
    vehiculo_nro_circulacion?: string;
    vehiculo_nro_autorizacion?: string;
    vehiculo_cod_emisor?: string;
    vehiculo_secundarios?: GuiaVehiculoSecundario[];
    transportista_tipo_doc?: string;
    transportista_num_doc?: string;
    transportista_nombre?: string;
    transportista_nro_mtc?: string;
    indicadores?: string[];
    contenedores?: string[];
    items: GuiaItemPayload[];
    conductores: GuiaConductorPayload[];
    docs_relacionados?: { tipo_desc?: string; tipo: string; nro: string; emisor?: string }[];
    enviar?: boolean;
}
