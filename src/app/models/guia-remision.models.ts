
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
