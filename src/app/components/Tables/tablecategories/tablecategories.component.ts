import { Categoria } from '@/app/models/categoria.models';
import { DialogCreateCategoriaService } from '@/app/services/dialogs-services/dialog-create-categoria.service';
import { DialogUpdateCategoriaService } from '@/app/services/dialogs-services/dialog-updatecategoria.service';
import { CategoriaService } from '@/app/services/categoria.service';
import { deleteCategoriaAction, loadCategorias } from '@/app/state/actions/categoria.actions';
import { AppState } from '@/app/state/app.state';
import { CategoriaState } from '@/app/state/reducers/categoria.reducer';
import { selectCategoria } from '@/app/state/selectors/categoria.selectors';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';
import { selectPermissions } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAlertService, TuiAppearance, TuiButton, TuiLoader } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiBadge, TuiChip, TuiConfirmData, TuiRadio, TuiSkeleton } from '@taiga-ui/kit';
import { TuiBlockStatus } from '@taiga-ui/layout';
import { Observable, map } from 'rxjs';
import { serverErrorMsg } from '@/app/services/utils/server-error';
@Component({
  selector: 'app-tablecategories',
  standalone: true,

  imports: [CommonModule, FormsModule, TuiTable,
    TuiRadio,
    TuiSkeleton,
    TuiTable, TuiButton, TuiAppearance, TuiBadge, TuiBlockStatus,
    TuiLoader, TuiChip
  ],
  templateUrl: './tablecategories.component.html',
  styleUrl: './tablecategories.component.scss'
})
export class TablecategoriesComponent implements OnInit, OnChanges {
  /** Tienda a mostrar (admin viendo otro store). Sin valor: la del usuario. */
  @Input() tiendaId?: number | string;
  /** Solo el superusuario ve "Agregar/Vaciar predefinidas". */
  isSuperUser$ = this.store.select(selectCurrenttUser).pipe(map((u: any) => !!u?.is_superuser));
  selectCategorias$?: Observable<CategoriaState>
  userPermissions$ = this.store.select(selectPermissions);
  allColumns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
  ];
  filteredData: any = []
  allColumnKeys = this.allColumns.map(c => c.key);
  displayedColumns = [...this.allColumnKeys];

  searchTerm = '';
  filtroTipo: '' | 'REPUESTO' | 'ACCESORIO' = '';

  private readonly catPalette = [
    '#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE',
    '#FF2D55', '#5AC8FA', '#FFCC00', '#5856D6', '#00C7BE',
  ];

  /** Color del icono: fondo difuminado (tinte) + letra en color sólido. */
  colorCategoria(categoria: Categoria): { fondo: string; texto: string } {
    const base = categoria.color
      ? categoria.color
      : this.catPalette[this.semillaCategoria(categoria) % this.catPalette.length];
    if (/^#[0-9a-fA-F]{6}$/.test(base)) {
      return { fondo: base + '26', texto: base };
    }
    return { fondo: base, texto: '#ffffff' };
  }

  private semillaCategoria(categoria: Categoria): number {
    const id = Number(categoria.id ?? 0);
    return Number.isFinite(id) && id > 0
      ? id
      : (categoria.nombre || '?').length * 7 + 3;
  }

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.selectCategorias$ = this.store.select(selectCategoria);
    this.recargar();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tiendaId'] && !changes['tiendaId'].firstChange) this.recargar();
  }

  /** Recarga respetando la tienda vista (todas: REPUESTO + ACCESORIO). */
  private recargar() {
    if (this.tiendaId !== undefined && this.tiendaId !== null && this.tiendaId !== '') {
      this.store.dispatch(loadCategorias({ tipo: 'TODO', tienda: this.tiendaId }));
    } else {
      this.store.dispatch(loadCategorias({ tipo: 'TODO' }));
    }
  }

  filtrarCategorias(categorias: Categoria[]): Categoria[] {
    let list = categorias;
    if (this.filtroTipo) list = list.filter(c => (c.tipo || '').toUpperCase() === this.filtroTipo);
    if (!this.searchTerm.trim()) return list;
    const term = this.searchTerm.toLowerCase();
    return list.filter(c =>
      c.nombre?.toLowerCase().includes(term)
    );
  }
  getCategoriaValue(proveedor: Categoria, key: string): any {
    return proveedor[key as keyof Categoria];
  }
  private readonly dialogs = inject(TuiResponsiveDialogService);
  private readonly alerts = inject(TuiAlertService);
  protected onDeleteCategoria(id: any): void {
    const data: TuiConfirmData = {
      content: '¿Estás seguro de que deseas eliminar este ?',
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

          this.store.dispatch(deleteCategoriaAction({ id }))

        } else {

          this.alerts.open('Eliminación cancelada.').subscribe();
        }
      });
  }
  private readonly dialogService = inject(DialogUpdateCategoriaService);
  protected showDialogUpdate(categoria: Categoria): void {
    if (categoria.update_enable === false) return;
    this.dialogService.open(categoria).subscribe((result: any) => {
      if (result) this.recargar();
    });
  }
  private readonly dialogCreateCategoriaService = inject(DialogCreateCategoriaService);
  protected showDialogCreateCategoria(): void {
    this.dialogCreateCategoriaService.open(this.tiendaId ?? undefined).subscribe((result: any) => {
      if (result) this.recargar();
    });
  }

  private readonly categoriaService = inject(CategoriaService);
  seedLoading = false;

  /** Carga las 60 predefinidas (idempotente: omite las que ya existen). */
  protected cargarPredefinidas(): void {
    if (this.seedLoading) return;
    this.seedLoading = true;
    this.categoriaService.seedAccesorios(this.tiendaId ?? undefined).subscribe({
      next: (res) => {
        this.seedLoading = false;
        this.alerts.open(`Listo: ${res.creadas ?? 0} creadas, ${res.omitidas ?? 0} ya existían.`).subscribe();
        this.recargar();
      },
      error: (err) => {
        this.seedLoading = false;
        this.alerts.open(serverErrorMsg(err, 'No se pudieron cargar las predefinidas.')).subscribe();
      },
    });
  }

  /** Vacía solo las predefinidas (borrado permanente). */
  protected vaciarPredefinidas(): void {
    const data: TuiConfirmData = {
      content: 'Se eliminarán permanentemente las categorías predefinidas del sistema. Las tuyas no se tocan. ¿Continuar?',
      yes: 'Vaciar',
      no: 'Cancelar',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Vaciar predefinidas',
        size: 's',
        data,
      })
      .subscribe((confirm) => {
        if (!confirm || this.seedLoading) return;
        this.seedLoading = true;
        this.categoriaService.deleteSeedAccesorios(this.tiendaId ?? undefined).subscribe({
          next: (res) => {
            this.seedLoading = false;
            this.alerts.open(`Listo: ${res.eliminadas ?? 0} predefinidas eliminadas.`).subscribe();
            this.recargar();
          },
          error: (err) => {
            this.seedLoading = false;
            this.alerts.open(serverErrorMsg(err, 'No se pudieron vaciar las predefinidas.')).subscribe();
          },
        });
      });
  }
}
