import { PruebastextComponent } from "@/app/components/pruebastext/pruebastext.component";
import { CanceledsalesComponent } from '@/app/components/ventascomponents/canceledsales/canceledsales.component';

import { MostsalesproductsComponent } from '@/app/components/ventascomponents/mostsalesproducts/mostsalesproducts.component';
import { TodaysaleComponent } from '@/app/components/ventascomponents/todaysale/todaysale.component';
import { TodaysalestableComponent } from '@/app/components/ventascomponents/todaysalestable/todaysalestable.component';
import { Venta } from '@/app/models/venta.models';
import { QuerySearchVenta } from '@/app/services/caja.service';
import { DialogVentaDetailService } from '@/app/services/dialogs-services/dialog-venta-detail.service';
import { cargarVentasTienda, clearVentaSearch, searchVenta } from '@/app/state/actions/venta.actions';
import { AppState } from '@/app/state/app.state';
import { VentaState } from '@/app/state/reducers/venta.reducer';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { selectVentaState } from '@/app/state/selectors/venta.selectors';
import { AsyncPipe, CommonModule, NgForOf, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { tuiCountFilledControls, TuiDay, TuiDayLike, TuiDayRange } from '@taiga-ui/cdk';
import { TuiButton, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge, TuiChip, TuiPagination, TuiSkeleton } from '@taiga-ui/kit';
import { TuiBlockStatus, TuiSearch } from '@taiga-ui/layout';
import { TuiInputDateRangeModule, TuiInputModule, TuiSelectModule } from "@taiga-ui/legacy";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import * as dayjs from 'dayjs';
import * as advancedFormat from 'dayjs/plugin/advancedFormat';
import * as localizedFormat from 'dayjs/plugin/localizedFormat';
import { BehaviorSubject, map, Observable, take } from 'rxjs';

//@ts-ignore
dayjs.extend(advancedFormat);    //@ts-ignore
dayjs.extend(localizedFormat);
dayjs.locale('es');
@Component({
  selector: 'app-listallventas',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AsyncPipe,
    NgIf,
    NgForOf,

    // taiga
    TuiButton,
    TuiBadge,
    TuiInputModule,
    TuiInputDateRangeModule,
    TuiSelectModule,
    TuiPagination,
    TuiSkeleton,
    TuiLoader,
    TuiSearch,
    TuiTextfield,
    TuiChip,
    TuiBlockStatus,
    // tus componentes
    TodaysaleComponent,
    TodaysalestableComponent,
    MostsalesproductsComponent,
    CanceledsalesComponent,
    PruebastextComponent],
  templateUrl: './listallventas.component.html',
  styleUrl: './listallventas.component.scss'
})
export class ListallventasComponent {

  ventasState$!: Observable<Partial<VentaState>>;
  ventas: any = []
  facturacionTotal = 14823.20;
  totalDescuentos = 2498.80;
  estimacionGanancia = 1482.50;
  allColumns = [

    { key: 'metodo_pago', label: 'Método de Pago' },
  ];
  private _range = new BehaviorSubject<TuiDayRange>(
    new TuiDayRange(
      new TuiDay(2025, 0, 1),
      new TuiDay(2025, 11, 31)
    )
  );
  formatoCorto(fecha: string): string {
    //@ts-ignore
    const txt = dayjs(fecha).format('D, MMM YYYY');
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  }
  range$ = this._range.asObservable();

  formatoHora12(fecha: string): string {
    //@ts-ignore
    return dayjs(fecha).format('h:mm A'); // → 8:34 PM
  }
  periodoVenta(fecha: string): string {
    //@ts-ignore
    const hora = dayjs(fecha).hour();

    if (hora < 12) return "Venta hecha en la mañana";
    if (hora < 18) return "Venta hecha en la tarde";
    return "Venta hecha en la noche";
  }
  stripDomain(url?: string): string {
    if (!url) return '';
    try {
      // Obtener solo la parte del path
      const u = new URL(url);
      let path = u.pathname + u.search + u.hash;

      // Quitar el subdirectorio "axelmovilcomprobantes" si existe
      path = path.replace(/^\/?axelmovilcomprobantes\/?/, '/');

      return "https://pub-6b79c76579594222bdd6f486ae49157e.r2.dev" + path;
    } catch {
      // Si la URL no es válida, usar regex como respaldo
      return url
        .replace(/^https?:\/\/[^\/]+/i, '') // quitar dominio
        .replace(/^\/?axelmovilcomprobantes\/?/, '/'); // quitar subcarpeta
    }
  }
  get range(): TuiDayRange {
    return this._range.value;
  }
  private readonly dialogServiceVentaDetail = inject(DialogVentaDetailService);
  filteredData: any = []
  allColumnKeys = this.allColumns.map(c => c.key);
  displayedColumns = [...this.allColumnKeys];
  tiendaUser!: number

  constructor(private fb: FormBuilder, private store: Store<AppState>) {
    this.form.reset();

  }
  ngOnInit() {
    this.store.select(selectUsersState).pipe(
      map(userState => userState.user.tienda)
    ).subscribe(tienda => {
      this.tiendaUser = tienda || 0;
    });
    this.ventasState$ = this.store.select(selectVentaState);
    this.ventasState$.subscribe(ventas => {
      this.ventas = ventas.ventas;
      this.filteredData = this.ventas;

    })
  }
  getVentaValue(venta: Venta, key: string): any {
    return venta[key as keyof Venta];
  }
  onRangeChange(newRange: TuiDayRange): void {
    // Actualizar el BehaviorSubject
    this._range.next(newRange);



  }
  formatoRelativoCapitalizado(fecha: string): string {
    const texto = formatDistanceToNow(new Date(fecha), {
      addSuffix: true,
      locale: es
    });

    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
  estados_sunat = ["Pendiente", "Aceptado", "Rechazado"]
  metodos_pago = ["YAPE", "Efectivo", "Deposito", "Plin"]
  tipoComprobantes = ["Factura", "Boleta", "Anonima"]
  tipoDocumento = ["Dni", "Ruc"]



  protected readonly form = new FormGroup({

    nombre_cliente: new FormControl(""),
    metodo_pago: new FormControl(""),
    tipo_comprobante: new FormControl(""),
    numero_comprobante: new FormControl(""),
    serie: new FormControl(""),
    numero_documento_cliente: new FormControl(""),
    tipo_documento_cliente: new FormControl(""),
    estado_sunat: new FormControl(""),
  });
  protected readonly maxLength: TuiDayLike = { month: 12 };

  protected showDialogVentaDetail(venta: Partial<Venta>): void {

    this.dialogServiceVentaDetail.open(venta).subscribe()

  }

  protected readonly count = toSignal(
    this.form.valueChanges.pipe(map(() => tuiCountFilledControls(this.form))),
    { initialValue: 0 },
  );


  clearSearch() {
    this.store.dispatch(clearVentaSearch());
  }

  onSubmitSearch() {
    const currentDate = this.range
    const searchQuery: Partial<QuerySearchVenta> = {
      metodo_pago: this.form.value.metodo_pago || "",
      tipo_comprobante: this.form.value.tipo_comprobante || "",
      from_date: [currentDate.from.year, currentDate.from.month, currentDate.from.day],
      to_date: [currentDate.to.year, currentDate.to.month, currentDate.to.day],
      serie: this.form.value.serie || "",
      nombre_cliente: this.form.value.nombre_cliente || "",
      numero_documento_cliente: this.form.value.numero_documento_cliente || "",
      tipo_documento_cliente: this.form.value.tipo_documento_cliente === "Dni" ? "1" : "6",
      estado_sunat: this.form.value.estado_sunat || "",
      numero_comprobante: this.form.value.numero_comprobante || "",
    }


    this.store.dispatch(searchVenta({
      query: searchQuery,
    }))

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


  protected goToPage(index: number): void {
    this.ventasState$?.pipe(take(1)).subscribe(state => {
      if (state?.search_ventas_found === '') {

        const initialRange = this.range;
        this.store.dispatch(cargarVentasTienda({
          from_date: [initialRange.from.year, initialRange.from.month, initialRange.from.day],
          to_date: [initialRange.to.year, initialRange.to.month, initialRange.to.day],
          page: index + 1,
          page_size: 20

        }))
      } else {
        const currentDate = this.range
        const searchQuery: Partial<QuerySearchVenta> = {
          metodo_pago: this.form.value.metodo_pago || "",
          tipo_comprobante: this.form.value.tipo_comprobante || "",
          from_date: [currentDate.from.year, currentDate.from.month, currentDate.from.day],
          to_date: [currentDate.to.year, currentDate.to.month, currentDate.to.day],
          serie: this.form.value.serie || "",
          nombre_cliente: this.form.value.nombre_cliente || "",
          numero_documento_cliente: this.form.value.numero_documento_cliente || "",
          tipo_documento_cliente: this.form.value.tipo_documento_cliente === "Dni" ? "1" : "6",
          estado_sunat: this.form.value.estado_sunat || ""
        }
        this.store.dispatch(searchVenta({ query: searchQuery, page: index + 1 }));
      }
    });
  }

  activeTab:
    | 'historial'
    | 'ventas-hoy'
    | 'ultima-venta'
    | 'anuladas-hoy'
    | 'top-productos-hoy'
    = 'historial';

  setTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
  }
}
