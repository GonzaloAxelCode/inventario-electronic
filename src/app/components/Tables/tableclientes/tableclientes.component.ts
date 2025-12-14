import { Categoria } from '@/app/models/categoria.models';
import { DialogUpdateCategoriaService } from '@/app/services/dialogs-services/dialog-updatecategoria.service';
import { loadClientes } from '@/app/state/actions/cliente.actions';
import { AppState } from '@/app/state/app.state';
import { ClienteState } from '@/app/state/reducers/cliente.reducer';
import { selectCliente } from '@/app/state/selectors/cliente.selectors';
import { selectPermissions } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAlertService, TuiAppearance, TuiButton, TuiLoader } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiAvatar, TuiBadge, TuiChip, TuiConfirmData, TuiRadio, TuiSkeleton } from '@taiga-ui/kit';
import { TuiBlockStatus } from '@taiga-ui/layout';
import { Observable } from 'rxjs';
import { ButtonupdateComponent } from '../../buttonupdate/buttonupdate.component';
@Component({
  selector: 'app-tableclientes',
  standalone: true,

  imports: [CommonModule, TuiChip, FormsModule, TuiTable, CommonModule,
    TuiAvatar, TuiLoader,
    TuiRadio, ButtonupdateComponent,
    FormsModule, TuiSkeleton,
    TuiTable, TuiButton, TuiAppearance, TuiBadge, TuiBlockStatus
  ],
  templateUrl: './tableclientes.component.html',
  styleUrl: './tableclientes.component.scss'
})
export class TableClientesComponent implements OnInit {
  selectClientes$?: Observable<ClienteState>
  userPermissions$ = this.store.select(selectPermissions);
  allColumns = [
    { key: 'id', label: 'ID' },
    { key: 'fullname', label: 'Documento' },
    { key: 'phone', label: 'Telefono' },
    { key: 'email', label: 'Correo E-Mail' },
    { key: 'adresss', label: 'Direccion' },
  ];

  filteredData: any = []
  allColumnKeys = this.allColumns.map(c => c.key);
  displayedColumns = [...this.allColumnKeys];

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.selectClientes$ = this.store.select(selectCliente);

  }
  refreshClientes() {
    this.store.dispatch(loadClientes())
  }
  private readonly dialogs = inject(TuiResponsiveDialogService);
  private readonly alerts = inject(TuiAlertService);
  protected onDeleteCliente(id: any): void {
    const data: TuiConfirmData = {
      content: '¿Estás seguro de que deseas eliminarlo?',
      yes: 'Eliminar',
      no: 'Cancelar',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Confirmación de Eliminación',
        size: 's',
        data,
      })
      .subscribe((confirm) => {
        if (confirm) {

          // this.store.dispatch(deleteCategoriaAction({ id }))

        } else {

          // this.alerts.open('Eliminación cancelada.').subscribe();
        }
      });
  }
  private readonly dialogService = inject(DialogUpdateCategoriaService);
  protected showDialogUpdate(categoria: Categoria): void {
    this.dialogService.open(categoria).subscribe((result: any) => {

    });
  }
}
