import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';
import { superUserGuard } from './guards/superuser.guard';

import { roleRedirectGuard } from './guards/role-redirect.guard';

import { AdminlayoutComponent } from './layouts/adminlayout/adminlayout.component';
import { AuthlayoutComponent } from './layouts/authlayout/authlayout.component';
import { MainlayoutComponent } from './layouts/mainlayout/mainlayout.component';

import { CajaComponent } from './pages/caja/caja.component';
import { ComprasComponent } from './pages/compras/compras.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HacerventaComponent } from './pages/hacerventa/hacerventa.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { LoginComponent } from './pages/login/login.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ProductosComponent } from './pages/productos/productos.component';

import { ReportesComponent } from './pages/reportes/reportes.component';
import { SettiingsComponent } from './pages/settiings/settiings.component';
import { TiendasComponent } from './pages/tiendas/tiendas.component';
import { VentasComponent } from './pages/ventas/ventas.component';

import { MyaccountComponent } from './components/settingscomponents/myaccount/myaccount.component';
import { PerfilsettingsComponent } from './components/settingscomponents/perfilsettings/perfilsettings.component';
import { PermisossettingsComponent } from './components/settingscomponents/permisossettings/permisossettings.component';
import { SettingslayoutComponent } from './components/settingscomponents/settingslayout/settingslayout.component';
import { VentassettingsComponent } from './components/settingscomponents/ventassettings/ventassettings.component';


import { normalUserGuard } from './guards/appuser.guard';
import { AdminhistoryComponent } from './pages/admin/adminhistory/adminhistory.component';
import { AdminhomeComponent } from './pages/admin/adminhome/adminhome.component';
import { AdminmanagestoreComponent } from './pages/admin/adminmanagestore/adminmanagestore.component';
import { AdminsettingsComponent } from './pages/admin/adminsettings/adminsettings.component';

const routes: Routes = [
	// Rutas para USUARIOS NORMALES - Solo accesibles por usuarios no-superusuarios
	{
		path: 'app',
		component: MainlayoutComponent,
		canActivate: [authGuard, normalUserGuard()],
		canActivateChild: [authGuard],
		children: [
			{ path: '', component: DashboardComponent },
			{ path: 'inventario', component: InventarioComponent },
			{ path: 'ventas', component: VentasComponent },
			{ path: 'ventas/crear', component: HacerventaComponent },
			{ path: 'productos', component: ProductosComponent },

			{ path: 'perfil', component: PerfilComponent },
			{ path: 'tiendas', component: TiendasComponent },
			{ path: 'reportes', component: ReportesComponent },
			{ path: 'caja', component: CajaComponent },
			{ path: 'compras', component: ComprasComponent },
			{
				path: 'settings',
				component: SettingslayoutComponent,
				children: [
					{ path: '', component: SettiingsComponent },
					{ path: 'cuenta', component: MyaccountComponent },
					{ path: 'ventas', component: VentassettingsComponent },
					{ path: 'permisos', component: PermisossettingsComponent },
					{ path: 'perfil', component: PerfilsettingsComponent },
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