import { Inventario } from "./inventario.models";

export interface Producto {
    id: number,
    nombre: string;
    descripcion: string | null;
    categoria: number
    sku: string;
    marca?: string | null;
    modelo?: string | null;
    caracteristica?: Record<string, any>;
    fecha_creacion?: Date;
    fecha_actualizacion?: Date;
    activo?: boolean;
    categoria_nombre?: string
    date_created?: any
    imagen: string;
    is_inventario?: boolean
    inventario?: Inventario | null
}

export type ProductoCreate = Omit<Producto,
    'id' |
    'fecha_creacion' |
    'fecha_actualizacion' |
    'activo' |
    'categoria_nombre' |
    'imagen'  // quitamos string URL, la reemplazaremos con File
> & {
    imagen?: File | null; // nuevo campo para subir archivo
};


export interface ProductoState {
    loadingSearch: boolean,
    count: number,
    search_found: boolean,
    next: any,
    previous: any,
    index_page: any,
    length_pages: any,
    productos: Producto[];
    productos_search: Producto[];
    loadingProductos?: boolean;
    errors?: any;

    loadingCreate: boolean;
    loadingUpdate: boolean;
    loadingDeactivate: boolean;
    loadingDelete: boolean;
}


