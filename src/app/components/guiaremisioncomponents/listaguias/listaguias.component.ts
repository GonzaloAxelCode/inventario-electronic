import { GuiaRemisionRemitente } from '@/app/models/guia-remision.models';
import { cargarGuias } from '@/app/state/actions/guia-remision.actions';
import { AppState } from '@/app/state/app.state';
import { selectGuiaRemision } from '@/app/state/selectors/guia-remision.selectors';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiBadge, TuiPagination } from '@taiga-ui/kit';
import { TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { Subject, takeUntil } from 'rxjs';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-listaguias',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    NgForOf,
    TuiBadge,
    TuiPagination,
    TuiLoader,
    FormsModule,
    TuiTextfield,
  ],
  templateUrl: './listaguias.component.html',
  styleUrl: './listaguias.component.scss',
})
export class ListaguiasComponent implements OnInit, OnDestroy {

  private store = inject(Store<AppState>);
  private destroy$ = new Subject<void>();
  private cdr = inject(ChangeDetectorRef);

  @Output() verDetalle = new EventEmitter<GuiaRemisionRemitente>();
  @Output() editarGuia = new EventEmitter<GuiaRemisionRemitente>();

  guias: GuiaRemisionRemitente[] = [];
  loading = false;
  indexPage = 0;
  lengthPages = 0;
  busqueda = '';

  ngOnInit() {
    this.store.select(selectGuiaRemision)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.guias = state.guias || [];
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

  onBuscar() {
    this.store.dispatch(cargarGuias({ page: 1, page_size: 10, busqueda: this.busqueda }));
  }

  onClearSearch() {
    this.busqueda = '';
    this.store.dispatch(cargarGuias({ page: 1, page_size: 10, busqueda: '' }));
  }

  goToPage(index: number): void {
    this.store.dispatch(cargarGuias({ page: index + 1, page_size: 10, busqueda: this.busqueda }));
  }

  formatoCorto(fecha: string): string {
    return dayjs(fecha).format('D MMM YYYY');
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'EMITIDA': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'EN_TRANSITO': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'ENTREGADA': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'ANULADA': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-300';
    }
  }

  getTotalItems(guia: GuiaRemisionRemitente): number {
    return guia.items.reduce((sum, item) => sum + item.cantidad, 0);
  }
}
