import { TableClientesComponent } from '@/app/components/Tables/tableclientes/tableclientes.component';
import { CommonModule } from '@angular/common';

import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  imports: [CommonModule, TableClientesComponent,
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
export class ClientesComponent {
  activeTab:
    | 'mis-clientes'
    | 'ultimos-agregados'
    | 'sorteos'
    = 'mis-clientes';

  setTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
  }
}
