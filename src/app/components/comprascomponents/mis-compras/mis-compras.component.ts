import { ComprobanteCompra } from '@/app/models/compra.models';
import { tienePermiso } from '@/app/models/permissions.catalog';
import { PAGE_SIZE_COMPRAS } from '@/app/services/utils/pages-sizes';
import { CompraService } from '@/app/services/compra.service';
import { AppState } from '@/app/state/app.state';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiPagination } from '@taiga-ui/kit';
import { TuiAlertService, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { Subject, takeUntil, finalize } from 'rxjs';

@Component({
  selector: 'app-mis-compras',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiPagination,
    TuiLoader,
    TuiTextfield,
  ],
  templateUrl: './mis-compras.component.html',
  styleUrl: './mis-compras.component.scss',
})
export class MisComprasComponent implements OnInit, OnDestroy {
  private compraService = inject(CompraService);
  private alerts = inject(TuiAlertService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();
  private store = inject(Store<AppState>);

  user$ = this.store.select(selectCurrenttUser);
  tiene = tienePermiso;

  compras: ComprobanteCompra[] = [];
  loading = false;
  indexPage = 0;
  lengthPages = 0;
  totalCount = 0;
  eliminandoId: number | null = null;
  compraAEliminar: ComprobanteCompra | null = null;
  subiendo: { id: number; kind: 'pdf' | 'xml' } | null = null;

  tipoLabels: Record<string, string> = { Todos: 'Todos', '01': 'Factura', '03': 'Boleta' };

  form = new FormGroup({
    q: new FormControl(''),
    tipo_comprobante: new FormControl('Todos'),
    numero_comprobante: new FormControl(''),
  });

  ngOnInit(): void {
    this.cargar(1);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  buscar(): void {
    this.cargar(1);
  }

  limpiar(): void {
    this.form.reset({ q: '', tipo_comprobante: 'Todos', numero_comprobante: '' });
    this.cargar(1);
  }

  goToPage(index: number): void {
    this.cargar(index + 1);
  }

  pedirEliminar(compra: ComprobanteCompra): void {
    this.compraAEliminar = compra;
    this.cdr.markForCheck();
  }

  cancelarEliminar(): void {
    this.compraAEliminar = null;
    this.cdr.markForCheck();
  }

  confirmarEliminar(): void {
    const compra = this.compraAEliminar;
    if (!compra || this.eliminandoId !== null) return;
    this.compraAEliminar = null;
    this.eliminandoId = compra.id;
    this.compraService
      .eliminarCompra(compra.id)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.eliminandoId = null;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.alerts.open('Compra eliminada', { appearance: 'success' }).subscribe();
          this.cargar(this.indexPage + 1);
        },
        error: () => {
          this.alerts.open('No se pudo eliminar', { appearance: 'error' }).subscribe();
        },
      });
  }

  getTipo(tipo: string): string {
    return this.tipoLabels[tipo] ?? tipo;
  }

  pedirArchivo(c: ComprobanteCompra, kind: 'pdf' | 'xml', input: HTMLInputElement): void {
    this.subiendo = { id: c.id, kind };
    input.value = '';
    input.click();
  }

  onArchivoSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    const target = this.subiendo;
    this.subiendo = null;
    if (!file || !target) return;

    const okExt = target.kind === 'pdf' ? /\.pdf$/i.test(file.name) : /\.xml$/i.test(file.name);
    if (!okExt) {
      this.alerts.open('Archivo inválido', { label: target.kind === 'pdf' ? 'Solo PDF' : 'Solo XML', appearance: 'error' }).subscribe();
      return;
    }

    this.loading = true;
    this.cdr.markForCheck();
    this.compraService
      .subirArchivos(target.id, target.kind === 'pdf' ? { pdf: file } : { xml: file })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: () => {
          this.alerts.open('Archivos actualizados', { appearance: 'success' }).subscribe();
          this.cargar(this.indexPage + 1);
        },
        error: (err) => {
          this.alerts.open('No se pudo subir', { label: err?.error?.error || err?.error?.detalle || '', appearance: 'error' }).subscribe();
        },
      });
  }

  trackById(_index: number, c: ComprobanteCompra): number {
    return c.id;
  }

  private cargar(page: number): void {
    this.loading = true;
    const f = this.form.value;
    this.compraService
      .getCompras(page, PAGE_SIZE_COMPRAS, {
        q: f.q || undefined,
        tipo_comprobante: f.tipo_comprobante && f.tipo_comprobante !== 'Todos' ? f.tipo_comprobante : undefined,
        numero_comprobante: f.numero_comprobante || undefined,
      })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (res) => {
          this.compras = res.results;
          this.totalCount = res.count;
          this.indexPage = res.index_page ?? page - 1;
          this.lengthPages = res.length_pages ?? 0;
          this.cdr.markForCheck();
        },
        error: () => {
          this.compras = [];
          this.cdr.markForCheck();
        },
      });
  }
}
