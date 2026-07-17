import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';
import { superUserGuard } from './guards/superuser.guard';

import { roleRedirectGuard } from './guards/role-redirect.guard';

import { AdminlayoutComponent } from './layouts/adminlayout/adminlayout.component';
import { AuthlayoutComponent } from './layouts/authlayout/authlayout.component';
import { MainlayoutComponent } from './layouts/mainlayout/mainlayout.component';

import { normalUserGuard } from './guards/appuser.guard';

const routes: Routes = [
	{
		path: 'app',
		component: MainlayoutComponent,
		canActivate: [authGuard, normalUserGuard()],
		canActivateChild: [authGuard],
		children: [
			{
				path: '',
				loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
			},
			{
				path: 'ventas',
				loadComponent: () => import('./pages/ventas/ventas.component').then(m => m.VentasComponent)
			},
			{
				path: 'ventas/crear',
				loadComponent: () => import('./pages/hacerventa/hacerventa.component').then(m => m.HacerventaComponent)
			},
			{
				path: 'productos',
				loadComponent: () => import('./pages/productos/productos.component').then(m => m.ProductosComponent)
			},
			{
				path: 'perfil',
				loadComponent: () => import('./pages/perfil/perfil.component').then(m => m.PerfilComponent)
			},
			{
				path: 'clientes',
				loadComponent: () => import('./pages/clientes/clientes.component').then(m => m.ClientesComponent)
			},
			{
				path: 'tiendas',
				loadComponent: () => import('./pages/tiendas/tiendas.component').then(m => m.TiendasComponent)
			},
			{
				path: 'compras',
				loadComponent: () => import('./pages/compras/compras.component').then(m => m.ComprasComponent)
			},
			{
				path: 'pedidos',
				loadComponent: () => import('./pages/pedidos/pedidos.component').then(m => m.PedidosComponent)
			},
			{
				path: 'proveedores',
				loadComponent: () => import('./pages/proveedores/proveedores.component').then(m => m.ProveedoresComponent)
			},
			{
				path: 'guia-remision',
				loadComponent: () => import('./pages/guia-remision/guia-remision.component').then(m => m.GuiaRemisionComponent)
			},
			{
				path: 'settings',
				loadComponent: () => import('./components/settingscomponents/settingslayout/settingslayout.component').then(m => m.SettingslayoutComponent),
				children: [
					{ path: '', redirectTo: 'cuenta', pathMatch: 'full' },
					{
						path: 'cuenta',
						loadComponent: () => import('./components/settingscomponents/myaccount/myaccount.component').then(m => m.MyaccountComponent)
					},
					{
						path: 'seguridad',
						loadComponent: () => import('./components/settingscomponents/seguridad/seguridad.component').then(m => m.SeguridadComponent)
					},
					{
						path: 'permisos',
						loadComponent: () => import('./components/settingscomponents/permisossettings/permisossettings.component').then(m => m.PermisossettingsComponent)
					},
					{
						path: 'temas',
						loadComponent: () => import('./components/settingscomponents/temassettings/temassettings.component').then(m => m.TemasSettingsComponent)
					},
				]
			},
		]
	},
	{
		path: 'admin',
		component: AdminlayoutComponent,
		canActivate: [authGuard, superUserGuard()],
		canActivateChild: [authGuard],
		children: [
			{
				path: '',
				loadComponent: () => import('./pages/admin/adminhome/adminhome.component').then(m => m.AdminhomeComponent)
			},
			{
				path: 'history',
				loadComponent: () => import('./pages/admin/adminhistory/adminhistory.component').then(m => m.AdminhistoryComponent)
			},
			{
				path: 'config',
				loadComponent: () => import('./pages/admin/adminsettings/adminsettings.component').then(m => m.AdminsettingsComponent)
			},
			{
				path: 'store',
				loadComponent: () => import('./pages/admin/adminmanagestore/adminmanagestore.component').then(m => m.AdminmanagestoreComponent)
			},
			{
				path: 'store/:id',
				loadComponent: () => import('./pages/admin/admintiendadetail/admintiendadetail.component').then(m => m.AdmintiendadetailComponent)
			},
		]
	},
	{
		path: 'login',
		component: AuthlayoutComponent,
		canActivate: [loginGuard],
		children: [
			{
				path: '',
				loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
			}
		]
	},
	{
		path: '',
		canActivate: [authGuard, roleRedirectGuard()],
		children: []
	},
	{
		path: '**',
		loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
})
export class AppRoutingModule { }
