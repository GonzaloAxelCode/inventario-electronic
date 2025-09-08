export interface Inventario {
    id: number
    producto: number;
    tienda: number;
    cantidad: number;
    stock_minimo: number;
    stock_maximo: number;
    costo_compra: number;
    costo_venta: number;
    fecha_actualizacion: Date;
    activo: boolean;
    lote?: string;
    fecha_vencimiento?: Date | null;
    estado: string;
    proveedor: number | any
    responsable: number | any
    descripcion: string
    producto_nombre: string,
    tienda_nombre: string,
    date_created?: any
    proveedor_nombre: string,
    responsable_nombre: string
    categoria_nombre: string
    categoria_id: number
}

export type InventarioCreate = Omit<Inventario, 'id' |
    'fecha_actualizacion' |
    'activo' |
    'estado' | 'responsable' |
    'lote'>;

