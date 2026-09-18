import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiDay, TuiMonth } from '@taiga-ui/cdk/date-time';
import {
  TuiError,
  TuiDataList,
  TuiLoader,
  TuiTitle,
} from '@taiga-ui/core';
import { TuiInputDateModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import {
  GananciaService,
  GananciasRangoResponse,
  TopProductosMesResponse,
} from '@/app/services/ganancia.service';

@Component({
  selector: 'app-ganancias',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TuiDataList,
    TuiError,
    TuiInputDateModule,
    TuiLoader,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiTitle,
  ],
  templateUrl: './ganancias.component.html',
  styleUrl: './ganancias.component.scss',
})
export class GananciasComponent implements OnInit {
  private gananciaService = inject(GananciaService);

  readonly meses = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  data = signal<GananciasRangoResponse | null>(null);

  // Filtros cards superiores: día puntual + mes puntual. Semana es automática (backend).
  fechaDia = signal<TuiDay | null>(TuiDay.currentLocal());
  filtroMes = signal<TuiMonth | null>(TuiMonth.currentLocal());

  mesLoading = signal<boolean>(false);
  mesError = signal<string | null>(null);
  mesData = signal<TopProductosMesResponse | null>(null);
  mes = signal<TuiMonth | null>(TuiMonth.currentLocal());

  ngOnInit(): void {
    this.cargar();
    this.cargarMes();
  }

  cargar(): void {
    this.loading.set(true);
    this.error.set(null);
    const body: { fecha?: string; month?: number; year?: number } = {};
    const dia = this.fechaDia();
    if (dia) {
      body.fecha = `${dia.year}-${String(dia.month + 1).padStart(2, '0')}-${String(dia.day).padStart(2, '0')}`;
    }
    const fm = this.filtroMes();
    if (fm) {
      body.month = fm.month;
      body.year = fm.year;
    }
    this.gananciaService.getGananciasRango(body).subscribe({
      next: (res) => {
        this.data.set(res);
        this.loading.set(false);
      },
      error: (err) => {
        const msg =
          err?.error?.detail ||
          err?.error?.message ||
          'No se pudieron cargar las ganancias.';
        this.error.set(msg);
        this.loading.set(false);
      },
    });
  }

  readonly mesesItems = [...this.meses];
  readonly yearsItems = (() => {
    const y = new Date().getFullYear();
    return [y - 2, y - 1, y, y + 1];
  })();

  // --- Filtros cards superiores ---
  onFechaDia(v: TuiDay | null): void {
    this.fechaDia.set(v);
    this.cargar();
  }

  hoyDia(): void {
    this.fechaDia.set(TuiDay.currentLocal());
    this.cargar();
  }

  fechaDiaEtiqueta(): string {
    const d = this.fechaDia();
    if (!d) return 'Elige una fecha';
    return `${String(d.day).padStart(2, '0')}/${String(d.month + 1).padStart(2, '0')}/${d.year}`;
  }

  filtroMesEtiqueta(): string {
    const m = this.filtroMes();
    return m ? this.meses[m.month] : '';
  }

  setFiltroMesEtiqueta(v: string): void {
    const i = this.meses.indexOf(String(v));
    if (i < 0) return;
    const y = this.filtroMes()?.year ?? new Date().getFullYear();
    this.filtroMes.set(new TuiMonth(y, i));
    this.cargar();
  }

  setFiltroYearSel(year: number | string): void {
    const y = Number(year);
    if (Number.isNaN(y) || y < 2000 || y > 2100) return;
    const i = this.filtroMes()?.month ?? new Date().getMonth();
    this.filtroMes.set(new TuiMonth(y, i));
    this.cargar();
  }

  mesEtiqueta(): string {
    const m = this.mes();
    return m ? this.meses[m.month] : '';
  }

  setMesEtiqueta(v: string): void {
    const i = this.meses.indexOf(String(v));
    if (i < 0) return;
    this.setMesIndex(i);
    this.cargarMes();
  }

  setMesYearSel(year: number | string): void {
    this.setMesYear(year);
    this.cargarMes();
  }

  cargarMes(): void {
    const m = this.mes();
    if (!m) {
      this.mesError.set('Selecciona un mes válido.');
      return;
    }
    this.mesLoading.set(true);
    this.mesError.set(null);
    this.gananciaService.getTopProductosMes(m.month, m.year).subscribe({
      next: (res) => {
        this.mesData.set(res);
        this.mesLoading.set(false);
      },
      error: (err) => {
        const msg =
          err?.error?.detail ||
          err?.error?.message ||
          'No se pudo cargar el top de productos del mes.';
        this.mesError.set(msg);
        this.mesLoading.set(false);
      },
    });
  }

  setMesIndex(index: number | string): void {
    const i = Number(index);
    if (Number.isNaN(i) || i < 0 || i > 11) return;
    const y = this.mes()?.year ?? new Date().getFullYear();
    this.mes.set(new TuiMonth(y, i));
  }

  setMesYear(year: number | string): void {
    const y = Number(year);
    if (Number.isNaN(y) || y < 2000 || y > 2100) return;
    const i = this.mes()?.month ?? new Date().getMonth();
    this.mes.set(new TuiMonth(y, i));
  }
}
