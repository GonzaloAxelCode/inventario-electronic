import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton, TuiDialogService, TuiDropdown, TuiExpand, TuiGroup, TuiIcon, TuiLink, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiBlock, TuiConfirmService, TuiFade, TuiItemsWithMore, TuiRadio, TuiTab, TuiTabs, TuiTabsWithMore } from '@taiga-ui/kit';

import {
  TuiInputModule
} from '@taiga-ui/legacy';



import { DashboardLowStockComponent } from '@/app/components/dashboardcomponents/dashboard-low-stock/dashboard-low-stock.component';
import { PruebastextComponent } from '@/app/components/pruebastext/pruebastext.component';
import { TableproductComponent } from '@/app/components/Tables/tableproduct/tableproduct.component';
import { DialogCreateCategoriaService } from '@/app/services/dialogs-services/dialog-create-categoria.service';
import { DialogCreateProductService } from '@/app/services/dialogs-services/dialog-create-product.service';
import { CommonModule } from '@angular/common';
import { TuiRepeatTimes } from '@taiga-ui/cdk';
import { TuiHeader, TuiNavigation } from '@taiga-ui/layout';
import { TablecategoriesComponent } from "../../components/Tables/tablecategories/tablecategories.component";


@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [ReactiveFormsModule,
    TuiRadio, CommonModule,
    TuiButton, TuiHeader, TuiTitle, TuiNavigation, TuiTab,
    TuiDropdown, TuiFade,
    TuiItemsWithMore,
    FormsModule,
    TuiDropdown, TuiAppearance, TuiBlock,
    TuiItemsWithMore,
    TuiTable, TuiIcon, TuiTabsWithMore,
    TuiInputModule,
    TuiExpand, TableproductComponent, TablecategoriesComponent,
    TuiGroup,
    TuiHeader,
    TuiIcon, PruebastextComponent,
    TuiLink,
    TuiNavigation,
    TuiRepeatTimes, DashboardLowStockComponent,
    TuiTabs,
    TuiTextfield,
    TuiTitle, TuiIcon, TuiAvatar],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiConfirmService]



})
export class ProductosComponent {
  private readonly confirm = inject(TuiConfirmService);
  private readonly dialogs = inject(TuiDialogService);
  activeTab:
    | 'productos'
    | 'categorias'
    | 'graficos'
    | 'calculo-ganancias'
    | 'reportes'
    | 'proyeccion'
    | 'alertas'
    = 'productos';

  setTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
  }

  protected value = '';

  protected onModelChange(value: string): void {
    this.value = value;
    this.confirm.markAsDirty();
  }

  private readonly dialogservicecreatecategoria = inject(DialogCreateCategoriaService);
  protected showDialogCreateCategoria(): void {
    this.dialogservicecreatecategoria.open().subscribe((result: any) => {

    });
  }
  private readonly dialogserviceCreateProduct = inject(DialogCreateProductService);
  protected showDialogCreateProduct(): void {
    this.dialogserviceCreateProduct.open().subscribe((result: any) => {

    });
  }



}
