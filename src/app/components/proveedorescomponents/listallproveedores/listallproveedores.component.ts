import { Proveedor } from '@/app/models/proveedor.models';
import { toggleProveedorAction } from '@/app/state/actions/proveedor.actions';
import { AppState } from '@/app/state/app.state';
import { ProveedorState } from '@/app/state/reducers/proveedor.reducer';
import { selectProveedores } from '@/app/state/selectors/proveedor.selectors';
import { selectPermissions } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAlertService, TuiAppearance, TuiButton, TuiLoader } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiBadge, TuiConfirmData, TuiSkeleton } from '@taiga-ui/kit';
import { TuiBlockStatus } from '@taiga-ui/layout';
import { Observable } from 'rxjs';
import { DialogUpdateProveedorService } from '@/app/services/dialogs-services/dialog-updateproveedor.service';
import { DialogCreateProveedorService } from '@/app/services/dialogs-services/dialog-createproveedor.service';

@Component({
  selector: 'app-listallproveedores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TuiTable,
    TuiBlockStatus,
    TuiSkeleton,
    TuiButton,
    TuiAppearance,
    TuiBadge,
    TuiLoader,
  ],
  templateUrl: './listallproveedores.component.html',
  styleUrl: './listallproveedores.component.scss'
})
export class ListallproveedoresComponent implements OnInit {

  private store = inject(Store<AppState>);
  private readonly dialogs = inject(TuiResponsiveDialogService);
  private readonly alerts = inject(TuiAlertService);
  private readonly dialogUpdateService = inject(DialogUpdateProveedorService);
  private readonly dialogCreateService = inject(DialogCreateProveedorService);

  proveedoresState$!: Observable<Partial<ProveedorState>>;
  userPermissions$ = this.store.select(selectPermissions);

  allColumns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'ruc', label: 'RUC' },
    { key: 'telefono', label: 'Telefono' },
    { key: 'email', label: 'Email' },
    { key: 'direccion', label: 'Direccion' },
    { key: 'tipo_producto', label: 'Tipo Producto' },
    { key: 'calificacion', label: 'Calificacion' },
  ];

  ngOnInit() {
    this.proveedoresState$ = this.store.select(selectProveedores);
  }

  searchTerm = '';

  filtrarProveedores(proveedores: Proveedor[]): Proveedor[] {
    if (!this.searchTerm.trim()) return proveedores;
    const term = this.searchTerm.toLowerCase();
    return proveedores.filter(p =>
      p.nombre?.toLowerCase().includes(term) ||
      p.razon_social?.toLowerCase().includes(term) ||
      p.ruc?.toLowerCase().includes(term) ||
      p.email?.toLowerCase().includes(term) ||
      p.telefono?.toLowerCase().includes(term) ||
      p.direccion?.toLowerCase().includes(term) ||
      p.contacto?.toLowerCase().includes(term) ||
      p.tipo_producto?.toLowerCase().includes(term)
    );
  }

  getProveedorValue(proveedor: Proveedor, key: string): any {
    const value = proveedor[key as keyof Proveedor];
    if (value === null || value === undefined || value === '') return '—';
    return value;
  }

  showDialogUpdate(proveedor: Partial<Proveedor>): void {
    this.dialogUpdateService.open(proveedor).subscribe();
  }

  showDialogCreate(): void {
    this.dialogCreateService.open().subscribe();
  }

  onActiveToggle(proveedor: Proveedor): void {
    const data: TuiConfirmData = {
      content: `Estas seguro de que deseas ${proveedor.activo ? 'desactivar' : 'activar'} este proveedor?`,
      yes: 'Ok',
      no: 'Cancelar',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Confirmacion',
        size: 's',
        data,
      })
      .subscribe((confirm) => {
        if (confirm) {
          this.store.dispatch(toggleProveedorAction({ proveedor, activo: !proveedor.activo }));
        }
      });
  }
}
