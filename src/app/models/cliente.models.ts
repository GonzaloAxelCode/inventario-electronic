export interface Cliente {
    id?: number;
    document: string;
    fullname: string;
    firstname: string;
    lastname: string;
    department?: string;
    province?: string;
    district?: string;
    address?: string;
    phone: string;
    email?: string;
    tienda?: number;
    activo?: boolean;
}

export interface ClienteCreate {
    document?: string;
    fullname?: string;
    firstname?: string;
    lastname?: string;
    department?: string;
    province?: string;
    district?: string;
    address?: string;
    phone?: string;
    email?: string;
}

export interface ClienteUpdate extends ClienteCreate {
    id: number;
}

export interface ResumenClientes {
    total_clientes: number;
    nuevos_hoy: number;
    nuevos_semana: number;
    nuevos_mes: number;
}

export interface ClienteFrecuente {
    nombre: string;
    celular: string;
    total_compras: number;
}

export interface ClientesFrecuentesResponse {
    anio: number;
    mes: number;
    clientes_frecuentes: ClienteFrecuente[];
}

export interface TopClienteCompra {
    nombre: string;
    celular: string;
    total_gastado: number;
}

export interface TopClientesCompraResponse {
    anio: number;
    mes: number;
    top_clientes: TopClienteCompra[];
}
