import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiButton, TuiDialogService, TuiDropdown, TuiExpand } from '@taiga-ui/core';
import { TuiConfirmService, TuiItemsWithMore, TuiRadio } from '@taiga-ui/kit';

import {
  TuiInputModule
} from '@taiga-ui/legacy';


import { DialogCreateCategoriaService } from '@/app/services/dialogs-services/dialog-create-categoria.service';
import { DialogCreateProductService } from '@/app/services/dialogs-services/dialog-create-product.service';
import { TablecategoriesComponent } from "../../components/Tables/tablecategories/tablecategories.component";
import { TableproductComponent } from "../../components/Tables/tableproduct/tableproduct.component";

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [ReactiveFormsModule,
    TuiRadio,
    TuiButton,
    TuiDropdown,
    TuiItemsWithMore,
    FormsModule,
    TuiDropdown,
    TuiItemsWithMore,
    TuiTable,
    TuiInputModule,
    TuiExpand, TableproductComponent, TablecategoriesComponent],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiConfirmService]



})
export class ProductosComponent {
  private readonly confirm = inject(TuiConfirmService);
  private readonly dialogs = inject(TuiDialogService);

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
