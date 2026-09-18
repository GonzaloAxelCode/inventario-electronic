import { User } from "./user.models";

export interface TiendaStats {
    total_comprobantes: number;
    boletas: number;
    facturas: number;
    total_facturado: string;
    num_personal: number;
    fecha_creacion: string;
    nombre_suscripcion: string | null;
}

export interface Tienda {
    id: number;

    nombre: string;
    razon_social: string | null;
    ruc: string | null;

    direccion: string | null;
    telefono: string | null;
    email: string | null;
    serie: string | null;
    representante: string | null;
    sol_user: string | null;
    sol_password: string | null;

    logo_img: string | null;
    activo: boolean;
    is_deleted: boolean;
    propietario: number | null;
    propietario_data?: import("./user.models").User;
    tienda_padre: number | null;
    correlativo_inicial_boleta: number;
    correlativo_inicial_factura: number;
    correlativo_inicial_nota_credito: number;
    tipo_style_boleta_ticket?: string | null;
    tipo_style_boleta_pdf?: string | null;
    tipo_style_factura_pdf?: string | null;
    plan?: number | null;
    tienda_stats?: TiendaStats | null;
    date_created: string;
    users_tienda: User[];
}


export interface TiendaCreate {
    nombre: string;
    razon_social?: string;
    ruc?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    sol_user?: string;
    sol_password?: string;
    logo_img?: File | null; // para enviar el archivo
}

export interface PlanSuscripcion {
    id: number;
    nombre_plan: string;
    descripcion?: string | null;
    lista_descripcion?: string[];
    limite_boletas: number;
    limite_facturas: number;
    limite_personal: number;
    precio_mensual: string;
    precio_anual?: string | null;
    moneda: string;
    periodo_facturacion: string;
    activo: boolean;
    fecha_creacion?: string;
}

export interface PlanSuscripcionCreate {
    nombre_plan: string;
    descripcion?: string;
    lista_descripcion?: string[];
    limite_boletas: number;
    limite_facturas: number;
    limite_personal: number;
    precio_mensual: string;
    precio_anual?: string;
    moneda?: string;
    periodo_facturacion?: string;
    activo?: boolean;
}

export type PlanSuscripcionUpdate = Partial<PlanSuscripcionCreate>;

export interface UsoMensualTienda {
    // Forma nueva API: { boletas_emitidas, facturas_emitidas, mes: "2026-09-01" }
    boletas_emitidas?: number;
    facturas_emitidas?: number;
    mes?: number | string;
    // Forma legacy / alternativa
    id?: number;
    tienda?: number;
    anio?: number;
    total_boletas?: number;
    total_facturas?: number;
    total_personal?: number;
}

export interface SuscripcionTiendaResponse {
    plan_actual: PlanSuscripcion | null;
    uso_mensual: UsoMensualTienda | null;
}

export interface TiendaState {
    tiendas: Tienda[];
    miTienda: Tienda | null;
    loadingCreateTienda: boolean,
    loadingActiveTienda: boolean,
    loadingTiendas: boolean;
    loadingDeleteTienda: boolean;
    loadingUpdateTienda: boolean;
    loadingMiTienda: boolean;
    errors?: any;
}

