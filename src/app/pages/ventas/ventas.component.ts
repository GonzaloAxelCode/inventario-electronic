import { CommonModule, Location } from '@angular/common';
import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
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

import { ListallventasComponent } from '@/app/components/ventascomponents/listallventas/listallventas.component';
import { MostsalesproductsComponent } from '@/app/components/ventascomponents/mostsalesproducts/mostsalesproducts.component';
import { TodaysaleComponent } from '@/app/components/ventascomponents/todaysale/todaysale.component';
import { TodaysalestableComponent } from '@/app/components/ventascomponents/todaysalestable/todaysalestable.component';
import { TuiIcon } from '@taiga-ui/core';

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

    TodaysalestableComponent,
    TodaysaleComponent,
    MostsalesproductsComponent,
  ],
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss']
})
export class VentasComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly cdr = inject(ChangeDetectorRef);

  validTabs = ['historial', 'ventas-hoy', 'ultima-venta', 'top-productos-hoy'] as const;

  activeTab:
    | 'historial'
    | 'ventas-hoy'
    | 'ultima-venta'
    | 'top-productos-hoy'
    = 'historial';

  ngOnInit() {
    this.route.fragment.subscribe((fragment) => {
      const mapped = fragment === 'anuladas-hoy' ? 'historial' : fragment;
      if (mapped && this.isValidTab(mapped)) {
        this.activeTab = mapped as typeof this.activeTab;
        this.cdr.markForCheck();
      }
    });
  }

  private isValidTab(tab: string): boolean {
    return (this.validTabs as readonly string[]).includes(tab);
  }

  setTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
    this.location.replaceState(`/app/ventas#${tab}`);
  }
}
