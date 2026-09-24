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
import { TuiPagination } from '@taiga-ui/kit';
import { TuiBlockStatus, TuiSearch } from '@taiga-ui/layout';
import { TuiButton, TuiDataList, TuiDialog, TuiLabel, TuiLoader, TuiTextfield } from '@taiga-ui/core';
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
    TuiPagination,
    TuiBlockStatus,
    TuiLoader,
    TuiButton,
    TuiLabel,
    TuiTextfield,
    TuiDataList,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiDialog,
    TuiSearch,
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
  totalCount = 0;
  searchActive = false;
  filtrosOpen = false;
  private itemsExpandidos = new Set<number>();

  tipoComprobantes = ['Todos', '01', '03'];
  tipoComprobanteLabels: Record<string, string> = {
    'Todos': 'Todos',
    '01': 'Factura',
    '03': 'Boleta'
  };
  monedas = ['Todos', 'PEN', 'USD'];
  formasPago = ['Todos', 'CONTADO', 'CREDITO'];
  formasPagoLabels: Record<string, string> = {
    'Todos': 'Todas',
    'CONTADO': 'Contado',
    'CREDITO': 'Credito'
  };
  conArchivoOptions = ['Todos', 'Sí', 'No'];

  form = new FormGroup({
    nombre: new FormControl(''),
    tipo_comprobante: new FormControl('Todos'),
    serie: new FormControl(''),
    correlativo: new FormControl(''),
    numero_comprobante: new FormControl(''),
    moneda: new FormControl('Todos'),
    forma_pago: new FormControl('Todos'),
    proveedor: new FormControl(''),
    con_pdf: new FormControl('Todos'),
    con_xml: new FormControl('Todos'),
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
        const list = state.search_found ? (state.comprobantes_search || []) : (state.comprobantes || []);
        this.compras = list.map((c) => {
          let items = c.items;
          if (typeof items === 'string') {
            try { items = JSON.parse(items); } catch { items = []; }
          }
          return { ...c, items };
        });
        this.loading = !!state.loading;
        this.loadingSearch = !!state.loadingSearch;
        this.indexPage = state.index_page ?? 0;
        this.lengthPages = state.length_pages ?? 0;
        this.totalCount = state.count ?? 0;
        this.searchActive = state.search_found;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Arma el query combinable estilo ventas (POST {query:{...}} + from_date/to_date). */
  private buildQuery(): Partial<QuerySearchCompra> {
    const f = this.form.value;
    const query: Partial<QuerySearchCompra> = {};
    if (f.nombre) query.nombre = f.nombre;
    query.tipo_comprobante = !f.tipo_comprobante || f.tipo_comprobante === 'Todos' ? '' : f.tipo_comprobante;
    if (f.serie) query.serie = f.serie;
    if (f.correlativo) query.correlativo = f.correlativo;
    if (f.numero_comprobante) (query as any).numero_comprobante = f.numero_comprobante;
    query.moneda = !f.moneda || f.moneda === 'Todos' ? '' : f.moneda;
    query.forma_pago = !f.forma_pago || f.forma_pago === 'Todos' ? '' : f.forma_pago;
    if (f.proveedor) query.proveedor = f.proveedor;
    if (f.con_pdf === 'Sí') (query as any).con_pdf = true;
    else if (f.con_pdf === 'No') (query as any).con_pdf = false;
    if (f.con_xml === 'Sí') (query as any).con_xml = true;
    else if (f.con_xml === 'No') (query as any).con_xml = false;
    if (f.total_min) query.total_min = f.total_min;
    if (f.total_max) query.total_max = f.total_max;
    return query;
  }

  private buildRange(): { from_date?: string; to_date?: string } {
    const f = this.form.value;
    const range: { from_date?: string; to_date?: string } = {};
    if (f.fecha_desde) range.from_date = f.fecha_desde;
    if (f.fecha_hasta) range.to_date = f.fecha_hasta;
    return range;
  }

  private hasQueryOrRange(query: Partial<QuerySearchCompra>, range: { from_date?: string; to_date?: string }): boolean {
    return Object.values(query).some((v) => v !== undefined && v !== null && v !== '') || !!(range.from_date || range.to_date);
  }

  onSubmitSearch() {
    const query = this.buildQuery();
    const range = this.buildRange();
    if (!this.hasQueryOrRange(query, range)) {
      this.store.dispatch(cargarCompras({ page: 1, page_size: PAGE_SIZE_COMPRAS }));
    } else {
      this.store.dispatch(searchCompras({ query, page: 1, page_size: PAGE_SIZE_COMPRAS, ...range }));
    }
    this.filtrosOpen = false;
  }

  clearSearch() {
    this.form.reset({
      nombre: '',
      tipo_comprobante: 'Todos',
      serie: '',
      correlativo: '',
      numero_comprobante: '',
      moneda: 'Todos',
      forma_pago: 'Todos',
      proveedor: '',
      con_pdf: 'Todos',
      con_xml: 'Todos',
      fecha_desde: '',
      fecha_hasta: '',
      total_min: '',
      total_max: '',
    });
    this.store.dispatch(clearSearchCompras());
    this.store.dispatch(cargarCompras({ page: 1, page_size: PAGE_SIZE_COMPRAS }));
    this.filtrosOpen = false;
  }

  hasActiveFilters(): boolean {
    const f = this.form.value;
    const sel = (v: any) => !!v && v !== 'Todos';
    return !!(f.nombre || sel(f.tipo_comprobante) || f.serie || f.correlativo ||
              f.numero_comprobante || sel(f.moneda) || sel(f.forma_pago) ||
              sel(f.con_pdf) || sel(f.con_xml) ||
              f.proveedor || f.fecha_desde || f.fecha_hasta || f.total_min || f.total_max);
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

  getNumeroComprobante(compra: ComprobanteCompra): string {
    if (compra.numero_comprobante) return compra.numero_comprobante;
    return `${compra.serie || ''}-${compra.correlativo || ''}`;
  }

  getItemNombre(item: any): string {
    return item?.descripcion ?? item?.producto ?? 'Producto';
  }

  tienePdf(compra: ComprobanteCompra): boolean {
    if (compra.con_pdf) return true;
    return !!(compra.pdf_url || (compra as any).archivo_pdf);
  }

  tieneXml(compra: ComprobanteCompra): boolean {
    if ((compra as any).con_xml) return true;
    return !!((compra as any).xml_url || (compra as any).archivo_xml);
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
      const query = this.buildQuery();
      const range = this.buildRange();
      this.store.dispatch(searchCompras({ query, page: index + 1, page_size: PAGE_SIZE_COMPRAS, ...range }));
    } else {
      this.store.dispatch(cargarCompras({ page: index + 1, page_size: PAGE_SIZE_COMPRAS }));
    }
  }

  showCompraDetail(compra: ComprobanteCompra): void {
    this.dialogCompraDetail.open(compra).subscribe();
  }

  toggleItems(id: number): void {
    if (this.itemsExpandidos.has(id)) this.itemsExpandidos.delete(id);
    else this.itemsExpandidos.add(id);
  }

  mostrarItems(id: number): boolean {
    return this.itemsExpandidos.has(id);
  }
}
