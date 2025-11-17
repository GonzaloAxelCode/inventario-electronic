import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { NG_EVENT_PLUGINS } from "@taiga-ui/event-plugins";

import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';




import { LoginComponent } from './pages/login/login.component';
import { AuthService } from './services/auth.service';
import { CategoriaService } from './services/categoria.service';
import { AuthInterceptor } from './services/utils/http-auth-interceptor';
import { ROOT_REDUCER } from './state/app.state';
import { AuthEffects } from './state/effects/auth.effects';
import { CategoriaEffects } from './state/effects/categoria.effect';


import { provideToastr, ToastrModule } from 'ngx-toastr';

import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';

import { TuiLoader, TuiNotification, TuiRoot } from '@taiga-ui/core';
import { SidenavComponent } from "./components/sidenav/sidenav.component";
import { ConsultaService } from './services/consultas.service';
import { InventarioService } from './services/inventario.service';
import { ProductoService } from './services/producto.service';
import { ProveedorService } from './services/proveedor.service';
import { TiendaService } from './services/tienda.service';
import { UserService } from './services/user.service';
import { VentaService } from './services/venta.service';
import { AppEffects } from './state/effects/app.effects';
import { CajaEffects } from './state/effects/caja.effect';
import { ClienteEffects } from './state/effects/cliente.effects';
import { InventarioEffects } from './state/effects/inventario.effects';
import { ProductoEffects } from './state/effects/producto.effects';
import { ProveedorEffects } from './state/effects/proveedor.effects';
import { TiendaEffects } from './state/effects/tienda.effects';
import { UserEffects } from './state/effects/user.effects';
import { VentaEffects } from './state/effects/venta.effects';
import { ServiceWorkerModule } from '@angular/service-worker';


@NgModule({

	declarations: [AppComponent],
	imports: [
		BrowserAnimationsModule, TuiLoader,
		TuiNotification,
		BrowserModule,
		AppRoutingModule,
		HttpClientModule,
		LoginComponent,
		CommonModule,
		TuiRoot,
		ToastrModule.forRoot({}),
		StoreModule.forRoot(ROOT_REDUCER),
		EffectsModule.forRoot([
			AppEffects,
			AuthEffects,
			CategoriaEffects,
			TiendaEffects,
			UserEffects,
			ProductoEffects,
			InventarioEffects,
			ProveedorEffects,
			VentaEffects,
			CajaEffects,
			ClienteEffects
		]),
		TranslateModule.forRoot({
			defaultLanguage: 'en',
		}),
		SidenavComponent,
		TuiLoader,
  ServiceWorkerModule.register('ngsw-worker.js', {
    enabled: !isDevMode(),
    // Register the ServiceWorker as soon as the application is stable
    // or after 30 seconds (whichever comes first).
    registrationStrategy: 'registerWhenStable:30000'
  })
	],
	providers: [
		AuthService,
		CategoriaService,
		TiendaService,
		UserService,
		ProductoService,
		InventarioService,
		ProveedorService,
		ConsultaService,
		VentaService,
		provideAnimations(),
		provideToastr(),

		{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
		NG_EVENT_PLUGINS,
	],
	bootstrap: [AppComponent],

	schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class AppModule { }
