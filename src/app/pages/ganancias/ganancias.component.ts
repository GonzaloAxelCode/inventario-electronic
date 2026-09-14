import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Venta } from '@/app/models/venta.models';
import { VentaService } from '@/app/services/venta.service';

interface GananciaProducto {
  producto_id: number;
  nombre: string;
  unidades: number;
  ingresos: number;
  costos: number;
  ganancia: number;
  margen: number;
}

@Component({
  selector: 'app-ganancias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ganancias.component.html',
  styleUrl: './ganancias.component.scss',
})
export class GananciasComponent implements OnInit {
  private ventaService = inject(VentaService);

  loading = signal<boolean>(false);
  error = signal<string | null>(null);
  ventas = signal<Venta[]>([]);

  fromDate = signal<string>(this.firstDayOfMonth());
  toDate = signal<string>(this.today());
  searchTerm = signal<string>('');

  totalIngresos = computed(() => this.resumen().ingresos);
  totalCostos = computed(() => this.resumen().costos);
  totalGanancia = computed(() => this.resumen().ganancia);
  margenPromedio = computed(() => this.resumen().margen);
  numVentas = computed(() => this.ventasValidas().length);

  ventasValidas = computed(() => {
    return this.ventas().filter((v) => {
      const estado = (v.estado || '').toUpperCase();
      if (estado.includes('CANCEL') || estado.includes('ANUL')) return false;
      if (v.activo === false) return false;
      return true;
    });
  });

  resumen = computed(() => {
    let ingresos = 0;
    let costos = 0;
    for (const v of this.ventasValidas()) {
      for (const item of this.getItems(v)) {
        const cantidad = Number(item.cantidad ?? 0);
        const precio = Number(item.precio_unitario ?? item.valor_venta ?? item.valorUnitario ?? 0);
        const descuento = Number(item.descuento ?? 0);
        const costoUnit = Number(item.costo_original ?? 0);
        ingresos += precio * cantidad - descuento;
        costos += costoUnit * cantidad;
      }
    }
    const ganancia = ingresos - costos;
    const margen = ingresos > 0 ? (ganancia / ingresos) * 100 : 0;
    return { ingresos, costos, ganancia, margen };
  });

  porProducto = computed<GananciaProducto[]>(() => {
    const map = new Map<number | string, GananciaProducto>();
    const term = this.searchTerm().trim().toLowerCase();
    for (const v of this.ventasValidas()) {
      for (const item of this.getItems(v)) {
        const cantidad = Number(item.cantidad ?? 0);
        const precio = Number(item.precio_unitario ?? item.valor_venta ?? item.valorUnitario ?? 0);
        const descuento = Number(item.descuento ?? 0);
        const costoUnit = Number(item.costo_original ?? 0);
        const ingreso = precio * cantidad - descuento;
        const costo = costoUnit * cantidad;
        const key = item.producto ?? item.producto_nombre ?? item.descripcion ?? 's/n';
        const nombre: string = item.producto_nombre ?? item.descripcion ?? `Producto #${item.producto ?? ''}`;
        if (term && !nombre.toLowerCase().includes(term)) continue;
        const prev = map.get(key) ?? {
          producto_id: Number(item.producto ?? 0),
          nombre,
          unidades: 0,
          ingresos: 0,
          costos: 0,
          ganancia: 0,
          margen: 0,
        };
        prev.unidades += cantidad;
        prev.ingresos += ingreso;
        prev.costos += costo;
        prev.ganancia = prev.ingresos - prev.costos;
        prev.margen = prev.ingresos > 0 ? (prev.ganancia / prev.ingresos) * 100 : 0;
        if (!prev.nombre && nombre) prev.nombre = nombre;
        map.set(key, prev);
      }
    }
    return [...map.values()].sort((a, b) => b.ganancia - a.ganancia);
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    const from = this.parseDate(this.fromDate());
    const to = this.parseDate(this.toDate());
    if (!from || !to) {
      this.error.set('Rango de fechas inválido.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    // VentaService espera mes base 0 (igual que TuiDay): suma +1 internamente
    this.ventaService
      .getVentasPorTienda([from.y, from.m, from.d], [to.y, to.m, to.d], 1, 200)
      .subscribe({
        next: (res) => {
          this.ventas.set(res.results ?? []);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar las ventas para el cálculo.');
          this.loading.set(false);
        },
      });
  }

  getItems(venta: Venta): any[] {
    try {
      const raw = (venta as any)?.productos_json;
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {
      // ignorar, usar productos
    }
    return (venta as any)?.productos ?? [];
  }

  ticketPromedio(): number {
    const n = this.numVentas();
    return n > 0 ? this.totalIngresos() / n : 0;
  }

  private today(): string {
    const d = new Date();
    return this.toInput(d);
  }

  private firstDayOfMonth(): string {
    const d = new Date();
    d.setDate(1);
    return this.toInput(d);
  }

  private toInput(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private parseDate(input: string): { y: number; m: number; d: number } | null {
    const parts = input.split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    // input month es 1-12 → convertir a base 0 para el backend
    return { y: parts[0], m: parts[1] - 1, d: parts[2] };
  }
}
