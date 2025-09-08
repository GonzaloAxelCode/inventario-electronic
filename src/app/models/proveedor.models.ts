export interface Proveedor {
    id: number;
    nombre: string;
    direccion: string;
    telefono: string;
    email: string;
    contacto: string;
    fecha_registro: Date;
    activo: boolean;
    tipo_producto: string;
    date_created?: any
    calificacion: number;
}
export type ProveedorCreate = Omit<Proveedor, 'id' | 'contacto' | 'activo' | 'calificacion' | 'email' | 'fecha_registro'>;