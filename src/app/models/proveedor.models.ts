export interface Proveedor {
    id: number;
    nombre: string;
    ruc: string;
    razon_social: string;
    direccion: string;
    telefono: string;
    email: string;
    contacto: string;
    tipo_producto: string;
    calificacion: number;
    activo: boolean;
    tienda: number;
    date_created: string;
}

export interface ProveedorCreate {
    nombre: string;
    ruc?: string;
    razon_social?: string;
    direccion?: string;
    telefono?: string;
    email?: string;
    contacto?: string;
    tipo_producto?: string;
    calificacion?: number;
    activo?: boolean;
}

export interface ToggleProveedorResponse {
    message: string;
    id: number;
    ruc: string;
    activo: boolean;
}
