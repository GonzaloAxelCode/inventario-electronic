import { User } from '@/app/models/user.models';

import { createReducer, on } from '@ngrx/store';
import {
    clearUserAction,
    createUserAction,
    createUserFail,
    createUserSuccess,
    deleteUserAction,
    deleteUserFail,
    deleteUserSuccess,
    desactivateUserAction,
    desactivateUserFail,
    desactivateUserSuccess,
    loadUserAction,
    loadUserFail,
    loadUsersAction,
    loadUsersFail,
    loadUsersSuccess,
    loadUserSuccess,
    updateUserAction,
    updateUserFail,
    updateUserPermissionsAction,
    updateUserPermissionsFail,
    updateUserPermissionsSuccess,
    updateUserSuccess
} from '../actions/user.actions';

export interface UserState {
    users: User[];
    user: User,
    loadingUsers: boolean;
    loadingCreateUser: boolean;
    loadingActivateUser: boolean;
    errors: any;
    loadingCurrentUser: boolean
    loadingUpdateUser: boolean;
    loadingUpdatePermissions: boolean
}
export const userInitial = {
    id: 0,
    username: 'Desconocido',
    first_name: '',
    last_name: '',
    photo_url: '',
    date_joined: new Date(),
    is_active: false,
    is_staff: false,
    is_superuser: false,
    es_empleado: false,
    desactivate_account: false,
    permissions: {
        can_make_sale: false,
        can_cancel_sale: false,
        can_create_inventory: false,
        can_modify_inventory: false,
        can_update_inventory: false,
        can_delete_inventory: false,
        can_create_product: false,
        can_update_product: false,
        can_delete_product: false,
        can_create_category: false,
        can_modify_category: false,
        can_delete_category: false,
        can_create_supplier: false,
        can_modify_supplier: false,
        can_delete_supplier: false,
        can_create_store: false,
        can_modify_store: false,
        can_delete_store: false,
        view_sale: false,
        view_inventory: false,
        view_product: false,
        view_category: false,
        view_supplier: false,
        view_store: false,
    }
}
export const initialStateUser: UserState = {
    users: [],
    loadingUsers: false,
    errors: {},
    loadingCreateUser: false,
    loadingActivateUser: false,
    loadingUpdateUser: false,
    loadingUpdatePermissions: false,
    user: null as unknown as User,
    loadingCurrentUser: false
};

export const userReducer = createReducer(
    initialStateUser,


    on(loadUsersAction, state => ({
        ...state,
        loadingUsers: true
    })),
    on(loadUsersSuccess, (state, { users }) => ({
        ...state,
        users,
        loadingUsers: false
    })),
    on(loadUsersFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingUsers: false
    })),


    on(createUserAction, state => ({
        ...state,
        loadingCreateUser: true
    })),
    on(createUserSuccess, (state, { user }) => ({
        ...state,
        users: [...state.users, user],
        loadingCreateUser: false
    })),
    on(createUserFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingCreateUser: false
    })),


    on(updateUserAction, state => ({
        ...state,
        loadingUpdateUser: true
    })),
    on(updateUserSuccess, (state, { user }) => ({
        ...state,
        users: state.users.map(u => u.id === user.id ? user : u),
        loadingUpdateUser: false
    })),
    on(updateUserFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingUpdateUser: false
    })),


    on(desactivateUserAction, state => ({
        ...state,
        loadingActivateUser: true
    })),
    on(desactivateUserSuccess, (state, { id, is_active }) => ({
        ...state,
        users: state.users.map((user) =>
            user.id === id ? { ...user, is_active } : user
        ),
        loadingActivateUser: false
    })),
    on(desactivateUserFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingActivateUser: false
    })),


    on(deleteUserAction, state => ({
        ...state,
        loadingDeleteUser: true
    })),
    on(deleteUserSuccess, (state, { id }) => ({
        ...state,
        users: state.users.filter(user => user.id !== id),
        loadingDeleteUser: false
    })),
    on(deleteUserFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingDeleteUser: false
    })),
    on(clearUserAction, (state) => {

        return {
            ...state,
            user: null as unknown as User,
            users: []
        }
    }),

    on(loadUserAction, state => ({
        ...state,
        loadingCurrentUser: true

    })),
    on(loadUserSuccess, (state, { user }) => {

        return {
            ...state,
            user: { ...user },
            loadingCurrentUser: false
        }


    }),
    on(loadUserFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingCurrentUser: false

    })),
    on(updateUserPermissionsAction, (state) => ({
        ...state,
        loadingUpdatePermissions: true
    })),
    on(updateUserPermissionsSuccess, (state, { id, permiso, valor }) => ({
        ...state,
        users: state.users.map(user =>
            user.id === id
                ? {
                    ...user,
                    permissions: {
                        ...user.permissions,
                        [permiso]: valor, // 👈 solo actualiza el permiso específico
                    },
                }
                : user
        ),
        loadingUpdatePermissions: false,
    })),


    on(updateUserPermissionsFail, (state, { error }) => ({
        ...state,
        errors: error,
        loadingUpdatePermissions: false

    })),
);
