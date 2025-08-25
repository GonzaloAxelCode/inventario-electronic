import { User, UserPermissions } from '@/app/models/user.models';
import { createAction, props } from '@ngrx/store';

export enum ActionTypes {
    LOAD_USERS = 'LOAD_USERS',
    LOAD_USERS_SUCCESS = 'LOAD_USERS_SUCCESS',
    LOAD_USERS_FAIL = 'LOAD_USERS_FAIL',
    LOAD_USER = 'LOAD_USER',
    LOAD_USER_SUCCESS = 'LOAD_USER_SUCCESS',
    LOAD_USER_FAIL = 'LOAD_USER_FAIL',
    CREATE_USER = 'CREATE_USER',
    CREATE_USER_SUCCESS = 'CREATE_USER_SUCCESS',
    CREATE_USER_FAIL = 'CREATE_USER_FAIL',
    UPDATE_USER = 'UPDATE_USER',
    UPDATE_USER_SUCCESS = 'UPDATE_USER_SUCCESS',
    UPDATE_USER_FAIL = 'UPDATE_USER_FAIL',
    DESACTIVATE_USER = 'DESACTIVATE_USER',
    DESACTIVATE_USER_SUCCESS = 'DESACTIVATE_USER_SUCCESS',
    DESACTIVATE_USER_FAIL = 'DESACTIVATE_USER_FAIL',
    DELETE_USER = 'DELETE_USER',
    DELETE_USER_SUCCESS = 'DELETE_USER_SUCCESS',
    DELETE_USER_FAIL = 'DELETE_USER_FAIL',
    UPDATE_PERMISSIONS_USER = 'UPDATE_PERMISSIONS_USER',
    UPDATE_PERMISSIONS_USER_SUCCESS = 'UPDATE_PERMISSIONS_USER_SUCCESS',
    UPDATE_PERMISSIONS_USER_FAIL = 'UPDATE_PERMISSIONS_USER_FAIL',
    CLEAR_USER = 'CLEAR_USER'
}


export const loadUsersAction = createAction(ActionTypes.LOAD_USERS);

export const loadUsersSuccess = createAction(
    ActionTypes.LOAD_USERS_SUCCESS,
    props<{ users: User[] }>()
);

export const loadUsersFail = createAction(
    ActionTypes.LOAD_USERS_FAIL,
    props<{ error: any }>()
);


export const createUserAction = createAction(
    ActionTypes.CREATE_USER,
    props<{ user: Partial<User>, tienda_id: number }>()
);

export const createUserSuccess = createAction(
    ActionTypes.CREATE_USER_SUCCESS,
    props<{ user: User }>()
);

export const createUserFail = createAction(
    ActionTypes.CREATE_USER_FAIL,
    props<{ error: any }>()
);


export const updateUserAction = createAction(
    ActionTypes.UPDATE_USER,
    props<{ user: Partial<User> }>()
);

export const updateUserSuccess = createAction(
    ActionTypes.UPDATE_USER_SUCCESS,
    props<{ user: User }>()
);

export const updateUserFail = createAction(
    ActionTypes.UPDATE_USER_FAIL,
    props<{ error: any }>()
);


export const desactivateUserAction = createAction(
    ActionTypes.DESACTIVATE_USER,
    props<{ id: any; is_active: boolean }>()
);

export const desactivateUserSuccess = createAction(
    ActionTypes.DESACTIVATE_USER_SUCCESS,
    props<{ id: any, is_active: boolean }>()
);

export const desactivateUserFail = createAction(
    ActionTypes.DESACTIVATE_USER_FAIL,
    props<{ error: any }>()
);


export const deleteUserAction = createAction(
    ActionTypes.DELETE_USER,
    props<{ id: number }>()
);

export const deleteUserSuccess = createAction(
    ActionTypes.DELETE_USER_SUCCESS,
    props<{ id: number }>()
);

export const deleteUserFail = createAction(
    ActionTypes.DELETE_USER_FAIL,
    props<{ error: any }>()
);

export const loadUserAction = createAction(
    ActionTypes.LOAD_USER,
);

export const loadUserSuccess = createAction(
    ActionTypes.LOAD_USER_SUCCESS,
    props<{ user: User; }>()
);

export const loadUserFail = createAction(
    ActionTypes.LOAD_USER_FAIL,
    props<{ error: any }>()
);


export const updateUserPermissionsAction = createAction(
    ActionTypes.UPDATE_PERMISSIONS_USER,
    props<{ id: any; permissions: Partial<UserPermissions> }>()
);

export const updateUserPermissionsSuccess = createAction(
    ActionTypes.UPDATE_PERMISSIONS_USER_SUCCESS,
    props<{ id: any; permissions: Partial<UserPermissions> }>()
);

export const updateUserPermissionsFail = createAction(
    ActionTypes.UPDATE_PERMISSIONS_USER_FAIL,
    props<{ error: any }>()
);


export const clearUserAction = createAction(
    ActionTypes.CLEAR_USER,

);