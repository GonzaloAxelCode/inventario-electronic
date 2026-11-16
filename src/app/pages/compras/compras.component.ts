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
import { ConsultarCompraComponent } from '@/app/components/comprascomponents/consultar-compra/consultar-compra.component';
import { MisComprasComponent } from '@/app/components/comprascomponents/mis-compras/mis-compras.component';

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
    ConsultarCompraComponent,
    MisComprasComponent,
  ],
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.scss']
})
export class ComprasComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);

  validTabs = ['consultar', 'mis-compras'] as const;
  activeTab: 'consultar' | 'mis-compras' = 'consultar';
  activeTabIndex = 0;

  ngOnInit() {
    this.route.fragment.subscribe((fragment) => {
      // Aliases legacy: historial/proveedores -> mis-compras, comprobantes -> consultar
      const mapped =
        fragment === 'historial' || fragment === 'proveedores' ? 'mis-compras'
        : fragment === 'comprobantes' ? 'consultar'
        : fragment;
      if (mapped && this.isValidTab(mapped)) {
        this.activeTab = mapped as typeof this.activeTab;
        this.activeTabIndex = this.validTabs.indexOf(mapped as any);
        this.cdr.markForCheck();
      }
    });
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
