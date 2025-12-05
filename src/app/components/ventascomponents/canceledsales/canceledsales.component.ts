
import { Venta } from '@/app/models/venta.models';
import { DialogVentaDetailService } from '@/app/services/dialogs-services/dialog-venta-detail.service';
import { clearVentaSearch } from '@/app/state/actions/venta.actions';
import { AppState } from '@/app/state/app.state';
import { VentaState } from '@/app/state/reducers/venta.reducer';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { selectVentaState } from '@/app/state/selectors/venta.selectors';
import { AsyncPipe, CommonModule, NgForOf, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { TuiAxes, TuiLineDaysChart } from '@taiga-ui/addon-charts';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiDayLike } from '@taiga-ui/cdk';
import { TuiAppearance, TuiButton, TuiDataList, TuiDropdown, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge, TuiBlock, TuiChip, TuiDataListWrapper, TuiFade, TuiItemsWithMore, TuiPagination, TuiSkeleton, TuiStatus, TuiTab, TuiTabs, TuiTabsWithMore, TuiTile } from '@taiga-ui/kit';
import { TuiAppBar, TuiBlockDetails, TuiBlockStatus, TuiHeader, TuiNavigation, TuiSearch } from '@taiga-ui/layout';
import { TuiInputDateModule, TuiInputDateRangeModule, TuiInputModule, TuiSelectModule, TuiTextareaModule, TuiTextfieldControllerModule } from "@taiga-ui/legacy";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { map, Observable } from 'rxjs';

import * as dayjs from 'dayjs';
import * as advancedFormat from 'dayjs/plugin/advancedFormat';
import * as localizedFormat from 'dayjs/plugin/localizedFormat';
//@ts-ignore
dayjs.extend(advancedFormat);    //@ts-ignore
dayjs.extend(localizedFormat);
dayjs.locale('es');
@Component({
  selector: 'app-canceledsales',
  standalone: true,
  imports: [
    AsyncPipe, TuiItemsWithMore, TuiAppearance,
    CommonModule, TuiTabsWithMore,
    TuiIcon,
    TuiBlockStatus, TuiBlockDetails, TuiBlock, TuiTile,
    FormsModule,
    NgForOf,
    ReactiveFormsModule,
    RouterLink,
    TuiAppBar,
    TuiAppearance,
    TuiBadge,

    TuiBlockStatus,
    TuiButton,
    TuiTab,
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
    TuiFade,
    TuiNavigation, TuiHeader, TuiTabs,
    AsyncPipe,
    FormsModule,
    NgIf,
    TuiAxes,
    TuiInputDateRangeModule,
    TuiLineDaysChart, TuiPagination],
  templateUrl: './canceledsales.component.html',
  styleUrl: './canceledsales.component.scss'
})
export class CanceledsalesComponent {
  ventasState$!: Observable<Partial<VentaState>>;
  ventas: any = []
  data: any
  allColumns = [

    { key: 'metodo_pago', label: 'Método de Pago' },
  ];

  formatoCorto(fecha: string): string {
    //@ts-ignore
    const txt = dayjs(fecha).format('D, MMM YYYY');
    return txt.charAt(0).toUpperCase() + txt.slice(1);
  }


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

  private readonly dialogServiceVentaDetail = inject(DialogVentaDetailService);
  filteredData: any = []
  allColumnKeys = this.allColumns.map(c => c.key);
  displayedColumns = [...this.allColumnKeys];
  tiendaUser!: number

  constructor(private fb: FormBuilder, private store: Store<AppState>) {

  }
  ngOnInit() {

    this.store.select(selectUsersState).pipe(
      map(userState => userState.user.tienda)
    ).subscribe(tienda => {
      this.tiendaUser = tienda || 0;
    });
    this.ventasState$ = this.store.select(selectVentaState);
    this.ventasState$.subscribe(ventas => {
      const ventasToday = ventas?.ventasToday ?? [];
      this.ventas = ventasToday.filter(
        v => v.estado === 'ANULADA'
      );
      this.data = ventas.topProductoMostSales
      console.log("TOP PORDUCTOS MAS VENDOD", ventas.topProductoMostSales)
      this.filteredData = ventasToday.filter(
        v => v.estado === 'ANULADA'
      );
    });
  }
  getVentaValue(venta: Venta, key: string): any {
    return venta[key as keyof Venta];
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


  protected readonly maxLength: TuiDayLike = { month: 12 };

  protected showDialogVentaDetail(venta: Partial<Venta>): void {

    this.dialogServiceVentaDetail.open(venta).subscribe()

  }


  clearSearch() {
    this.store.dispatch(clearVentaSearch());
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
