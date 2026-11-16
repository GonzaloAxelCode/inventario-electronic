
export interface Categoria {
    id?: number;
    nombre: string;
    descripcion: string;
    tipo?: 'REPUESTO' | 'ACCESORIO' | string;
    fechaCreacion?: string;
    fechaActualizacion?: string;
    activo: boolean;
    imagen?: string | null;
    slug?: string;
    orden?: number;
    parent?: number | null;
    destacado: boolean;
    color?: string;
    /** False = predefinida del sistema (no editable ni eliminable). True = creada por ti. */
    update_enable?: boolean;
    date_created?: any
    caracteristicas_template: string[]
}

export type CategoriaCreate = Omit<Categoria, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'parent' | 'destacado' | 'color'> & {
    /** Tienda destino (solo la usa el admin al gestionar otra tienda). */
    tienda?: number | string;
};
export type CategoriaUpdate = Omit<Categoria, 'imagen' | 'activo' | 'orden' | 'color' | 'fechaCreacion' | 'fechaActualizacion' | 'parent' | 'destacado' | 'color'>;

export interface PorcentajeCategoria {
    categoria: string;
    porcentaje: number;
}

export interface PorcentajeCategoriaResponse {
    categorias: PorcentajeCategoria[];
}

export interface SeedCategoriasResponse {
    message: string;
    creadas?: number;
    omitidas?: number;
    omitidas_nombres?: string[];
    eliminadas?: number;
    eliminadas_nombres?: string[];
    total_json: number;
}

