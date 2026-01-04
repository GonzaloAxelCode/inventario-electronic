import { User } from "./user.models";

export interface Tienda {
    id: number;

    nombre: string;
    razon_social: string | null;
    ruc: string | null;

    direccion: string | null;
    telefono: string | null;
    email: string | null;

    sol_user: string | null;
    sol_password: string | null; // ⚠️ idealmente no usar en frontend

    logo_img: string | null; // URL del backend
    activo: boolean;
    is_deleted: boolean;

    date_created: string; // ISO string (DateTimeField)
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
    loadingCreateTienda: boolean,
    loadingActiveTienda: boolean,
    loadingTiendas: boolean;
    loadingDeleteTienda: boolean;
    loadingUpdateTienda: boolean;
    errors?: any;
}

