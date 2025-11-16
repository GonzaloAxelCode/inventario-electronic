
import { ActionReducerMap } from '@ngrx/store';
import { AuthState } from '../models/auth.models';

import { ProductoState } from '../models/producto.models';
import { TiendaState } from '../models/tienda.models';
import { authReducer } from './reducers/auth.reducer';
import { cajaReducer, CajaState } from './reducers/caja.reducer';
import { categoriaReducer, CategoriaState } from './reducers/categoria.reducer';
import { clienteReducer, ClienteState } from './reducers/cliente.reducer';
import { inventarioReducer, InventarioState } from './reducers/inventario.reducer';
import { productoReducer } from './reducers/producto.reducer';
import { proveedorReducer, ProveedorState } from './reducers/proveedor.reducer';
import { tiendaReducer } from './reducers/tienda.reducer';
import { userReducer, UserState } from './reducers/user.reducer';
import { ventaReducer, VentaState } from './reducers/venta.reducer';

export interface AppState {
    Auth: AuthState;
    Categoria: CategoriaState;
    Tienda: TiendaState;
    User: UserState;
    Producto: ProductoState;
    Inventario: InventarioState,
    Proveedor: ProveedorState,
    Venta: VentaState,
    Caja: CajaState
    Cliente: ClienteState
}

export const ROOT_REDUCER: ActionReducerMap<AppState> = {
    Auth: authReducer,
    Caja: cajaReducer,
    Categoria: categoriaReducer,
    Tienda: tiendaReducer,
    User: userReducer,
    Producto: productoReducer,
    Inventario: inventarioReducer,
    Proveedor: proveedorReducer,
    Venta: ventaReducer,
    Cliente: clienteReducer
};