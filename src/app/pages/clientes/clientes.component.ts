import { TableClientesComponent } from '@/app/components/Tables/tableclientes/tableclientes.component';
import { EstadisticasClientesComponent } from '@/app/components/clientescomponents/estadisticas-clientes/estadisticas-clientes.component';
import { SorteosClientesComponent } from '@/app/components/clientescomponents/sorteos-clientes/sorteos-clientes.component';
import { loadClientes } from '@/app/state/actions/cliente.actions';
import { AppState } from '@/app/state/app.state';
import { CommonModule, Location } from '@angular/common';

import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton, TuiDropdown, TuiExpand, TuiGroup, TuiIcon, TuiLink, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiBlock, TuiFade, TuiItemsWithMore, TuiRadio, TuiTab, TuiTabs, TuiTabsWithMore } from '@taiga-ui/kit';

import {
  TuiInputModule
} from '@taiga-ui/legacy';




import { TuiRepeatTimes } from '@taiga-ui/cdk';
import { TuiHeader, TuiNavigation } from '@taiga-ui/layout';



@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, TableClientesComponent, EstadisticasClientesComponent, SorteosClientesComponent,
    ReactiveFormsModule,
    TuiRadio, CommonModule,
    TuiButton, TuiHeader, TuiTitle, TuiNavigation, TuiTab,
    TuiDropdown, TuiFade,
    TuiItemsWithMore,
    FormsModule,
    TuiDropdown, TuiAppearance, TuiBlock,
    TuiItemsWithMore,
    TuiTable, TuiIcon, TuiTabsWithMore,
    TuiInputModule,
    TuiExpand,
    TuiGroup,
    TuiHeader,
    TuiIcon,
    TuiLink,
    TuiNavigation,
    TuiRepeatTimes,
    TuiTabs,
    TuiTextfield,
    TuiTitle, TuiIcon, TuiAvatar

  ],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export class ClientesComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);
  private store = inject(Store<AppState>);

  validTabs = ['mis-clientes', 'estadisticas', 'sorteos'] as const;

  activeTab:
    | 'mis-clientes'
    | 'ultimos-agregados'
    | 'estadisticas'
    | 'sorteos'
    = 'mis-clientes';

  ngOnInit() {
    this.store.dispatch(loadClientes());
    this.route.fragment.subscribe((fragment) => {
      if (fragment && this.isValidTab(fragment)) {
        this.activeTab = fragment as typeof this.activeTab;
        this.cdr.markForCheck();
      }
    });
  }

  setTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
    this.location.replaceState(`/app/clientes#${tab}`);
  }

  private isValidTab(tab: string): boolean {
    return (this.validTabs as readonly string[]).includes(tab);
  }
}
