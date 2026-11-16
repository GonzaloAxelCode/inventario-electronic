import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton, TuiDataList, TuiDropdown, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge, TuiDataListWrapper, TuiPagination } from '@taiga-ui/kit';
import { TuiInputModule, TuiSelectModule, TuiTextareaModule, TuiTextfieldControllerModule } from "@taiga-ui/legacy";

import { Categoria } from '@/app/models/categoria.models';
import { Celular } from '@/app/models/celular.models';
import { AppState } from '@/app/state/app.state';
import { loadInventarios } from '@/app/state/actions/inventario.actions';
import { InventarioState } from '@/app/state/reducers/inventario.reducer';
import { selectCategoriaState } from '@/app/state/selectors/categoria.selectors';
import { selectInventario } from '@/app/state/selectors/inventario.selectors';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngrx/store';

import { TuiDialogContext } from '@taiga-ui/core';

import { Inventario } from '@/app/models/inventario.models';
import { CelularService } from '@/app/services/celular.service';
import { imageUrl } from '@/app/services/utils/endpoints';
import { TuiBlockDetails } from '@taiga-ui/layout';
import { injectContext } from '@taiga-ui/polymorpheus';
import { Observable } from 'rxjs';
import { TableinventarioComponent } from "../../Tables/tableinventario/tableinventario.component";

@Component({
  selector: 'app-dialogselectproducts',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiDataListWrapper,
    TuiDataList,
    TuiDropdown,
    TuiSelectModule,
    TuiTextareaModule,
    TuiButton,
    TuiTextfield,
    TuiTextfieldControllerModule,
    TuiInputModule, TuiAppearance, TuiAppearance, TuiTable, TuiBadge, TuiInputModule, TuiBlockDetails, TuiIcon, TuiPagination, TableinventarioComponent],
  templateUrl: './dialogselectproducts.component.html',

  styleUrl: './dialogselectproducts.component.scss'
})
export class DialogselectproductsComponent implements OnInit {


  inventariosState$?: Observable<InventarioState>;
  inventarioForm2!: FormGroup;

  allColumns = [
    { key: 'id', label: 'ID' },

    { key: 'producto_nombre', label: 'Producto' },



  ];
  filteredData: any = []
  allColumnKeys = this.allColumns.map(c => c.key);
  displayedColumns = [...this.allColumnKeys];
  categorias: Categoria[] = [];

  protected readonly context = injectContext<TuiDialogContext<any>>();
  private readonly celularService = inject(CelularService);

  /** Tabs modernos: accesorios (inventario) o celulares (venta por IMEI). */
  tab: 'accesorios' | 'celulares' = 'accesorios';

  // --- Celulares (API real, solo disponibles) ---
  celulares: Celular[] = [];
  celularesLoading = false;
  celularesCount = 0;
  celularesPage = 1;
  celularesPageSize = 10;
  celularesTotalPages = 0;
  celularesSearch = '';
  private celularesLoaded = false;

  constructor(private fb: FormBuilder, private store: Store<AppState>) {


  }
  ngOnInit() {
    this.store.dispatch(loadInventarios());
    this.inventariosState$ = this.store.select(selectInventario)
    this.store.select(selectCategoriaState).subscribe((state) => {
      this.categorias = state.categorias;

    });
  }

  setTab(tab: 'accesorios' | 'celulares'): void {
    this.tab = tab;
    if (tab === 'celulares' && !this.celularesLoaded) {
      this.loadCelulares();
    }
  }

  img(path: string | null | undefined): string {
    return imageUrl(path);
  }

  celularFoto(c: Celular): string {
    return this.img(c.imagen1 || c.imagen2);
  }

  loadCelulares(): void {
    this.celularesLoading = true;
    this.celularService.list({
      search: this.celularesSearch?.trim() || undefined,
      disponible: 'true',
      page: this.celularesPage,
      page_size: this.celularesPageSize,
    }).subscribe({
      next: (res) => {
        this.celulares = res.results ?? [];
        this.celularesCount = Number(res.count ?? 0);
        this.celularesPage = Number(res.page ?? 1);
        this.celularesTotalPages = Number(res.length_pages ?? 0) || Math.ceil(this.celularesCount / this.celularesPageSize);
        this.celularesLoading = false;
        this.celularesLoaded = true;
      },
      error: () => {
        this.celularesLoading = false;
        this.celularesLoaded = true;
      },
    });
  }

  onCelularSearchChange(): void {
    this.celularesPage = 1;
    this.loadCelulares();
  }

  goToCelularPage(index: number): void {
    this.celularesPage = index + 1;
    this.loadCelulares();
  }

  /** Solo disponibles con precio se pueden agregar (unidad única por IMEI). */
  puedeElegirCelular(c: Celular): boolean {
    return !!c?.disponible && Number(c.precio_venta) > 0;
  }

  /**
   * Devuelve el celular con forma de Inventario para no romper a los
   * consumidores (hacerventa, pedidos, lives). La venta real por IMEI
   * requiere soporte en el backend (ver nota en el commit).
   */
  seleccionarCelular(c: Celular): void {
    if (!this.puedeElegirCelular(c)) return;
    const foto = c.imagen1 || c.imagen2 || null;
    this.context.completeWith({
      id: `celular-${c.id}`,
      producto: { id: `celular-${c.id}` },
      producto_nombre: `${c.marca} ${c.modelo} · ${c.memoria} · IMEI ${c.imei1}`,
      categoria_nombre: 'Celulares',
      costo_venta: c.precio_venta,
      cantidad: 1,
      producto_sku: c.imei1,
      imagen_producto: foto ? foto.replace(/^https?:\/\/[^/]+/, '') : null,
      activo: true,
      es_celular: true,
      celular_id: c.id,
      celularId: c.id,
      imei1: c.imei1,
    });
  }
  getCategoriaNombre = (id: number): string => {
    const categoria = this.categorias.find((c) => c.id === id);
    return categoria ? categoria.nombre : '';
  };
  getInventarioValue(inventario: any, key: string): any {
    return inventario[key as keyof any];
  }
  cerrarDialogo(product: Inventario) {
    this.context.completeWith(product);
  }
  closeAndSelectProduct = (inventario: Inventario) => {
    this.context.completeWith(inventario);
  }

  cerrarSinSeleccion(): void {
    this.context.completeWith(null as any);
  }

  getColorClass(cantidad: number): string {
    if (cantidad >= 0 && cantidad <= 3) {
      return 'text-red-500';
    } else if (cantidad >= 4 && cantidad <= 10) {
      return 'text-yellow-400';
    } else {
      return 'text-green-400';
    }
  }
}
