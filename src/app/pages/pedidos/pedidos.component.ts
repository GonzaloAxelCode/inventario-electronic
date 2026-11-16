import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {
  TuiHeader,
  TuiNavigation,
  TuiSubheaderComponent
} from '@taiga-ui/layout';

import {
  TuiFade,
  TuiTab,
  TuiTabs,
} from '@taiga-ui/kit';

import { TuiIcon } from '@taiga-ui/core';
import { ListallpedidosComponent } from '@/app/components/pedidoscomponents/listallpedidos/listallpedidos.component';
import { RegistrarpedidoComponent } from '@/app/components/pedidoscomponents/registrarpedido/registrarpedido.component';
import { tienePermiso } from '@/app/models/permissions.catalog';
import { AppState } from '@/app/state/app.state';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [
    CommonModule,
    TuiNavigation,
    TuiHeader,
    TuiSubheaderComponent,
    TuiTabs,
    TuiTab,
    TuiFade,
    TuiIcon,
    ListallpedidosComponent,
    RegistrarpedidoComponent,
  ],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss']
})
export class PedidosComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);
  private store = inject(Store<AppState>);

  user$ = this.store.select(selectCurrenttUser);
  tiene = tienePermiso;

  validTabs = ['historial', 'crear'] as const;
  activeTab: 'historial' | 'crear' = 'historial';
  activeTabIndex = 0;
  puedeCrear = false;

  ngOnInit() {
    this.store.select(selectCurrenttUser).subscribe((u) => {
      this.puedeCrear = tienePermiso(u as any, 'can_manage_pedido');
      // Si pierde el permiso estando en crear, volver a historial
      if (!this.puedeCrear && this.activeTab === 'crear') this.onTabChange(0);
      this.cdr.markForCheck();
    });
    this.route.fragment.subscribe((fragment) => {
      if (fragment && this.isValidTab(fragment)) {
        // Crear Pendiente exige el permiso; sin él se queda en historial
        if (fragment === 'crear' && !this.puedeCrear) {
          this.onTabChange(0);
          this.cdr.markForCheck();
          return;
        }
        this.activeTab = fragment as typeof this.activeTab;
        this.activeTabIndex = this.validTabs.indexOf(fragment as any);
        this.cdr.markForCheck();
      }
    });
  }

  onPedidoCreado() {
    this.onTabChange(0);
  }

  onTabChange(index: number) {
    const tab = this.validTabs[index];
    this.activeTab = tab;
    this.activeTabIndex = index;
    this.location.replaceState(`/app/pedidos#${tab}`);
  }

  private isValidTab(tab: string): boolean {
    return (this.validTabs as readonly string[]).includes(tab);
  }
}
