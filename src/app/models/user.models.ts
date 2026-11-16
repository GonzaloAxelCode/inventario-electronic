import { Tienda } from "./tienda.models";

export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    photo_url: string;
    date_joined: Date;
    is_active: boolean;
    is_staff: boolean;
    is_superuser: boolean;
    es_empleado: boolean;
    desactivate_account: boolean;
    tienda: any | number;
    tienda_nombre?: string | null;
    tienda_data?: Tienda;
    rol?: 'superuser' | 'empleado' | 'usuario' | string;
    es_propietario?: boolean;
    /** Flag de escritura: crear este usuario como propietario de la tienda. */
    is_propietario?: boolean;
    permissions: UserPermissions;
    user_permissions_list: string[];
    all_permissions_meta: string[];
    date_created?: any;
    theme?: 'light' | 'dark';
    navbar_type?: 'top' | 'normal';
    modulos_habilitados?: string[];
}

export interface UserPermissions {
    can_make_sale: boolean;
    can_cancel_sale: boolean;
    can_create_inventory: boolean;
    can_modify_inventory: boolean;
    can_delete_inventory: boolean;
    can_create_celular: boolean;
    can_update_celular: boolean;
    can_delete_celular: boolean;
    can_create_compra: boolean;
    can_update_compra: boolean;
    can_delete_compra: boolean;
    can_manage_pedido: boolean;
    view_stats_general: boolean;
    view_stats_ventas: boolean;
    view_stats_inventario: boolean;
    view_ganancia: boolean;
    can_export_data: boolean;
    can_make_backup: boolean;
}

export interface CreateUser {
    username: string;
    password: string;
    first_name?: string;
    last_name?: string;
    is_active: boolean;
}
