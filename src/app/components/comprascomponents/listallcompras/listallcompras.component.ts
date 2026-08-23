import { ComprobanteCompra } from '@/app/models/compra.models';
import { PAGE_SIZE_COMPRAS } from '@/app/services/utils/pages-sizes';
import { QuerySearchCompra } from '@/app/services/compra.service';
import { DialogCompraDetailService } from '@/app/services/dialogs-services/dialog-compra-detail.service';
import { cargarCompras, searchCompras, clearSearchCompras } from '@/app/state/actions/compra.actions';
import { AppState } from '@/app/state/app.state';
import { selectCompra } from '@/app/state/selectors/compra.selectors';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiBadge, TuiPagination } from '@taiga-ui/kit';
import { TuiBlockStatus } from '@taiga-ui/layout';
import { TuiButton, TuiDataList, TuiExpand, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { Subject, takeUntil } from 'rxjs';
import * as dayjs from 'dayjs';
import * as advancedFormat from 'dayjs/plugin/advancedFormat';
import * as localizedFormat from 'dayjs/plugin/localizedFormat';

//@ts-ignore
dayjs.extend(advancedFormat); //@ts-ignore
dayjs.extend(localizedFormat);
dayjs.locale('es');

@Component({
  selector: 'app-listallcompras',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiBadge,
    TuiPagination,
    TuiBlockStatus,
    TuiLoader,
    TuiButton,
    TuiExpand,
    TuiTextfield,
    TuiDataList,
    TuiSelectModule,
    TuiTextfieldControllerModule,
  ],
  templateUrl: './listallcompras.component.html',
  styleUrl: './listallcompras.component.scss'
})
export class ListallcomprasComponent implements OnInit, OnDestroy {

  private store = inject(Store<AppState>);
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);
  private dialogCompraDetail = inject(DialogCompraDetailService);

  compras: ComprobanteCompra[] = [];
  loading = false;
  loadingSearch = false;
  indexPage = 0;
  lengthPages = 0;
  searchActive = false;
  expanded = false;

  tipoComprobantes = ['', '01', '03'];
  tipoComprobanteLabels: Record<string, string> = {
    '': 'Todos',
    '01': 'Factura',
    '03': 'Boleta'
  };
  monedas = ['', 'PEN', 'USD'];
  formasPago = ['', 'CONTADO', 'CREDITO'];
  formasPagoLabels: Record<string, string> = {
    '': 'Todas',
    'CONTADO': 'Contado',
    'CREDITO': 'Credito'
  };

  form = new FormGroup({
    nombre: new FormControl(''),
    tipo_comprobante: new FormControl(''),
    serie: new FormControl(''),
    correlativo: new FormControl(''),
    moneda: new FormControl(''),
    forma_pago: new FormControl(''),
    proveedor: new FormControl(''),
    fecha_desde: new FormControl(''),
    fecha_hasta: new FormControl(''),
    total_min: new FormControl(''),
    total_max: new FormControl(''),
  });

  ngOnInit() {
    this.store.dispatch(cargarCompras({ page: 1, page_size: PAGE_SIZE_COMPRAS }));

    this.store.select(selectCompra)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        if (state.search_found) {
          this.compras = (state.comprobantes_search || []).map((c) => {
            let items = c.items;
            if (typeof items === 'string') {
              try { items = JSON.parse(items); } catch { items = []; }
            }
            return { ...c, items };
          });
        } else {
          this.compras = (state.comprobantes || []).map((c) => {
            let items = c.items;
            if (typeof items === 'string') {
              try { items = JSON.parse(items); } catch { items = []; }
            }
            return { ...c, items };
          });
        }
        this.loading = !!state.loading;
        this.loadingSearch = !!state.loadingSearch;
        this.indexPage = state.index_page ?? 0;
        this.lengthPages = state.length_pages ?? 0;
        this.searchActive = state.search_found;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmitSearch() {
    const f = this.form.value;
    const query: Partial<QuerySearchCompra> = {};

    if (f.nombre) query.nombre = f.nombre;
    if (f.tipo_comprobante) query.tipo_comprobante = f.tipo_comprobante;
    if (f.serie) query.serie = f.serie;
    if (f.correlativo) query.correlativo = f.correlativo;
    if (f.moneda) query.moneda = f.moneda;
    if (f.forma_pago) query.forma_pago = f.forma_pago;
    if (f.proveedor) query.proveedor = f.proveedor;
    if (f.fecha_desde) query.fecha_desde = f.fecha_desde;
    if (f.fecha_hasta) query.fecha_hasta = f.fecha_hasta;
    if (f.total_min) query.total_min = f.total_min;
    if (f.total_max) query.total_max = f.total_max;

    this.store.dispatch(searchCompras({ query, page: 1, page_size: PAGE_SIZE_COMPRAS }));
  }

  clearSearch() {
    this.form.reset({
      nombre: '',
      tipo_comprobante: '',
      serie: '',
      correlativo: '',
      moneda: '',
      forma_pago: '',
      proveedor: '',
      fecha_desde: '',
      fecha_hasta: '',
      total_min: '',
      total_max: '',
    });
    this.store.dispatch(clearSearchCompras());
    this.store.dispatch(cargarCompras({ page: 1, page_size: PAGE_SIZE_COMPRAS }));
    this.expanded = false;
  }

  hasActiveFilters(): boolean {
    const f = this.form.value;
    return !!(f.nombre || f.tipo_comprobante || f.serie || f.correlativo ||
              f.moneda || f.forma_pago || f.proveedor || f.fecha_desde ||
              f.fecha_hasta || f.total_min || f.total_max);
  }

  formatoCorto(fecha: string): string {
    //@ts-ignore
    const txt = dayjs(fecha).format('D, MMM YYYY');
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  }

  formatoHora12(fecha: string): string {
    //@ts-ignore
    return dayjs(fecha).format('h:mm A');
  }

  getTipoComprobante(tipo: string): string {
    return tipo === '01' ? 'Factura' : 'Boleta';
  }

  getProveedorNombre(compra: ComprobanteCompra): string {
    if (compra.nombre_proveedor) return compra.nombre_proveedor;
    if (compra.proveedor) {
      if (typeof compra.proveedor === 'string') return compra.proveedor;
      if (typeof compra.proveedor === 'object' && compra.proveedor.nombre) return compra.proveedor.nombre;
    }
    return 'Sin proveedor';
  }

  goToPage(index: number): void {
    if (this.searchActive) {
      const f = this.form.value;
      const query: Partial<QuerySearchCompra> = {};
      if (f.nombre) query.nombre = f.nombre;
      if (f.tipo_comprobante) query.tipo_comprobante = f.tipo_comprobante;
      if (f.serie) query.serie = f.serie;
      if (f.correlativo) query.correlativo = f.correlativo;
      if (f.moneda) query.moneda = f.moneda;
      if (f.forma_pago) query.forma_pago = f.forma_pago;
      if (f.proveedor) query.proveedor = f.proveedor;
      if (f.fecha_desde) query.fecha_desde = f.fecha_desde;
      if (f.fecha_hasta) query.fecha_hasta = f.fecha_hasta;
      if (f.total_min) query.total_min = f.total_min;
      if (f.total_max) query.total_max = f.total_max;
      this.store.dispatch(searchCompras({ query, page: index + 1, page_size: PAGE_SIZE_COMPRAS }));
    } else {
      this.store.dispatch(cargarCompras({ page: index + 1, page_size: PAGE_SIZE_COMPRAS }));
    }
  }

  showCompraDetail(compra: ComprobanteCompra): void {
    this.dialogCompraDetail.open(compra).subscribe();
  }
}
