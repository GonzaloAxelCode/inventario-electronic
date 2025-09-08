
export enum TipoOperacion {
    INGRESO = 'ingreso',
    GASTO = 'gasto',
    PRESTAMO = 'prestamo',
    VENTA = 'venta',
    REINICIALIZACION = 'reinicializacion',
}

export enum EstadoCaja {
    ABIERTA = 'abierta',
    CERRADA = 'cerrada',
    CANCELADA = 'cancelada',
}


export interface Caja {
    id: number;
    tienda: number;
    usuario_apertura: number;
    usuario_cierre: number;
    fecha_apertura: string;
    fecha_cierre: string
    saldo_inicial: number;
    ingresos: number;
    egresos: number;
    saldo_final: number;
    estado: EstadoCaja;
    observacion?: string;
    date_created?: any
    operaciones: OperacionCaja[];
}

export interface OperacionCaja {
    id: number;

    caja: number;
    id_operacion: string;
    tipo: TipoOperacion;
    usuario: number | null;
    monto: number;
    fecha: any;
    detalles?: string | null;
}
