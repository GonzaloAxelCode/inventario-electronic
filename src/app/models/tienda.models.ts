import { User } from "./user.models";

export interface Tienda {
    id: number;
    nombre?: string;
    direccion?: string;
    ciudad?: string;
    telefono?: string;
    activo?: boolean;
    encargado?: User | null;
    capacidad?: number;
    date_created?: any;
    ruc?: string;
    imagen?: string | null;
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
    errors?: any;
}

