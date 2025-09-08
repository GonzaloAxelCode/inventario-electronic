
export interface Categoria {
    id?: number;
    nombre: string;
    descripcion: string;
    fechaCreacion?: string;
    fechaActualizacion?: string;
    activo: boolean;
    imagen?: string | null;
    slug?: string;
    orden?: number;
    parent?: number | null;
    destacado: boolean;
    color?: string;
    siglas_nombre_categoria?: string,
    date_created?: any
}

export type CategoriaCreate = Omit<Categoria, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'parent' | 'destacado' | 'color'>;
export type CategoriaUpdate = Omit<Categoria, 'imagen' | 'activo' | 'orden' | 'color' | 'fechaCreacion' | 'fechaActualizacion' | 'parent' | 'destacado' | 'color'>;

