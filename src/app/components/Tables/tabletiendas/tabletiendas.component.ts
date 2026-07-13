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
import { Router } from '@angular/router';
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

  constructor(private store: Store<AppState>, private cdRef: ChangeDetectorRef, private router: Router) { }

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
    this.router.navigate(['/admin/store', tienda.id]);
  }
  private cardColors = [

    'dark:bg-zinc-800 bg-white text-gray-900 dark:text-white border-neutral-200 dark:border-neutral-700 border-2'    // 💡 Amarillo acento moderno
  ];

  getCardColor(index: number): string {
    return this.cardColors[index % this.cardColors.length];
  }

  getCardBorderColor(index: number): string {
    const borders = [
      'dark:border-neutral-700 border-neutral-200'
    ];
    return borders[index % borders.length];
  }

  private gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
    'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  ];

  getGradient(index: number): string {
    return this.gradients[index % this.gradients.length];
  }

  private userColors = [
    '#667eea', '#f5576c', '#4facfe', '#43e97b',
    '#fa709a', '#a18cd1', '#fccb90', '#e0c3fc',
  ];

  getUserColor(index: number): string {
    return this.userColors[index % this.userColors.length];
  }

  getUserNames(tienda: Tienda): string {
    const users = tienda.users_tienda || [];
    if (users.length === 0) return '';
    const names = users.slice(0, 3).map(u => u.first_name || u.username);
    const extra = users.length > 3 ? ` +${users.length - 3} más` : '';
    return names.join(', ') + extra;
  }



}
