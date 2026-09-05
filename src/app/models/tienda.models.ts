import { User } from "./user.models";

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

