
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';
import { AuthlayoutComponent } from './layouts/authlayout/authlayout.component';
import { MainlayoutComponent } from './layouts/mainlayout/mainlayout.component';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HacerventaComponent } from './pages/hacerventa/hacerventa.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { LoginComponent } from './pages/login/login.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ProductosComponent } from './pages/productos/productos.component';
import { ProveedoresComponent } from './pages/proveedores/proveedores.component';
import { ReportesComponent } from './pages/reportes/reportes.component';

import { MyaccountComponent } from './components/settingscomponents/myaccount/myaccount.component';
import { PerfilsettingsComponent } from './components/settingscomponents/perfilsettings/perfilsettings.component';
import { PermisossettingsComponent } from './components/settingscomponents/permisossettings/permisossettings.component';
import { SettingslayoutComponent } from './components/settingscomponents/settingslayout/settingslayout.component';
import { UsermanagementComponent } from './components/settingscomponents/usermanagement/usermanagement.component';
import { VentassettingsComponent } from './components/settingscomponents/ventassettings/ventassettings.component';
import { superUserGuard } from './guards/superuser.guard';
import { CajaComponent } from './pages/caja/caja.component';
import { ComprasComponent } from './pages/compras/compras.component';
import { SettiingsComponent } from './pages/settiings/settiings.component';
import { TiendasComponent } from './pages/tiendas/tiendas.component';
import { VentasComponent } from './pages/ventas/ventas.component';


const routes: Routes = [
	{
		path: '',
		component: MainlayoutComponent,
		canActivate: [authGuard],
		children: [
			{ path: '', component: DashboardComponent },
			{ path: 'inventario', component: InventarioComponent },
			{ path: 'ventas', component: VentasComponent },
			{ path: 'create_venta', component: HacerventaComponent },
			{ path: 'productos', component: ProductosComponent },
			{ path: 'proveedores', component: ProveedoresComponent },
			{ path: 'perfil', component: PerfilComponent },
			{ path: 'tiendas', component: TiendasComponent },
			{ path: 'reportes', component: ReportesComponent },
			{ path: 'caja', component: CajaComponent },
			{ path: 'compras', component: ComprasComponent },
			{ path: 'dashboard', component: DashboardComponent },
			{
				path: 'settings',
				component: SettingslayoutComponent,
				children: [
					{ path: '', component: SettiingsComponent },
					{ path: 'cuenta', component: MyaccountComponent },
					{ path: 'ventas', component: VentassettingsComponent },
					{ path: 'permisos', component: PermisossettingsComponent },
					{ path: 'perfil', component: PerfilsettingsComponent },
					{ path: 'usermanagement', component: UsermanagementComponent, canActivate: [superUserGuard] },

				]
			}
		]
	},
	{
		path: 'login',
		component: AuthlayoutComponent,
		canActivate: [loginGuard],
		children: [{ path: '', component: LoginComponent }]
	},
	{ path: '**', component: NotFoundComponent }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule {



}
