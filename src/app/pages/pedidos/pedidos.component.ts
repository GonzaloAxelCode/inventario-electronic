import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';

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
import { AppState } from '@/app/state/app.state';
import { cargarPedidos } from '@/app/state/actions/pedido.actions';
import { ListallpedidosComponent } from '@/app/components/pedidoscomponents/listallpedidos/listallpedidos.component';
import { RegistrarpedidoComponent } from '@/app/components/pedidoscomponents/registrarpedido/registrarpedido.component';

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

  private store = inject(Store<AppState>);

  validTabs = ['historial', 'crear'] as const;
  activeTab: 'historial' | 'crear' = 'historial';
  activeTabIndex = 0;

  ngOnInit() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const fromDate = firstDay.toISOString().split('T')[0];
    const toDate = today.toISOString().split('T')[0];
    this.store.dispatch(cargarPedidos({ fromDate, toDate }));
  }

  onTabChange(index: number) {
    this.activeTab = this.validTabs[index];
    this.activeTabIndex = index;
  }
}
