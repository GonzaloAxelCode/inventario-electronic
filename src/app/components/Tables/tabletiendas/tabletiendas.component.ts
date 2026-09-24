import { Tienda, TiendaState, getPropietarioId, getPropietarioLabel } from '@/app/models/tienda.models';
import { DialogDetailTiendaService } from '@/app/services/dialogs-services/dialog-detailtienda.service';
import { DialogUpdateTiendaService } from '@/app/services/dialogs-services/dialog-updatetienda.service';
import { URL_BASE, imageUrl } from '@/app/services/utils/endpoints';
import { desactivateTiendaAction } from '@/app/state/actions/tienda.actions';
import { AppState } from '@/app/state/app.state';
import { selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
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
  @Input() tiendas: Tienda[] | null = null;
  /** Crear sucursal de un padre: el padre abre el modal con jerarquía prefijada. */
  @Output() crearSucursal = new EventEmitter<Tienda>();
  /** Muestra el contador "N tiendas" (oculto para admin_tienda). */
  @Input() mostrarContador = true;
  URL_BASE = URL_BASE;
  imageUrl = imageUrl;
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
  /** Solo superusuario ve el badge "Inactiva" y puede abrir tiendas desactivadas. */
  isSuperUser = false;
  editingId: number | any = null;
  editedTienda: Partial<Tienda> = {};

  constructor(private store: Store<AppState>, private cdRef: ChangeDetectorRef, private router: Router) { }

  ngOnInit() {

    this.tiendasState$ = this.store.select(selectTiendaState);

    this.store.select(selectCurrenttUser).pipe(
      tap((user: any) => {
        this.isSuperUser = !!user?.is_superuser;
        this.cdRef.markForCheck();
      })
    ).subscribe();

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
  protected showDialogUpdate(tienda?: Tienda): void {
    this.dialogService.open(tienda ?? {}).subscribe((result: any) => {
      if (result) {
        // Actualizado, el store ya se encarga de refrescar
      }
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

  /** Buscador en tiempo real de tiendas principales (nombre / razón social / RUC, o nombre de sucursal). */
  busqueda = '';

  gruposVisibles(tiendas: Tienda[]): { padre: Tienda; sucursales: Tienda[] }[] {
    const grupos = this.getGruposJerarquia(tiendas);
    const q = this.busqueda.trim().toLowerCase();
    if (!q) return grupos;
    return grupos.filter(g => {
      const padreOk = [g.padre.nombre, (g.padre as any)?.razon_social, g.padre.ruc]
        .some(v => String(v ?? '').toLowerCase().includes(q));
      if (padreOk) return true;
      return g.sucursales.some(s => String(s?.nombre ?? '').toLowerCase().includes(q));
    });
  }

  /** Solo tiendas padre vigentes (sin tienda_padre o con padre fuera de la lista). */
  soloPadres(tiendas: Tienda[]): Tienda[] {
    const lista = (tiendas ?? []).filter(t => !(t as any).is_deleted);
    const ids = new Set(lista.map(t => t.id));
    return lista.filter(t => t.tienda_padre == null || !ids.has(t.tienda_padre as number));
  }

  /** Padres con sus sucursales vigentes: prefiere el anidado del GET, si no deriva de la lista plana */
  getGruposJerarquia(tiendas: Tienda[]): { padre: Tienda; sucursales: Tienda[] }[] {
    const lista = (tiendas ?? []).filter(t => !(t as any).is_deleted);
    const padres = this.soloPadres(lista);
    const nestedIds = new Set<number>();
    for (const p of padres) for (const s of (p.sucursales ?? [])) nestedIds.add(s.id);
    return padres.map(p => {
      const base: Tienda[] = p.sucursales?.length
        ? [...p.sucursales]
        : lista.filter(t => t.id !== p.id && !nestedIds.has(t.id) && t.tienda_padre === p.id);
      return {
        padre: p,
        sucursales: base.filter(s => !(s as any).is_deleted),
      };
    });
  }

  /** Expand de sucursales: abierto por defecto (solo se colapsa manualmente) */
  private collapsedPadres = new Set<number>();

  sucursalesAbiertas(padreId: number): boolean {
    return !this.collapsedPadres.has(padreId);
  }

  toggleSucursales(padreId: number): void {
    if (this.collapsedPadres.has(padreId)) {
      this.collapsedPadres.delete(padreId);
    } else {
      this.collapsedPadres.add(padreId);
    }
  }

  getOwnerLabel(t: Tienda): string {
    return getPropietarioLabel(t);
  }

  getGroupedTiendas(tiendas: Tienda[]): { ownerId: number | null; ownerLabel: string; tiendas: Tienda[] }[] {
    const map = new Map<string, { ownerId: number | null; ownerLabel: string; tiendas: Tienda[] }>();
    for (const t of tiendas) {
      const ownerId = getPropietarioId(t);
      const key = ownerId != null ? `owner-${ownerId}` : 'sin-owner';
      if (!map.has(key)) {
        map.set(key, { ownerId, ownerLabel: getPropietarioLabel(t), tiendas: [] });
      }
      map.get(key)!.tiendas.push(t);
    }
    return Array.from(map.values()).sort((a, b) => {
      if (a.ownerId == null) return 1;
      if (b.ownerId == null) return -1;
      return a.ownerId - b.ownerId;
    });
  }

  getOwnerInitials(label: string): string {
    const parts = label.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (label[0] || '?').toUpperCase();
  }

}
