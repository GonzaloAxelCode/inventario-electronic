import { ComprobanteCompra } from '@/app/models/compra.models';
import { PAGE_SIZE_COMPRAS } from '@/app/services/utils/pages-sizes';
import { cargarCompras } from '@/app/state/actions/compra.actions';
import { AppState } from '@/app/state/app.state';
import { selectCompra } from '@/app/state/selectors/compra.selectors';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TuiBadge, TuiPagination } from '@taiga-ui/kit';
import { TuiBlockStatus } from '@taiga-ui/layout';
import { TuiLoader } from '@taiga-ui/core';
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
    NgIf,
    NgForOf,
    TuiBadge,
    TuiPagination,
    TuiBlockStatus,
    TuiLoader,
  ],
  templateUrl: './listallcompras.component.html',
  styleUrl: './listallcompras.component.scss'
})
export class ListallcomprasComponent implements OnInit, OnDestroy {

  private store = inject(Store<AppState>);
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);

  compras: ComprobanteCompra[] = [];
  loading = false;
  indexPage = 0;
  lengthPages = 0;

  ngOnInit() {
    this.store.select(selectCompra)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.compras = (state.comprobantes || []).map((c) => {
          let items = c.items;
          if (typeof items === 'string') {
            try { items = JSON.parse(items); } catch { items = []; }
          }
          return { ...c, items };
        });
        this.loading = !!state.loading;
        this.indexPage = state.index_page ?? 0;
        this.lengthPages = state.length_pages ?? 0;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  getProveedorNombre(proveedor: any): string {
    if (!proveedor) return 'Sin proveedor';
    if (typeof proveedor === 'string') return proveedor;
    return proveedor.nombre || 'Sin proveedor';
  }

  goToPage(index: number): void {
    this.store.dispatch(cargarCompras({ page: index + 1, page_size: PAGE_SIZE_COMPRAS }));
  }
}
