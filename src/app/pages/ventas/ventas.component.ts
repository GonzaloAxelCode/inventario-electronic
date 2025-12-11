import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

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

import { PruebastextComponent } from '@/app/components/pruebastext/pruebastext.component';
import { CanceledsalesComponent } from '@/app/components/ventascomponents/canceledsales/canceledsales.component';
import { ListallventasComponent } from '@/app/components/ventascomponents/listallventas/listallventas.component';
import { MostsalesproductsComponent } from '@/app/components/ventascomponents/mostsalesproducts/mostsalesproducts.component';
import { TodaysaleComponent } from '@/app/components/ventascomponents/todaysale/todaysale.component';
import { TodaysalestableComponent } from '@/app/components/ventascomponents/todaysalestable/todaysalestable.component';

@Component({
  selector: 'app-ventas',
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
    ListallventasComponent,
    PruebastextComponent,
    TodaysalestableComponent,
    TodaysaleComponent,
    CanceledsalesComponent,
    MostsalesproductsComponent,
  ],
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss']
})
export class VentasComponent {

  activeTab:
    | 'historial'
    | 'ventas-hoy'
    | 'ultima-venta'
    | 'anuladas-hoy'
    | 'top-productos-hoy'
    = 'historial';

  setTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
  }
}
