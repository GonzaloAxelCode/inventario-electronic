export interface Producto {
    id: number,
    nombre?: string;
    descripcion?: string | null;
    categoria?: number | null;
    sku?: string;
    marca?: string | null;
    modelo?: string | null;
    caracteristica?: Record<string, any>;
    fecha_creacion?: Date;
    fecha_actualizacion?: Date;
    activo?: boolean;
    categoria_nombre?: string
}

export type ProductoCreate = Omit<Producto, 'id' |
    'fechaCreacion' |
    'fechaActualizacion' |
    'activo' |
    'imagen' |
    'proveedorId'>;



export interface ProductoState {
    loadingSearch: boolean,
    count: number,
    search_products_found: string,
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


