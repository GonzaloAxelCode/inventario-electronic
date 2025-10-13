import { Venta } from '@/app/models/venta.models';
import { QuerySearchVenta } from '@/app/services/caja.service';
import { DialogVentaDetailService } from '@/app/services/dialogs-services/dialog-venta-detail.service';
import { cargarVentasTienda, clearVentaSearch, searchVenta } from '@/app/state/actions/venta.actions';
import { AppState } from '@/app/state/app.state';
import { VentaState } from '@/app/state/reducers/venta.reducer';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { selectVentaState } from '@/app/state/selectors/venta.selectors';
import { AsyncPipe, CommonModule, NgForOf, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { TuiAxes, TuiLineDaysChart } from '@taiga-ui/addon-charts';
import { TuiTable } from '@taiga-ui/addon-table';
import { tuiCountFilledControls, TuiDay, TuiDayLike, TuiDayRange } from '@taiga-ui/cdk';
import { TuiAppearance, TuiButton, TuiDataList, TuiDropdown, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge, TuiChip, TuiDataListWrapper, TuiPagination, TuiSkeleton, TuiStatus } from '@taiga-ui/kit';
import { TuiAppBar, TuiBlockStatus, TuiSearch } from '@taiga-ui/layout';
import { TuiInputDateModule, TuiInputDateRangeModule, TuiInputModule, TuiSelectModule, TuiTextareaModule, TuiTextfieldControllerModule } from "@taiga-ui/legacy";
import { BehaviorSubject, map, Observable, take } from 'rxjs';
@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    AsyncPipe,
    CommonModule,
    FormsModule,
    NgForOf,
    ReactiveFormsModule,
    RouterLink,
    TuiAppBar,
    TuiAppearance,
    TuiBadge,

    TuiBlockStatus,
    TuiButton,

    TuiChip, TuiSkeleton,
    TuiDataList,
    TuiDataListWrapper,
    TuiDropdown,

    TuiInputDateModule,
    TuiInputDateRangeModule,
    TuiInputModule,

    TuiLoader,

    TuiSearch,

    TuiSelectModule,
    TuiStatus,

    TuiTable,
    TuiTextareaModule,
    TuiTextfield,
    TuiTextfieldControllerModule,

    TuiButton,
    TuiAppearance,
    TuiTable,

    AsyncPipe,
    FormsModule,
    NgIf,
    TuiAxes,
    TuiInputDateRangeModule,
    TuiLineDaysChart, TuiPagination
  ],

  templateUrl: './ventas.component.html',

  styleUrl: './ventas.component.scss'
})

export class VentasComponent implements OnInit {
  ventasState$!: Observable<Partial<VentaState>>;
  ventas: any = []

  allColumns = [
    { key: 'fecha_hora', label: 'Fecha de Venta' },
    { key: 'metodo_pago', label: 'Método de Pago' },
  ];
  private _range = new BehaviorSubject<TuiDayRange>(
    new TuiDayRange(
      new TuiDay(2025, 0, 1),
      new TuiDay(2025, 11, 31)
    )
  );

  range$ = this._range.asObservable();


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
    console.log(newRange)


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
    let currentDate = this.range
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

    console.log(searchQuery)
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
          page: index + 1

        }))
      } else {
        let currentDate = this.range
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
}
