import { Categoria } from '@/app/models/categoria.models';
import { DialogCreateCategoriaService } from '@/app/services/dialogs-services/dialog-create-categoria.service';
import { DialogUpdateCategoriaService } from '@/app/services/dialogs-services/dialog-updatecategoria.service';
import { deleteCategoriaAction } from '@/app/state/actions/categoria.actions';
import { AppState } from '@/app/state/app.state';
import { CategoriaState } from '@/app/state/reducers/categoria.reducer';
import { selectCategoria } from '@/app/state/selectors/categoria.selectors';
import { selectPermissions } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAlertService, TuiAppearance, TuiButton, TuiLoader } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiBadge, TuiChip, TuiConfirmData, TuiRadio, TuiSkeleton } from '@taiga-ui/kit';
import { TuiBlockStatus } from '@taiga-ui/layout';
import { Observable } from 'rxjs';
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
export class TablecategoriesComponent implements OnInit {
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

  }

  filtrarCategorias(categorias: Categoria[]): Categoria[] {
    if (!this.searchTerm.trim()) return categorias;
    const term = this.searchTerm.toLowerCase();
    return categorias.filter(c =>
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
    this.dialogService.open(categoria).subscribe((result: any) => {

    });
  }
  private readonly dialogCreateCategoriaService = inject(DialogCreateCategoriaService);
  protected showDialogCreateCategoria(): void {
    this.dialogCreateCategoriaService.open().subscribe((result: any) => {

    });
  }
}
