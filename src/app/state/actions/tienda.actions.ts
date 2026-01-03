import { Tienda } from '@/app/models/tienda.models';
import { User } from '@/app/models/user.models';
import { createAction, props } from '@ngrx/store';

export enum ActionTypes {
    LOAD_TIENDAS = 'LOAD_TIENDAS',
    LOAD_TIENDAS_SUCCESS = 'LOAD_TIENDAS_SUCCESS',
    LOAD_TIENDAS_FAIL = 'LOAD_TIENDAS_FAIL',
    CREATE_TIENDA = 'CREATE_TIENDA',
    CREATE_TIENDA_SUCCESS = 'CREATE_TIENDA_SUCCESS',
    CREATE_TIENDA_FAIL = 'CREATE_TIENDA_FAIL',
    DESACTIVATE_TIENDA = 'DESACTIVATE_TIENDA',
    DESACTIVATE_TIENDA_SUCCESS = 'DESACTIVATE_TIENDA_SUCCESS',
    DESACTIVATE_TIENDA_FAIL = 'DESACTIVATE_TIENDA_FAIL',
    ELIMINAR_TIENDA_PERMANENTEMENTE = 'ELIMINAR_TIENDA_PERMANENTEMENTE',
    ELIMINAR_TIENDA_PERMANENTEMENTE_SUCCESS = 'ELIMINAR_TIENDA_PERMANENTEMENTE_SUCCESS',
    ELIMINAR_TIENDA_PERMANENTEMENTE_FAIL = 'ELIMINAR_TIENDA_PERMANENTEMENTE_FAIL',
    AGREGATE_USERS_IN_TIENDA = 'AGREGATE_USERS_IN_TIENDA',
}

export const loadTiendasAction = createAction(
    ActionTypes.LOAD_TIENDAS,

);
export const agregateUsersInTienda = createAction(
    ActionTypes.AGREGATE_USERS_IN_TIENDA,
    props<{ tienda_id: number, newUser: User }>()
);

export const loadTiendasSuccess = createAction(
    ActionTypes.LOAD_TIENDAS_SUCCESS,
    props<{ tiendas: Tienda[] }>()

);

export const loadTiendasFail = createAction(
    ActionTypes.LOAD_TIENDAS_FAIL,
    props<{ error: any }>()
);


export const createTiendaAction = createAction(
    ActionTypes.CREATE_TIENDA,
    props<{ tienda: FormData }>()
);

export const createTiendaSuccess = createAction(
    ActionTypes.CREATE_TIENDA_SUCCESS,
    props<{ tienda: Tienda }>()

);

export const createTiendaFail = createAction(
    ActionTypes.CREATE_TIENDA_FAIL,
    props<{ error: any }>()
);



export const desactivateTiendaAction = createAction(
    ActionTypes.DESACTIVATE_TIENDA,
    props<{ id: number, activo: boolean }>()
);

export const desactivateTiendaSuccess = createAction(
    ActionTypes.DESACTIVATE_TIENDA_SUCCESS,
    props<{ id: number }>()
);

export const desactivateTiendaFail = createAction(
    ActionTypes.DESACTIVATE_TIENDA_FAIL,
    props<{ error: any }>()
);

export const eliminarTiendaPermanently = createAction(
    ActionTypes.ELIMINAR_TIENDA_PERMANENTEMENTE,
    props<{ id: number }>()
);
export const eliminarTiendaPermanentlySuccess = createAction(
    ActionTypes.ELIMINAR_TIENDA_PERMANENTEMENTE_SUCCESS,
    props<{ id: number }>()
);
export const eliminarTiendaPermanentlyFail = createAction(
    ActionTypes.ELIMINAR_TIENDA_PERMANENTEMENTE_FAIL,
    props<{ error: any }>()
);