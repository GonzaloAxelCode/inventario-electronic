import { GuiaRemisionRemitente, CreateGuiaRemision } from '@/app/models/guia-remision.models';
import { createAction, props } from '@ngrx/store';

export enum GuiaRemisionActionTypes {
    CARGAR_GUIAS = '[GuiaRemision] Cargar Guias',
    CARGAR_GUIAS_EXITO = '[GuiaRemision] Cargar Guias Exito',
    CARGAR_GUIAS_ERROR = '[GuiaRemision] Cargar Guias Error',

    CREAR_GUIA = '[GuiaRemision] Crear Guia',
    CREAR_GUIA_EXITO = '[GuiaRemision] Crear Guia Exito',
    CREAR_GUIA_ERROR = '[GuiaRemision] Crear Guia Error',

    ANULAR_GUIA = '[GuiaRemision] Anular Guia',
    ANULAR_GUIA_EXITO = '[GuiaRemision] Anular Guia Exito',
    ANULAR_GUIA_ERROR = '[GuiaRemision] Anular Guia Error',
}

export const cargarGuias = createAction(
    GuiaRemisionActionTypes.CARGAR_GUIAS,
    props<{ page?: number; page_size?: number; busqueda?: string }>()
);

export const cargarGuiasExito = createAction(
    GuiaRemisionActionTypes.CARGAR_GUIAS_EXITO,
    props<{
        guias: GuiaRemisionRemitente[];
        count: number;
        next: any;
        previous: any;
        index_page: any;
        length_pages: any;
    }>()
);

export const cargarGuiasError = createAction(
    GuiaRemisionActionTypes.CARGAR_GUIAS_ERROR,
    props<{ error: any }>()
);

export const crearGuia = createAction(
    GuiaRemisionActionTypes.CREAR_GUIA,
    props<{ guia: CreateGuiaRemision }>()
);

export const crearGuiaExito = createAction(
    GuiaRemisionActionTypes.CREAR_GUIA_EXITO,
    props<{ guia: GuiaRemisionRemitente }>()
);

export const crearGuiaError = createAction(
    GuiaRemisionActionTypes.CREAR_GUIA_ERROR,
    props<{ error: any }>()
);

export const anularGuia = createAction(
    GuiaRemisionActionTypes.ANULAR_GUIA,
    props<{ id: number }>()
);

export const anularGuiaExito = createAction(
    GuiaRemisionActionTypes.ANULAR_GUIA_EXITO,
    props<{ guia: GuiaRemisionRemitente }>()
);

export const anularGuiaError = createAction(
    GuiaRemisionActionTypes.ANULAR_GUIA_ERROR,
    props<{ error: any }>()
);
