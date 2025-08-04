export interface Tienda {
    id: number;
    nombre?: string;
    direccion?: string;
    ciudad?: string;
    telefono?: string;
    activo?: boolean;
    encargadoId?: number | null;
    capacidad?: number;
    ruc?: string;
    imagen?: string | null;
}
export type TiendaCreate = Omit<Tienda, 'id' | 'activo' | 'encargadoId' | 'parent' | 'capacidad' | 'imagen' | 'ciudad'>;



export interface TiendaState {
    tiendas: Tienda[];
    loadingTiendas?: boolean;
    errors?: any;
}

