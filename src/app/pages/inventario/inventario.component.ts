import { DialogcreateinventarioComponent } from '@/app/components/Dialogs/dialogcreateinventario/dialogcreateinventario.component';
import { CommonModule, NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton, TuiDataList, tuiDialog, TuiLink, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge, TuiChevron, TuiConfirmService, TuiDataListWrapper, TuiFilter, TuiPagination, TuiSegmented, TuiStatus, TuiSwitch, tuiValidationErrorsProvider } from '@taiga-ui/kit';
import { TuiBlockDetails, TuiBlockStatus, TuiSearch } from '@taiga-ui/layout';
import { TuiInputModule, TuiSelectModule, TuiTextareaModule, TuiTextfieldControllerModule } from "@taiga-ui/legacy";
import { TableinventarioComponent } from "../../components/Tables/tableinventario/tableinventario.component";
interface QuerySearchInventario {
  nombre?: string;
  categoria?: string;
  sku?: string;
  marca?: string;
  modelo?: string;
  activo?: any;
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiDataListWrapper,
    TuiDataList,
    TuiSelectModule,
    TuiTextareaModule,
    TuiButton,
    TuiTextfield,
    TuiTextfieldControllerModule,
    TuiInputModule, TuiAppearance, TuiAppearance, TuiTable, TuiBadge,
    TuiBlockDetails, TuiSelectModule,
    TuiBadge, TuiButton, TuiAppearance, TuiStatus, TuiSegmented, NgForOf,
    ReactiveFormsModule,
    TuiButton,
    TuiChevron,
    TuiDataListWrapper,
    TuiFilter,
    TuiLink,
    TuiSearch,
    TuiSegmented,
    TuiSwitch,
    TuiTextfield, TuiLoader, TuiPagination, TuiBlockStatus,
    TableinventarioComponent
  ],
  providers: [tuiValidationErrorsProvider({
    required: 'Required field',
  }), TuiConfirmService, { provide: 'Pythons', useValue: ['Python One', 'Python Two', 'Python Three'] }, TuiConfirmService
  ],
  templateUrl: './inventario.component.html',

  styleUrl: './inventario.component.scss',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventarioComponent {
  private readonly dialog = tuiDialog(DialogcreateinventarioComponent, {
    dismissible: true,
    label: 'Crear Inventario',
    size: "l"
  });

  protected showDialog(): void {
    this.dialog().subscribe({
      next: (data) => {
        console.info(`Dialog emitted data = ${data}`);
      },
      complete: () => {
        console.info('Dialog closed');
      },
    });
  }
}