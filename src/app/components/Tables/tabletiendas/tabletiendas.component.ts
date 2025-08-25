import { Tienda, TiendaState } from '@/app/models/tienda.models';
import { DialogDetailTiendaService } from '@/app/services/dialogs-services/dialog-detailtienda.service';
import { DialogUpdateTiendaService } from '@/app/services/dialogs-services/dialog-updatetienda.service';
import { desactivateTiendaAction } from '@/app/state/actions/tienda.actions';
import { AppState } from '@/app/state/app.state';
import { selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAlertService, TuiAppearance, TuiButton } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiBadge, TuiConfirmData } from '@taiga-ui/kit';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-tabletiendas',
  standalone: true,
  imports: [CommonModule, FormsModule, TuiTable, TuiBadge, TuiAppearance, TuiButton],
  templateUrl: './tabletiendas.component.html',
  styleUrl: './tabletiendas.component.scss'
})
export class TabletiendasComponent implements OnInit {

  tiendasState$?: Observable<TiendaState>;
  allColumns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'direccion', label: 'Dirección' },



    { key: 'ruc', label: 'RUC' },
    { key: 'activo', label: 'Activo' },

  ];
  filteredData: any = []
  allColumnKeys = this.allColumns.map(c => c.key);
  displayedColumns = [...this.allColumnKeys];

  editingId: number | any = null;
  editedTienda: Partial<Tienda> = {};

  constructor(private store: Store<AppState>, private cdRef: ChangeDetectorRef) { }

  ngOnInit() {

    this.tiendasState$ = this.store.select(selectTiendaState);

  }



  onEditTienda(tienda: Tienda) {
    this.editingId = tienda.id;
    this.editedTienda = { ...tienda };
  }

  onUpdateTienda() {


    this.editingId = null;
  }

  onCancelEdit() {
    this.editingId = null;
  }
  onToggle(tienda: Tienda) {
    const newTienda = { ...tienda, activo: !tienda.activo };
    this.store.dispatch(desactivateTiendaAction({ id: newTienda.id, activo: newTienda.activo }));
  }
  private readonly dialogs = inject(TuiResponsiveDialogService);
  private readonly alerts = inject(TuiAlertService);
  protected onDeleteTienda(id: any): void {
    const data: TuiConfirmData = {
      content: '¿Estás seguro de que deseas eliminar esta Tienda?',
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


          this.alerts.open(' eliminado exitosamente.').subscribe();
        } else {

          this.alerts.open('Eliminación cancelada.').subscribe();
        }
      });
  }
  getTiendaValue(venta: Tienda, key: string): any {
    return venta[key as keyof Tienda];
  }



  private readonly dialogService = inject(DialogUpdateTiendaService);
  private readonly dialogServiceDetail = inject(DialogDetailTiendaService);
  protected showDialogUpdate(): void {
    this.dialogService.open({}).subscribe((result: any) => {

    });
  }
  protected showDialogDetailTienda(tienda: Tienda): void {
    this.dialogServiceDetail.open(tienda).subscribe((result: any) => {

    });
  }
}
