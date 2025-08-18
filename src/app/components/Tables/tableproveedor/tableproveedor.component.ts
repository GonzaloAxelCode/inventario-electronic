import { Proveedor } from '@/app/models/proveedor.models';
import { DialogUpdateProveedorService } from '@/app/services/dialogs-services/dialog-updateproveedor.service';
import { onActiveToggleProveedorAction } from '@/app/state/actions/proveedor.actions';
import { AppState } from '@/app/state/app.state';
import { ProveedorState } from '@/app/state/reducers/proveedor.reducer';
import { selectProveedores } from '@/app/state/selectors/proveedor.selectors';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAlertService, TuiAppearance, TuiButton, tuiDialog } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiBadge, TuiConfirmData, TuiRadio } from '@taiga-ui/kit';
import { Observable } from 'rxjs';
import { DialogcreateproveedorComponent } from '../../Dialogs/dialogcreateproveedor/dialogcreateproveedor.component';
@Component({
  selector: 'app-tableproveedor',
  standalone: true,
  imports: [CommonModule, FormsModule, TuiTable, CommonModule,

    TuiRadio,
    FormsModule,
    TuiTable, TuiButton, TuiAppearance, TuiBadge
  ],
  templateUrl: './tableproveedor.component.html',
  styleUrl: './tableproveedor.component.scss'
})
export class TableproveedorComponent implements OnInit {



  private readonly dialog = tuiDialog(DialogcreateproveedorComponent, {
    dismissible: true,
    label: 'Nuevo Proveedor',
    size: "l"
  });
  editingId: number | null = null;
  editedProveedor: Partial<Proveedor> = {};
  proveedoresState$?: Observable<ProveedorState>;
  constructor(private store: Store<AppState>) { }

  allColumns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'direccion', label: 'Direccion' },
    { key: 'telefono', label: 'Telefono' },
    { key: 'tipo_producto', label: 'Tipos de producto' },
  ];
  filteredData: any = []
  allColumnKeys = this.allColumns.map(c => c.key);
  displayedColumns = [...this.allColumnKeys];
  ngOnInit() {

    this.proveedoresState$ = this.store.select(selectProveedores);

  }
  getProveedorValue(proveedor: Proveedor, key: string): any {
    return proveedor[key as keyof Proveedor];
  }
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
  private readonly dialogService = inject(DialogUpdateProveedorService);
  protected showDialogUpdate(proveedor: Partial<Proveedor>): void {
    this.dialogService.open(proveedor).subscribe((result: any) => {

    });
  }
  private readonly dialogs = inject(TuiResponsiveDialogService);
  private readonly alerts = inject(TuiAlertService);
  protected onActiveToggle(proveedor: Proveedor): void {
    const data: TuiConfirmData = {
      content: '¿Estás seguro de que deseas desactivar o activar este proveedor?',
      yes: 'Ok',
      no: 'Cancelar',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Confirmación de Activación / Desactivación',
        size: 's',
        data,
      })
      .subscribe((confirm) => {
        if (confirm) {

          this.store.dispatch(onActiveToggleProveedorAction({ proveedor, activo: !proveedor.activo }));
          this.alerts.open(' Acción exitosa.',).subscribe();
        } else {

          this.alerts.open('Acción cancelada.').subscribe();
        }
      });
  }
}
