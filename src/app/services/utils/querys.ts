export interface QuerySearchProduct {
    nombre: string;
    categoria: number;
    sku: string;
    /** Búsqueda unificada del input único (nombre o SKU). */
    q?: string;
    marca?: string;
    modelo?: string;
    activo: any;
}
