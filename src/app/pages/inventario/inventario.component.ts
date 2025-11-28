import { DialogcreateinventarioComponent } from '@/app/components/Dialogs/dialogcreateinventario/dialogcreateinventario.component';
import { TableproveedorComponent } from '@/app/components/Tables/tableproveedor/tableproveedor.component';
import { CommonModule, NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiRepeatTimes } from '@taiga-ui/cdk';
import { TuiAppearance, TuiButton, TuiDataList, tuiDialog, TuiGroup, TuiIcon, TuiLink, TuiLoader, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiBadge, TuiChevron, TuiConfirmService, TuiDataListWrapper, TuiFilter, TuiPagination, TuiSegmented, TuiStatus, TuiSwitch, TuiTabs, tuiValidationErrorsProvider } from '@taiga-ui/kit';
import { TuiBlockDetails, TuiBlockStatus, TuiHeader, TuiNavigation, TuiSearch } from '@taiga-ui/layout';
import { TuiInputModule, TuiSelectModule, TuiTextareaModule, TuiTextfieldControllerModule } from "@taiga-ui/legacy";
import { TableinventarioComponent } from "../../components/Tables/tableinventario/tableinventario.component";
@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableproveedorComponent,
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
    TableinventarioComponent,
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
  activeTab: 'inventario' | 'proveedor' = 'inventario';

  setTab(tab: 'inventario' | 'proveedor') {
    this.activeTab = tab;
  }

  protected showDialog(): void {
    this.dialog().subscribe({
      next: (data) => {

      },
      complete: () => {

      },
    });
  }
}