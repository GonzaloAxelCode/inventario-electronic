import { User } from "./user.models";

export interface Tienda {
    id: number;
    nombre?: string;
    direccion?: string;
    ciudad?: string;
    telefono?: string;
    activo?: boolean;
    encargado?: User | null;     // 👈 objeto completo, no solo ID
    capacidad?: number;
    date_created?: any
    ruc?: string;
    imagen?: string | null;
    users_tienda: User[];       // 👈 array de usuarios
}
export type TiendaCreate = Omit<Tienda, 'id' | 'users_tienda' | 'activo' | 'encargado' | 'parent' | 'capacidad' | 'imagen' | 'ciudad'>;



export interface TiendaState {
    tiendas: Tienda[];
    loadingCreateTienda: boolean,
    loadingActiveTienda: boolean,
    loadingTiendas: boolean;
    loadingDeleteTienda: boolean;
    errors?: any;
}

