import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Location } from '@angular/common';

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
import { cargarCompras } from '@/app/state/actions/compra.actions';
import { PAGE_SIZE_COMPRAS } from '@/app/services/utils/pages-sizes';
import { ListallcomprasComponent } from '@/app/components/comprascomponents/listallcompras/listallcompras.component';
import { RegistrarcompraComponent } from '@/app/components/comprascomponents/registrarcompra/registrarcompra.component';
import { SubirexcelComponent } from '@/app/components/comprascomponents/subirexcel/subirexcel.component';

@Component({
  selector: 'app-compras',
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
    ListallcomprasComponent,
    RegistrarcompraComponent,
    SubirexcelComponent,
  ],
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.scss']
})
export class ComprasComponent implements OnInit {

  private store = inject(Store<AppState>);
  private route = inject(ActivatedRoute);
  private location = inject(Location);

  validTabs = ['historial', 'comprobantes', 'excel'] as const;
  activeTab: 'historial' | 'comprobantes' | 'excel' = 'historial';
  activeTabIndex = 0;

  ngOnInit() {
    this.store.dispatch(cargarCompras({ page: 1, page_size: PAGE_SIZE_COMPRAS }));

    const fragment = this.route.snapshot.fragment;
    if (fragment && this.isValidTab(fragment)) {
      this.activeTab = fragment as typeof this.activeTab;
      this.activeTabIndex = this.validTabs.indexOf(fragment as any);
    }
  }

  onTabChange(index: number) {
    const tab = this.validTabs[index];
    this.activeTab = tab;
    this.activeTabIndex = index;
    this.location.replaceState(`/app/compras#${tab}`);
  }

  private isValidTab(tab: string): boolean {
    return this.validTabs.includes(tab as any);
  }
}
