import { User } from "./user.models";

export interface TiendaStats {
    total_comprobantes: number;
    boletas: number;
    facturas: number;
    total_facturado: string;
    num_personal: number;
    num_productos?: number | null;
    fecha_creacion: string;
    nombre_suscripcion: string | null;
}

/** Propietario anidado (GET /api/tiendas/). Legacy: también puede venir como id numérico. */
export interface TiendaPropietario {
    id: number;
    username?: string;
    first_name?: string;
    last_name?: string;
    full_name?: string;
    photo_url?: string | null;
    is_active?: boolean;
    [key: string]: any;
}

/** Suscripción anidada (GET /api/tiendas/): trae los límites del plan. */
export interface TiendaSuscripcion {
    id?: number;
    nombre_plan?: string;
    periodo_facturacion?: string;
    limite_boletas?: number | null;
    limite_facturas?: number | null;
    limite_personal?: number | null;
    limite_productos?: number | null;
    [key: string]: any;
}

/** Busca una tienda por id incluso anidada un nivel en sucursales. */
export function findTiendaById(tiendas: Tienda[] | null | undefined, id: number | null | undefined): Tienda | null {
    if (id == null) return null;
    for (const t of tiendas ?? []) {
        if (t?.id === id) return t;
        const nested = (t.sucursales ?? []).find(s => s?.id === id);
        if (nested) return nested;
    }
    return null;
}

/** Límite de personal del plan (null = sin dato). Por convención 999999+ = ilimitado. */
export function getLimitePersonal(t: Tienda | null | undefined): number | null {
    const v = (t as any)?.subscripcion_data?.limite_personal;
    return v == null ? null : Number(v);
}

/** Personal actual: estadística del backend o cantidad de usuarios cargados. */
export function getUsoPersonal(t: Tienda | null | undefined, fallback = 0): number {
    const n = (t as any)?.tienda_stats?.num_personal;
    return n == null ? fallback : Number(n);
}

/** true si ya no se puede crear más personal en esta tienda. */
export function limitePersonalAlcanzado(t: Tienda | null | undefined, fallbackUso = 0): boolean {
    const limite = getLimitePersonal(t);
    if (limite == null || limite >= 999999) return false;
    return getUsoPersonal(t, fallbackUso) >= limite;
}
export function getPropietarioId(t: { propietario?: number | TiendaPropietario | null } | any): number | null {
    const p = (t as any)?.propietario;
    if (p == null) return null;
    return typeof p === 'object' ? (p.id ?? null) : p;
}

/** Etiqueta del propietario aceptando objeto nuevo o legacy. */
export function getPropietarioLabel(t: any): string {
    const p = t?.propietario;
    if (p != null && typeof p === 'object') {
        const full = `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.full_name || '';
        return full || p.username || `Propietario #${p.id ?? ''}`;
    }
    const ownerId = getPropietarioId(t);
    if (ownerId == null) return 'Sin propietario';
    const ownerData = t?.propietario_data;
    if (ownerData) {
        const full = `${ownerData.first_name || ''} ${ownerData.last_name || ''}`.trim();
        return full || ownerData.username || `Propietario #${ownerId}`;
    }
    const ownerUser = t?.users_tienda?.find((u: any) => u.id === ownerId);
    if (ownerUser) {
        const full = `${ownerUser.first_name || ''} ${ownerUser.last_name || ''}`.trim();
        return full || ownerUser.username || `Propietario #${ownerId}`;
    }
    return `Propietario #${ownerId}`;
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
    // Keys SUNAT para guías de remisión (por defecto vacías; el GET nunca trae los valores)
    client_id?: string | null;
    client_secret?: string | null;

    logo_img: string | null;
    logo_img_dark?: string | null;
    banner_img?: string | null;
    activo: boolean;
    is_deleted: boolean;
    propietario: number | TiendaPropietario | null;
    propietario_data?: import("./user.models").User;
    tienda_padre: number | null;
    /** Hijas anidadas (un nivel) que devuelve el GET. Legacy: puede venir vacío y derivarse de la lista plana. */
    sucursales?: Tienda[];
    correlativo_inicial_boleta: number;
    correlativo_inicial_factura: number;
    correlativo_inicial_nota_credito: number;
    cert_clave_privada?: string | boolean | null;
    cert_clave_publica?: string | boolean | null;
    tiene_cert_privada?: boolean | null;
    tiene_cert_publica?: boolean | null;
    // Flags que vienen en todo GET de tienda (ya no vienen los valores reales)
    tiene_sol?: boolean | null;
    tiene_certificado?: boolean | null;
    // Flags de keys SUNAT para guías (el GET solo dice si están configuradas o no)
    tiene_client_id?: boolean | null;
    tiene_client_secret?: boolean | null;
    tiene_credenciales_guia?: boolean | null;
    // Periodo del plan asignado (vienen en GET tiendas/, <id>/, mi-tienda/, cambiar-plan/)
    plan_desde?: string | null;
    plan_hasta?: string | null;
    plan_dias_restantes?: number | null;
    tipo_style_boleta_ticket?: string | null;
    tipo_style_boleta_pdf?: string | null;
    tipo_style_factura_pdf?: string | null;
    plan?: number | null;
    tienda_stats?: TiendaStats | null;
    subscripcion_data?: TiendaSuscripcion | null;
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
    limite_productos?: number | null;
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
    limite_productos?: number;
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
    // Periodo del plan (si el backend los envía; si no, se derivan de `mes` + periodo_facturacion)
    fecha_inicio?: string | null;
    fecha_fin?: string | null;
    fecha_vencimiento?: string | null;
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
    plan_desde?: string | null;
    plan_hasta?: string | null;
    plan_dias_restantes?: number | null;
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

