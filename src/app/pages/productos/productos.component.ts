import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton, TuiDataList, TuiDialogService, TuiDropdown, TuiExpand, TuiGroup, TuiIcon, TuiLink, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar, TuiBlock, TuiConfirmService, TuiDataListWrapper, TuiFade, TuiItemsWithMore, TuiPagination, TuiRadio } from '@taiga-ui/kit';

import {
  TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule
} from '@taiga-ui/legacy';

import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { ButtonupdateComponent } from "@/app/components/buttonupdate/buttonupdate.component";

import { TableproductComponent } from '@/app/components/Tables/tableproduct/tableproduct.component';
import { DialogCreateCategoriaService } from '@/app/services/dialogs-services/dialog-create-categoria.service';
import { DialogCreateCelularService } from '@/app/services/dialogs-services/dialog-create-celular.service';
import { DialogCreateProductService } from '@/app/services/dialogs-services/dialog-create-product.service';
import { DialogCreateRepuestoService } from '@/app/services/dialogs-services/dialog-create-repuesto.service';
import { CelularService } from '@/app/services/celular.service';
import { CategoriaService } from '@/app/services/categoria.service';
import { RepuestoService } from '@/app/services/repuesto.service';
import { CustomAlertService } from '@/app/services/ui/custom-alert.service';
import { imageUrl } from '@/app/services/utils/endpoints';
import { PAGE_SIZE_PRODUCTS } from '@/app/services/utils/pages-sizes';
import { loadCategorias } from '@/app/state/actions/categoria.actions';
import { clearSearchProductos, loadProductosAction } from '@/app/state/actions/producto.actions';
import { AppState } from '@/app/state/app.state';
import { selectProducto } from '@/app/state/selectors/producto.selectors';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';
import { tienePermiso } from '@/app/models/permissions.catalog';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { TuiRepeatTimes } from '@taiga-ui/cdk';
import { TuiHeader, TuiNavigation } from '@taiga-ui/layout';
import { Celular } from '@/app/models/celular.models';
import { Categoria } from '@/app/models/categoria.models';
import { Repuesto } from '@/app/models/repuesto.models';


@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [ReactiveFormsModule,
    TuiRadio, CommonModule,
    TuiButton, TuiHeader, TuiTitle, TuiNavigation,
    TuiDropdown, TuiFade,
    TuiItemsWithMore, TuiPagination,
    FormsModule,
    TuiDropdown, TuiAppearance, TuiBlock,
    TuiItemsWithMore,
    TuiTable, TuiIcon,
    TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule,
    TuiDataList, TuiDataListWrapper,
    TuiExpand, TableproductComponent,
    TuiGroup,
    TuiHeader,
    TuiIcon,
    TuiLink,
    TuiNavigation,
    TuiRepeatTimes,
    TuiTextfield, ButtonupdateComponent,
    TuiTitle, TuiIcon, TuiAvatar, ButtonupdateComponent],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiConfirmService]



})
export class ProductosComponent implements OnInit {
  private readonly confirm = inject(TuiConfirmService);

  private readonly dialogs = inject(TuiDialogService);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly celularService = inject(CelularService);
  private readonly repuestoService = inject(RepuestoService);
  private readonly categoriaService = inject(CategoriaService);
  private readonly alerts = inject(CustomAlertService);

  loading: any = false;

  activeTab: 'productos' = 'productos';

  categoriaActiva: string | null = null;

  // --- Celulares (API real, sin categoría) ---
  celulares: Celular[] = [];
  celularesLoading = false;
  celularesCount = 0;
  celularesPage = 1;
  celularesPageSize = 10;
  celularesTotalPages = 0;
  celularesSearch = '';
  celularesViewMode: 'lista' | 'grilla' = 'grilla';
  celularMarca = 'Todo';
  celularMemoria = 'Todo';
  celularEstadoEquipo = 'Todo';
  celularDisponible = 'Todo';
  marcasFiltro = ['Apple', 'Samsung', 'Xiaomi', 'Redmi', 'Motorola', 'Honor', 'Realme', 'Infinix', 'Oppo', 'Vivo'];
  memoriasFiltro = ['128 GB', '256 GB', '512 GB', '1 TB'];
  estadosEquipoFiltro = ['Sellado', 'Nuevo', 'Seminuevo', 'Reacondicionado'];
  disponibilidadFiltro = [{ value: 'true', label: 'Disponible' }, { value: 'false', label: 'No disponible' }];

  // --- Repuestos (API real, solo taller) ---
  repuestos: Repuesto[] = [];
  repuestosLoading = false;
  repuestosCount = 0;
  repuestosPage = 1;
  repuestosPageSize = 10;
  repuestosTotalPages = 0;
  repuestosSearch = '';
  repuestosViewMode: 'lista' | 'grilla' = 'lista';
  repuestoCategoria: string | number = 'Todo';
  categoriasRepuesto: Categoria[] = [];

  repuestoCategoriaStringify = (id: string | number | null | undefined): string => {
    if (id == null || id === '' || id === 'Todo') return 'Todo';
    const found = this.categoriasRepuesto.find((c) => c.id === Number(id));
    return found ? found.nombre : String(id);
  };

  setCelularesViewMode(mode: 'lista' | 'grilla'): void {
    this.celularesViewMode = mode;
    this.cdr.markForCheck();
  }

  setRepuestosViewMode(mode: 'lista' | 'grilla'): void {
    this.repuestosViewMode = mode;
    this.cdr.markForCheck();
  }

  /** 'Todo' (o vacío) = sin filtro para la API. */
  filtroSelect(v: any): string | undefined {
    return v != null && v !== '' && v !== 'Todo' ? String(v) : undefined;
  }

  @ViewChild(TableproductComponent) tabla?: TableproductComponent;

  setCategoria(categoria: { id?: number; nombre?: string } | string | null) {
    const nombre = typeof categoria === 'string' ? categoria : (categoria?.nombre ?? null);
    this.categoriaActiva = nombre;
    if (typeof categoria !== 'string') {
      this.tabla?.filtrarPorCategoria(categoria);
    } else if (this.activeInventoryType === 'celulares') {
      this.celularesPage = 1;
      this.loadCelulares();
    } else if (this.activeInventoryType === 'repuestos') {
      this.repuestosPage = 1;
      this.loadRepuestos();
    }
    this.cdr.markForCheck();
  }

  validInventoryTypes = ['celulares', 'accesorios', 'repuestos'] as const;
  activeInventoryType: 'celulares' | 'accesorios' | 'repuestos' = 'accesorios';
  activeInventoryIndex = 1;

  inventoryTypes = [
    {
      id: 'celulares' as const,
      label: 'Celulares',
      desc: 'Venta con IMEI',
      icon: '@tui.smartphone',
    },
    {
      id: 'accesorios' as const,
      label: 'Accesorios',
      desc: 'Fundas, micas, cargadores',
      icon: '@tui.headphones',
    },
    {
      id: 'repuestos' as const,
      label: 'Repuestos',
      desc: 'Taller y repuestos',
      icon: '@tui.wrench',
    },
  ];

  onInventoryChange(index: number) {
    const t = this.validInventoryTypes[index];
    this.applyInventoryType(t);
    this.location.replaceState(`/app/inventario#${t}`);
  }

  private applyInventoryType(t: 'celulares' | 'accesorios' | 'repuestos') {
    this.activeInventoryType = t;
    this.activeInventoryIndex = this.validInventoryTypes.indexOf(t);
    this.categoriaActiva = null;
    this.store.dispatch(clearSearchProductos());
    this.store.dispatch(loadProductosAction({ page: 1, page_size: PAGE_SIZE_PRODUCTS }));
    if (t === 'celulares') this.loadCelulares();
    if (t === 'repuestos') this.loadRepuestos();
    this.cdr.markForCheck();
  }

  protected value = '';

  protected onModelChange(value: string): void {
    this.value = value;
    this.confirm.markAsDirty();
  }

  constructor(private store: Store<AppState>, private cdr: ChangeDetectorRef) { }

  user$ = this.store.select(selectCurrenttUser);
  tiene = tienePermiso;

  private readonly dialogservicecreatecategoria = inject(DialogCreateCategoriaService);
  protected showDialogCreateCategoria(): void {
    this.dialogservicecreatecategoria.open().subscribe((result: any) => {

    });
  }
  private readonly dialogserviceCreateProduct = inject(DialogCreateProductService);
  protected showDialogCreateProduct(): void {
    this.dialogserviceCreateProduct.open().subscribe((result: any) => {

    });
  }

  // ============ CELULARES ============
  img(path: string | null | undefined): string {
    return imageUrl(path);
  }

  celularFoto(c: Celular): string {
    return this.img(c.imagen1 || c.imagen2);
  }

  repuestoFoto(r: Repuesto): string {
    // Una sola imagen genérica cuando el repuesto no tiene fotos
    return this.img(r.imagen1 || r.imagen2) || 'assets/sin-imagen.jpg';
  }

  loadCelulares(): void {
    this.celularesLoading = true;
    this.cdr.markForCheck();
    this.celularService.list({
      search: this.celularesSearch?.trim() || undefined,
      marca: this.filtroSelect(this.celularMarca),
      memoria: this.filtroSelect(this.celularMemoria),
      estado_equipo: this.filtroSelect(this.celularEstadoEquipo),
      disponible: this.filtroSelect(this.celularDisponible),
      page: this.celularesPage,
      page_size: this.celularesPageSize,
    }).subscribe({
      next: (res) => {
        this.celulares = res.results ?? [];
        this.celularesCount = Number(res.count ?? 0);
        this.celularesPage = Number(res.page ?? 1);
        this.celularesTotalPages = Number(res.length_pages ?? 0) || Math.ceil(this.celularesCount / this.celularesPageSize);
        this.celularesLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.celularesLoading = false;
        this.alerts.showError('No se pudo cargar celulares', 'Error').subscribe();
        this.cdr.markForCheck();
      },
    });
  }

  onCelularSearchChange(): void {
    this.celularesPage = 1;
    this.loadCelulares();
  }

  onCelularFilterChange(): void {
    this.celularesPage = 1;
    this.loadCelulares();
  }

  clearCelularFilters(): void {
    this.celularMarca = 'Todo';
    this.celularMemoria = 'Todo';
    this.celularEstadoEquipo = 'Todo';
    this.celularDisponible = 'Todo';
    this.celularesSearch = '';
    this.celularesPage = 1;
    this.loadCelulares();
  }

  goToCelularPage(index: number): void {
    this.celularesPage = index + 1;
    this.loadCelulares();
  }

  private buildCelularFormData(f: any): FormData {
    const fd = new FormData();
    fd.append('marca', String(f.marca ?? ''));
    fd.append('modelo', String(f.modelo ?? ''));
    fd.append('color', String(f.color ?? ''));
    fd.append('memoria', String(f.memoria ?? ''));
    if (f.ram) fd.append('ram', String(f.ram));
    fd.append('estado_equipo', String(f.estado ?? ''));
    fd.append('imei1', String(f.imei1 ?? '').trim());
    if (f.imei2) fd.append('imei2', String(f.imei2).trim());
    fd.append('dualSim', String(!!f.dualSim));
    if (f.costoCompra !== '' && f.costoCompra != null) fd.append('costo_compra', String(f.costoCompra));
    if (f.precioVenta !== '' && f.precioVenta != null) fd.append('precio_venta', String(f.precioVenta));
    fd.append('disponible', String(!!f.disponible));
    const files: File[] = f.fotosFiles ?? [];
    files.slice(0, 2).forEach((file, i) => fd.append(`imagen${i + 1}`, file, file.name));
    return fd;
  }

  private readonly dialogCreateCelular = inject(DialogCreateCelularService);
  protected showDialogCreateCelular(): void {
    this.dialogCreateCelular.open().subscribe((result: any) => {
      if (!result) return;
      this.celularService.create(this.buildCelularFormData(result)).subscribe({
        next: () => {
          this.alerts.showSuccess('Celular creado exitosamente').subscribe();
          this.loadCelulares();
        },
        error: (e) => {
          this.alerts.showError(this.formErrorMsg(e, 'No se pudo crear el celular'), 'Error').subscribe();
        },
      });
    });
  }

  protected showDialogEditCelular(c: Celular): void {
    this.dialogCreateCelular.openEdit({ ...c }).subscribe((result: any) => {
      if (!result) return;
      this.celularService.update(c.id, this.buildCelularFormData(result)).subscribe({
        next: () => {
          this.alerts.showSuccess('Celular actualizado exitosamente').subscribe();
          this.loadCelulares();
        },
        error: (e) => {
          this.alerts.showError(this.formErrorMsg(e, 'No se pudo actualizar el celular'), 'Error').subscribe();
        },
      });
    });
  }

  protected deleteCelular(c: Celular): void {
    if (!confirm(`¿Eliminar permanentemente ${c.marca} ${c.modelo}? Esta acción no se puede deshacer.`)) return;
    this.celularService.delete(c.id).subscribe({
      next: () => {
        this.alerts.showSuccess('Celular eliminado permanentemente').subscribe();
        this.loadCelulares();
      },
      error: () => this.alerts.showError('No se pudo eliminar el celular', 'Error').subscribe(),
    });
  }

  // ============ REPUESTOS ============
  loadRepuestos(): void {
    this.repuestosLoading = true;
    this.cdr.markForCheck();
    const q = this.repuestosSearch?.trim() || '';
    // El buscador también filtra por categoría: si el texto coincide con
    // una categoría (y no hay una seleccionada), se envía su id.
    let categoriaParam = this.filtroSelect(this.repuestoCategoria);
    if (!categoriaParam && q) {
      const qLower = q.toLowerCase();
      const exact = this.categoriasRepuesto.find((c) => (c.nombre ?? '').toLowerCase() === qLower);
      const partial = exact ?? this.categoriasRepuesto.find((c) => (c.nombre ?? '').toLowerCase().includes(qLower));
      if (partial?.id != null) categoriaParam = String(partial.id);
    }
    this.repuestoService.list({
      search: q || undefined,
      categoria: categoriaParam,
      page: this.repuestosPage,
      page_size: this.repuestosPageSize,
    }).subscribe({
      next: (res) => {
        let list = res.results ?? [];
        // Fallback local: si el backend no busca por nombre/categoría, filtrar aquí también
        // por nombre / categoría / tipo / modelo / ubicación.
        if (q) {
          const qLower = q.toLowerCase();
          const hasMatch = list.some((r) =>
            (r.nombre ?? '').toLowerCase().includes(qLower) ||
            (r.categoria_nombre ?? '').toLowerCase().includes(qLower)
          );
          if (!hasMatch) {
            const filtered = list.filter((r) =>
              (r.nombre ?? '').toLowerCase().includes(qLower) ||
              (r.categoria_nombre ?? '').toLowerCase().includes(qLower) ||
              (r.modelos_compatibles ?? '').toLowerCase().includes(qLower) ||
              (r.ubicacion ?? '').toLowerCase().includes(qLower)
            );
            // Solo aplicar si aporta resultados (no romper paginado del backend)
            if (filtered.length > 0) list = filtered;
          }
        }
        this.repuestos = list;
        this.repuestosCount = Number(res.count ?? 0);
        this.repuestosPage = Number(res.page ?? 1);
        this.repuestosTotalPages = Number(res.length_pages ?? 0) || Math.ceil(this.repuestosCount / this.repuestosPageSize);
        this.repuestosLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.repuestosLoading = false;
        this.alerts.showError('No se pudo cargar repuestos', 'Error').subscribe();
        this.cdr.markForCheck();
      },
    });
  }

  onRepuestoSearchChange(): void {
    this.repuestosPage = 1;
    this.loadRepuestos();
  }

  onRepuestoFilterChange(): void {
    this.repuestosPage = 1;
    this.loadRepuestos();
  }

  clearRepuestoFilters(): void {
    this.repuestoCategoria = 'Todo';
    this.repuestosSearch = '';
    this.repuestosPage = 1;
    this.loadRepuestos();
  }

  goToRepuestoPage(index: number): void {
    this.repuestosPage = index + 1;
    this.loadRepuestos();
  }

  private buildRepuestoFormData(f: any, isEdit = false): FormData {
    const fd = new FormData();
    fd.append('nombre', String(f.nombre ?? '').trim());
    if (f.categoria === '' || f.categoria == null) fd.append('categoria', '');
    else fd.append('categoria', String(f.categoria));
    fd.append('modelos_compatibles', String(f.modelos ?? ''));
    if (f.cantidad !== '' && f.cantidad != null) fd.append('cantidad', String(f.cantidad));
    // Backend acepta valorizacion total o costo_compra unitario; mandamos valorizacion
    if (f.valorizacion !== '' && f.valorizacion != null) fd.append('valorizacion', String(f.valorizacion));
    // Sin proveedor -> se envía vacío ('') para limpiar/omitir en backend
    if (f.proveedor === '' || f.proveedor == null) fd.append('proveedor', '');
    else fd.append('proveedor', String(f.proveedor));
    // Ubicación es texto libre
    if (f.ubicacion != null && String(f.ubicacion).trim() !== '') fd.append('ubicacion', String(f.ubicacion).trim());
    else fd.append('ubicacion', '');
    const files: File[] = f.fotosFiles ?? [];
    files.slice(0, 2).forEach((file, i) => fd.append(`imagen${i + 1}`, file, file.name));
    void isEdit;
    return fd;
  }

  // Errores DRF {campo: [...]} -> texto legible (stock se muestra como cantidad)
  private formErrorMsg(e: any, fallback: string): string {
    if (e?.name === 'TimeoutError') {
      return 'La operación tardó demasiado y se canceló. Revisa tu conexión o reintenta.';
    }
    const err = e?.error;
    if (!err) return fallback;
    if (typeof err === 'string') return err;
    if (err.error || err.detail) return String(err.error || err.detail);
    if (typeof err === 'object') {
      const parts = Object.entries(err).map(([k, v]) => {
        const key = k === 'stock' ? 'cantidad' : k;
        return `${key}: ${Array.isArray(v) ? v.join(', ') : String(v)}`;
      });
      if (parts.length) return parts.join(' | ');
    }
    return fallback;
  }

  private readonly dialogCreateRepuesto = inject(DialogCreateRepuestoService);
  protected showDialogCreateRepuesto(): void {
    this.dialogCreateRepuesto.open().subscribe((result: any) => {
      if (!result) return;
      this.repuestoService.create(this.buildRepuestoFormData(result)).subscribe({
        next: () => {
          this.alerts.showSuccess('Repuesto creado exitosamente').subscribe();
          this.loadRepuestos();
        },
        error: (e) => {
          this.alerts.showError(this.formErrorMsg(e, 'No se pudo crear el repuesto'), 'Error').subscribe();
        },
      });
    });
  }

  protected showDialogEditRepuesto(r: Repuesto): void {
    this.dialogCreateRepuesto.openEdit({ ...r }).subscribe((result: any) => {
      if (!result) return;
      this.repuestoService.update(r.id, this.buildRepuestoFormData(result, true)).subscribe({
        next: () => {
          this.alerts.showSuccess('Repuesto actualizado exitosamente').subscribe();
          this.loadRepuestos();
        },
        error: (e) => this.alerts.showError(this.formErrorMsg(e, 'No se pudo actualizar el repuesto'), 'Error').subscribe(),
      });
    });
  }

  protected deleteRepuesto(r: Repuesto): void {
    this.repuestoService.delete(r.id).subscribe({
      next: () => {
        this.alerts.showSuccess('Repuesto eliminado exitosamente').subscribe();
        this.loadRepuestos();
      },
      error: () => this.alerts.showError('No se pudo eliminar el repuesto', 'Error').subscribe(),
    });
  }

  ngOnInit() {
    this.store.dispatch(loadCategorias({}));
    // Filtro de repuestos: solo categorías REPUESTO (el store trae ACCESORIO)
    this.categoriaService.fetchCategorias('REPUESTO').subscribe({
      next: (list) => { this.categoriasRepuesto = list ?? []; this.cdr.markForCheck(); },
      error: () => { this.categoriasRepuesto = []; },
    });
    this.store.select(selectProducto).subscribe((state) => {
      this.loading = state.loadingProductos || false;
    });

    this.route.fragment.subscribe((fragment) => {
      // Rutas: #accesorios (defecto), #celulares, #repuestos
      if (fragment && (this.validInventoryTypes as readonly string[]).includes(fragment)) {
        this.applyInventoryType(fragment as typeof this.activeInventoryType);
      } else {
        this.applyInventoryType('accesorios');
        this.location.replaceState('/app/inventario#accesorios');
      }
      this.activeTab = 'productos';
      this.cdr.markForCheck();
    });
  }

  clickRefreshProducts() {
    this.store.dispatch(loadProductosAction({ page: 1, page_size: PAGE_SIZE_PRODUCTS }));
  }

}
