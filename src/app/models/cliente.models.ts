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
