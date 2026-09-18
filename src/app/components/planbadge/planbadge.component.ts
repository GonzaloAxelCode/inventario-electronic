import { SuscripcionTiendaResponse, UsoMensualTienda } from '@/app/models/tienda.models';
import { TiendaService } from '@/app/services/tienda.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';

/**
 * Muestra el plan de una tienda (solo lectura).
 * - mode="pill": insignia compacta con el nombre del plan.
 * - mode="card": tarjeta con plan, precio, límites, características y uso del mes.
 * Usa GET /api/tiendas/<id>/planes/ (superuser o admin de esa tienda).
 */
@Component({
  selector: 'app-planbadge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planbadge.component.html',
  styleUrl: './planbadge.component.scss',
})
export class PlanbadgeComponent implements OnChanges {
  @Input() tiendaId: number | null | undefined = null;
  @Input() mode: 'pill' | 'card' = 'pill';

  data: SuscripcionTiendaResponse | null = null;
  loading = false;
  failed = false;
  private loadedFor: number | null = null;

  constructor(
    private tiendaService: TiendaService,
    private cdRef: ChangeDetectorRef,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tiendaId']) {
      this.load();
    }
  }

  load(): void {
    const id = Number(this.tiendaId);
    if (!id || Number.isNaN(id)) return;
    if (this.loadedFor === id && this.data) return;
    this.loading = true;
    this.failed = false;
    this.cdRef.markForCheck();
    this.tiendaService.getPlanYSuscripcion(id).subscribe({
      next: (data) => {
        this.data = data;
        this.loadedFor = id;
        this.loading = false;
        this.cdRef.markForCheck();
      },
      error: (err) => {
        this.loading = false;
        this.failed = true;
        console.error('planbadge load error', err);
        this.cdRef.markForCheck();
      },
    });
  }

  isIlimitado(limite: number | null | undefined): boolean {
    return Number(limite ?? 0) >= 999999;
  }

  boletasEmitidas(uso: UsoMensualTienda | null | undefined): number {
    if (!uso) return 0;
    return Number(uso.boletas_emitidas ?? (uso as any).total_boletas ?? 0);
  }

  facturasEmitidas(uso: UsoMensualTienda | null | undefined): number {
    if (!uso) return 0;
    return Number(uso.facturas_emitidas ?? (uso as any).total_facturas ?? 0);
  }

  usoMesLabel(uso: UsoMensualTienda | null | undefined): string {
    if (!uso) return '';
    if (typeof uso.mes === 'string') return uso.mes.slice(0, 7);
    if (typeof uso.mes === 'number' && uso.anio) return `${uso.mes}/${uso.anio}`;
    if (typeof uso.mes === 'number') return `${uso.mes}`;
    return '';
  }

  usoPorcentaje(usado: number | null | undefined, limite: number | null | undefined): number {
    const u = Number(usado ?? 0);
    const l = Number(limite ?? 0);
    if (!l || l <= 0) return 0;
    return Math.min(100, Math.round((u / l) * 100));
  }
}
