import { DialogcreatetiendaComponent } from '@/app/components/Dialogs/dialogcreatetienda/dialogcreatetienda.component';
import { FormaddstoreComponent } from '@/app/components/Forms/formaddstore/formaddstore.component';
import { TabletiendasComponent } from '@/app/components/Tables/tabletiendas/tabletiendas.component';
import { loadTiendasAction } from '@/app/state/actions/tienda.actions';
import { AppState } from '@/app/state/app.state';
import { selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { selectCurrenttUser, selectUsersState } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TuiAppearance, TuiButton, TuiIcon, tuiDialog, TuiTitle } from '@taiga-ui/core';
import { TuiSkeleton, TuiTab, TuiTabs } from '@taiga-ui/kit';
import { TuiHeader, TuiNavigation } from '@taiga-ui/layout';
import { combineLatest, map, Observable } from 'rxjs';

@Component({
  selector: 'app-adminmanagestore',
  standalone: true,
  imports: [
    CommonModule,
    FormaddstoreComponent,
    TabletiendasComponent,
    TuiButton,
    TuiAppearance,
    TuiSkeleton,
    TuiTab,
    TuiTabs,
    TuiHeader,
    TuiNavigation,
    TuiTitle,
    TuiIcon
  ],
  templateUrl: './adminmanagestore.component.html',
  styleUrl: './adminmanagestore.component.scss'
})
export class AdminmanagestoreComponent implements OnInit {
  activeTab: 'gestion' = 'gestion';

  isSuperUser$!: Observable<boolean>;
  isAdminTienda$!: Observable<boolean>;
  filteredTiendas$!: Observable<any[]>;
  gestionTitle$!: Observable<string>;
  gestionSubtitle$!: Observable<string>;
  loadingTiendas$!: Observable<boolean>;

  private readonly dialog = tuiDialog(DialogcreatetiendaComponent, {
    dismissible: true,
    label: 'Nueva Tienda',
    size: "l"
  });

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.isSuperUser$ = this.store.select(selectCurrenttUser).pipe(map(user => !!user?.is_superuser));
    this.isAdminTienda$ = this.store.select(selectCurrenttUser).pipe(
      map(user => !!user && !user.is_superuser && (user as any).es_propietario === true)
    );

    this.gestionTitle$ = this.isSuperUser$.pipe(map(isSuper => isSuper ? 'Gestión de Tiendas' : 'Gestionar Mis sucursales'));
    this.gestionSubtitle$ = this.isSuperUser$.pipe(map(isSuper => isSuper ? 'Administra todas las tiendas del sistema' : 'Administra tu tienda y sucursales'));

    // Cargar tiendas al inicializar
    this.store.dispatch(loadTiendasAction());

    this.loadingTiendas$ = this.store.select(selectTiendaState).pipe(
      map(tiendaState => tiendaState.loadingTiendas)
    );

    this.filteredTiendas$ = combineLatest([
      this.store.select(selectTiendaState),
      this.store.select(selectCurrenttUser)
    ]).pipe(
      map(([tiendaState, user]) => {
        let tiendas = tiendaState.tiendas ?? [];
        // Filtrar tiendas sin propietario
        tiendas = tiendas.filter((t: any) => t.propietario != null);
        if (!user) return tiendas;
        if (user.is_superuser) return tiendas;
        // Solo admin tienda (es_propietario === true) ve filtrado; resto no debería estar aquí (guard lo bloquea)
        if ((user as any).es_propietario !== true) return [];
        // Admin tienda: mostrar su tienda, sucursales y tiendas donde es propietario/miembro
        const userId = user.id;
        const rawTiendaId: any = (user as any).tienda;
        const userTiendaId = typeof rawTiendaId === 'number' ? rawTiendaId : rawTiendaId?.id ?? (user as any).tienda_data?.id ?? null;
        const userTiendaDataId = (user as any).tienda_data?.id ?? null;
        const filtered = tiendas.filter((t: any) => {
          // Mostrar la tienda del usuario
          if (userTiendaId && t.id === userTiendaId) return true;
          if (userTiendaDataId && t.id === userTiendaDataId) return true;
          // Mostrar tiendas donde es propietario
          if (t.propietario === userId) return true;
          // Mostrar tiendas donde es miembro
          if (t.users_tienda?.some((u: any) => u.id === userId)) return true;
          // Mostrar sucursales de la tienda del usuario (tienda_padre = userTiendaId)
          if (userTiendaId && t.tienda_padre === userTiendaId) return true;
          return false;
        });
        // Si no hay coincidencias pero tiene tienda_data, mostrar esa como sucursal única (fallback para simular padre)
        if (filtered.length === 0 && (user as any).tienda_data) {
          return [(user as any).tienda_data];
        }
        // Si filtrado vacío y no hay tienda_data pero hay miTienda en estado, usarla
        if (filtered.length === 0 && tiendaState.miTienda) {
          return [tiendaState.miTienda];
        }
        return filtered.length > 0 ? filtered : filtered;
      })
    );
  }

  setTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
  }

  protected showDialog(): void {
    this.dialog().subscribe({
      next: (data) => {},
      complete: () => {},
    });
  }
}
