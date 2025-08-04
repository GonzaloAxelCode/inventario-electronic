import { Categoria, CategoriaState } from '@/app/models/categoria.models';
import { DialogUpdateCategoriaService } from '@/app/services/dialogs-services/dialog-updatecategoria.service';
import { deleteCategoriaAction } from '@/app/state/actions/categoria.actions';
import { AppState } from '@/app/state/app.state';
import { selectCategoria } from '@/app/state/selectors/categoria.selectors';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAlertService, TuiAppearance, TuiButton } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiBadge, TuiConfirmData, TuiRadio } from '@taiga-ui/kit';
import { Observable } from 'rxjs';
@Component({
  selector: 'app-tablecategories',
  standalone: true,

  imports: [CommonModule, FormsModule, TuiTable, CommonModule,

    TuiRadio,
    FormsModule,
    TuiTable, TuiButton, TuiAppearance, TuiBadge
  ],
  templateUrl: './tablecategories.component.html',
  styleUrl: './tablecategories.component.scss'
})
export class TablecategoriesComponent implements OnInit {
  selectCategorias$?: Observable<CategoriaState>

  allColumns = [
    { key: 'id', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripccion', label: 'Descripccion' },
    { key: 'siglas_nombre_categoria', label: 'Abre' },

  ];
  filteredData: any = []
  allColumnKeys = this.allColumns.map(c => c.key);
  displayedColumns = [...this.allColumnKeys];

  constructor(private store: Store<AppState>) { }

  ngOnInit() {
    this.selectCategorias$ = this.store.select(selectCategoria);
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
          this.alerts.open(' eliminado exitosamente.').subscribe();
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
}
