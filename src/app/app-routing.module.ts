import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';
import { superUserGuard } from './guards/superuser.guard';

import { roleRedirectGuard } from './guards/role-redirect.guard';

import { AdminlayoutComponent } from './layouts/adminlayout/adminlayout.component';
import { AuthlayoutComponent } from './layouts/authlayout/authlayout.component';
import { MainlayoutComponent } from './layouts/mainlayout/mainlayout.component';

import { ComprasComponent } from './pages/compras/compras.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HacerventaComponent } from './pages/hacerventa/hacerventa.component';
import { LoginComponent } from './pages/login/login.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ProductosComponent } from './pages/productos/productos.component';

import { TiendasComponent } from './pages/tiendas/tiendas.component';
import { VentasComponent } from './pages/ventas/ventas.component';

import { MyaccountComponent } from './components/settingscomponents/myaccount/myaccount.component';
import { PermisossettingsComponent } from './components/settingscomponents/permisossettings/permisossettings.component';
import { SeguridadComponent } from './components/settingscomponents/seguridad/seguridad.component';
import { SettingslayoutComponent } from './components/settingscomponents/settingslayout/settingslayout.component';
import { TemasSettingsComponent } from './components/settingscomponents/temassettings/temassettings.component';


import { normalUserGuard } from './guards/appuser.guard';
import { AdminhistoryComponent } from './pages/admin/adminhistory/adminhistory.component';
import { AdminhomeComponent } from './pages/admin/adminhome/adminhome.component';
import { AdminmanagestoreComponent } from './pages/admin/adminmanagestore/adminmanagestore.component';
import { AdminsettingsComponent } from './pages/admin/adminsettings/adminsettings.component';
import { AdmintiendadetailComponent } from './pages/admin/admintiendadetail/admintiendadetail.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { ProveedoresComponent } from './pages/proveedores/proveedores.component';
import { PedidosComponent } from './pages/pedidos/pedidos.component';
import { GuiaRemisionComponent } from './pages/guia-remision/guia-remision.component';

const routes: Routes = [
	// Rutas para USUARIOS NORMALES - Solo accesibles por usuarios no-superusuarios
	{
		path: 'app',
		component: MainlayoutComponent,
		canActivate: [authGuard, normalUserGuard()],
		canActivateChild: [authGuard],
		children: [
			{ path: '', component: DashboardComponent },

			{ path: 'ventas', component: VentasComponent },
			{ path: 'ventas/crear', component: HacerventaComponent },
			{ path: 'productos', component: ProductosComponent },

			{ path: 'perfil', component: PerfilComponent },
			{ path: 'clientes', component: ClientesComponent },
			{ path: 'tiendas', component: TiendasComponent },
			{ path: 'compras', component: ComprasComponent },
			{ path: 'pedidos', component: PedidosComponent },
			{ path: 'proveedores', component: ProveedoresComponent },
			{ path: 'guia-remision', component: GuiaRemisionComponent },
			{
				path: 'settings',
				component: SettingslayoutComponent,
				children: [
					{ path: '', redirectTo: 'cuenta', pathMatch: 'full' },
					{ path: 'cuenta', component: MyaccountComponent },
					{ path: 'seguridad', component: SeguridadComponent },
					{ path: 'permisos', component: PermisossettingsComponent },
					{ path: 'temas', component: TemasSettingsComponent },
				]
			},
		]
	},
	// Rutas para SUPERUSUARIOS - Solo accesibles por superusuarios
	{
		path: 'admin',
		component: AdminlayoutComponent,
		canActivate: [authGuard, superUserGuard()],
		canActivateChild: [authGuard],
		children: [
			{ path: '', component: AdminhomeComponent },
			{ path: 'history', component: AdminhistoryComponent },
			{ path: 'config', component: AdminsettingsComponent },
			{ path: 'store', component: AdminmanagestoreComponent },
			{ path: 'store/:id', component: AdmintiendadetailComponent },

		]
	},
	// Ruta de login
	{
		path: 'login',
		component: AuthlayoutComponent,
		canActivate: [loginGuard],
		children: [{ path: '', component: LoginComponent }]
	},
	// Redirección por defecto basada en rol
	{
		path: '',
		canActivate: [authGuard, roleRedirectGuard()],
		children: []
	},
	// Página 404
	{ path: '**', component: NotFoundComponent }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule { }