import { Tienda, TiendaState } from '@/app/models/tienda.models';
import { DialogDetailTiendaService } from '@/app/services/dialogs-services/dialog-detailtienda.service';
import { DialogUpdateTiendaService } from '@/app/services/dialogs-services/dialog-updatetienda.service';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { desactivateTiendaAction } from '@/app/state/actions/tienda.actions';
import { AppState } from '@/app/state/app.state';
import { selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAlertService, TuiAppearance, TuiButton, TuiDataList, TuiDropdownComponent, TuiIcon, TuiLoader } from '@taiga-ui/core';
import { TuiAvatar, TuiBadge, TuiSkeleton, TuiSwitch } from '@taiga-ui/kit';
import { TuiBlockStatus, TuiCardLarge } from '@taiga-ui/layout';
import { Observable, tap } from 'rxjs';

@Component({
  selector: 'app-tabletiendas',
  standalone: true,
  imports: [TuiLoader, TuiSwitch, TuiBadge, TuiBlockStatus, TuiDropdownComponent, TuiDataList, CommonModule, TuiIcon, TuiAvatar, FormsModule, TuiTable, TuiBadge, TuiAppearance, TuiButton, TuiSkeleton, TuiCardLarge, TuiAppearance],
  templateUrl: './tabletiendas.component.html',
  styleUrl: './tabletiendas.component.scss'
})
export class TabletiendasComponent implements OnInit {
  URL_BASE = URL_BASE
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
  loadingDesactivateTienda: boolean = false;
  editingId: number | any = null;
  editedTienda: Partial<Tienda> = {};

  constructor(private store: Store<AppState>, private cdRef: ChangeDetectorRef) { }

  ngOnInit() {

    this.tiendasState$ = this.store.select(selectTiendaState);

    this.store.select(selectTiendaState).pipe(
      tap((tiendaState: TiendaState) => {

        this.loadingDesactivateTienda = tiendaState.loadingActiveTienda;

      })
    ).subscribe();


  }
  toggleDesactivateTienda(event: Event, tienda: Tienda) {
    event.stopPropagation();
    const newTienda = { ...tienda, activo: !tienda.activo };
    this.store.dispatch(desactivateTiendaAction({ id: newTienda.id, activo: newTienda.activo }));
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
  private cardColors = [

    'dark:bg-zinc-800 bg-white text-gray-900 dark:text-white border-neutral-200 dark:border-neutral-700 border-2'    // 💡 Amarillo acento moderno
  ];

  getCardColor(index: number): string {
    return this.cardColors[index % this.cardColors.length];
  }

  getCardBorderColor(index: number): string {
    const borders = [

      'dark:border-neutral-700 border-neutral-200'     // 💛 Amarillo acento para el matching
    ];
    return borders[index % borders.length];
  }



}
