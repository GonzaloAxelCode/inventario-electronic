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
    tienda?: number | null
    tienda_nombre?: string | null
    permissions: UserPermissions;
    user_permissions_list: string[];   // 👈 faltaba
    all_permissions_meta: string[];    // 👈 faltaba
}

export interface UserPermissions {
    can_make_sale: boolean;
    can_cancel_sale: boolean;
    can_create_inventory: boolean;
    can_modify_inventory: boolean;
    can_update_inventory: boolean;
    can_delete_inventory: boolean;
    can_create_product: boolean;
    can_update_product: boolean;
    can_delete_product: boolean;
    can_create_category: boolean;
    can_modify_category: boolean;
    can_delete_category: boolean;
    can_create_supplier: boolean;
    can_modify_supplier: boolean;
    can_delete_supplier: boolean;
    can_create_store: boolean;
    can_modify_store: boolean;
    can_delete_store: boolean;
    view_sale: boolean;
    view_inventory: boolean;
    view_product: boolean;
    view_category: boolean;
    view_supplier: boolean;
    view_store: boolean;
    can_create_user: boolean;   // 👈 también faltaba
}

export interface CreateUser {
    username: string;
    password: string;
    first_name?: string;
    last_name?: string;
    is_active: boolean;
}