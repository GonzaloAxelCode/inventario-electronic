import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { TuiLegendItem, TuiPieChart } from '@taiga-ui/addon-charts';
import { TuiHovered } from '@taiga-ui/cdk';
import { VentaService } from '@/app/services/venta.service';
import { DialogVentaDetailService } from '@/app/services/dialogs-services/dialog-venta-detail.service';
import { Venta } from '@/app/models/venta.models';
import { timeout, catchError, of } from 'rxjs';

@Component({
  selector: 'app-dashboard-daily-summary',
  standalone: true,
  imports: [CommonModule, TuiPieChart, TuiLegendItem, TuiHovered],
  templateUrl: './dashboard-daily-summary.component.html',
  styleUrl: './dashboard-daily-summary.component.scss'
})
export class DashboardDailySummaryComponent implements OnInit {

  private ventaService = inject(VentaService);
  private dialogVentaDetail = inject(DialogVentaDetailService);

  // Loading states
  loadingSummary = true;
  loadingMetodos = true;
  loadingHoras = true;
  loadingCategorias = true;
  loadingProductos = true;
  loadingVentas = true;
  loadingClientes = true;

  // Dona: Métodos de pago por cantidad
  donaActiveIndex = NaN;
  donaValue: number[] = [];
  donaLabels: string[] = [];
  donaColores = ['#10B981', '#8B5CF6', '#3B82F6', '#F59E0B'];

  // 1. Métricas principales
  totalVentas = 0;
  totalTransacciones = 0;
  ticketPromedio = 0;
  clientesAtendidos = 0;

  // 2. Métodos de pago de hoy
  metodosPago: { nombre: string; monto: number; porcentaje: number; color: string }[] = [];

  // 3. Hora pico de ventas
  horasPico: { hora: string; monto: number }[] = [];
  maxHoras = 0;
  horaPicoLabel = '--:--';

  // 4. Ventas por categoría
  ventasPorCategoria: { nombre: string; cantidad: number; monto: number; color: string }[] = [];
  maxCategoriaMonto = 0;

  // 5. Top productos más vendidos
  topProductos: { nombre: string; cantidad: number; total: number }[] = [];

  // 6. Últimas ventas realizadas
  ultimasVentas: {
    venta_id: number;
    id: string;
    hora: string;
    cliente: string;
    total: number;
    metodo: string;
    estado: string;
    fecha_hora: string;
    tipo_comprobante: string;
    tipo_documento_cliente: string;
    numero_documento_cliente: string;
    email_cliente: string;
    telefono_cliente: string;
    direccion_cliente: string;
    cantidad_productos: number;
    productos: any[];
    subtotal: number;
    gravado_total: number;
    igv_total: number;
    descuento_total: number;
    comprobante: any;
    nota_credito: any;
  }[] = [];

  // 7. Clientes nuevos vs recurrentes
  clientesNuevos = 0;
  clientesRecurrentes = 0;
  tasaRetencion = 0;
  donaClientesActiveIndex = NaN;
  donaClientesValue: number[] = [];
  donaClientesLabels = ['Nuevos', 'Recurrentes'];
  donaClientesColores = ['#8B5CF6', '#10B981'];

  getBarHeight(monto: number): number {
    const maxHeight = 110;
    return this.maxHoras > 0 ? (monto / this.maxHoras) * maxHeight : 0;
  }

  getComparisonClass(value: number): string {
    return value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  }

  isDonaActive(index: number): boolean {
    return this.donaActiveIndex === index;
  }

  onDonaHover(index: number, hovered: boolean): void {
    this.donaActiveIndex = hovered ? index : NaN;
  }

  isDonaClientesActive(index: number): boolean {
    return this.donaClientesActiveIndex === index;
  }

  onDonaClientesHover(index: number, hovered: boolean): void {
    this.donaClientesActiveIndex = hovered ? index : NaN;
  }

  ngOnInit(): void {
    this.loadDailySummary();
    this.loadDailyPaymentMethods();
    this.loadDailyPeakHours();
    this.loadDailyTopProducts();
    this.loadDailyTopCategories();
    this.loadDailyRecentSales();
    this.loadDailyCustomers();
  }

  loadDailySummary(): void {
    this.loadingSummary = true;
    this.ventaService.getDailySummary().pipe(
      timeout(10000),
      catchError(error => {
        console.error('Error al cargar resumen del día:', error);
        return of({ total_ventas: 0, comprobantes_emitidos: 0, clientes_atendidos: 0 });
      })
    ).subscribe({
      next: (data) => {
        this.totalVentas = data.total_ventas;
        this.totalTransacciones = data.comprobantes_emitidos;
        this.clientesAtendidos = data.clientes_atendidos;
        this.ticketPromedio = data.comprobantes_emitidos > 0
          ? data.total_ventas / data.comprobantes_emitidos
          : 0;
        this.loadingSummary = false;
      },
      error: () => {
        this.loadingSummary = false;
      }
    });
  }

  loadDailyPaymentMethods(): void {
    this.loadingMetodos = true;
    this.ventaService.getDailyPaymentMethods().pipe(
      timeout(10000),
      catchError(error => {
        console.error('Error al cargar métodos de pago:', error);
        return of({ metodos_pago: [] });
      })
    ).subscribe({
      next: (data) => {
        this.donaLabels = (data.metodos_pago || []).map(m => m.metodo_pago);
        this.donaValue = (data.metodos_pago || []).map(m => m.cantidad_transacciones);
        this.loadingMetodos = false;
      },
      error: () => {
        this.loadingMetodos = false;
      }
    });
  }

  loadDailyPeakHours(): void {
    this.loadingHoras = true;
    this.ventaService.getDailyPeakHours().pipe(
      timeout(10000),
      catchError(error => {
        console.error('Error al cargar horas pico:', error);
        return of({ horas: [], hora_pico_ventas: { label: '--:--' } });
      })
    ).subscribe({
      next: (data) => {
        this.horasPico = (data.horas || []).map(h => ({
          hora: h.label,
          monto: h.total_soles
        }));
        this.maxHoras = Math.max(...this.horasPico.map(h => h.monto), 1);
        this.horaPicoLabel = data.hora_pico_ventas?.label || '--:--';
        this.loadingHoras = false;
      },
      error: () => {
        this.loadingHoras = false;
      }
    });
  }

  loadDailyTopProducts(): void {
    this.loadingProductos = true;
    this.ventaService.getDailyTopProducts().pipe(
      timeout(10000),
      catchError(error => {
        console.error('Error al cargar top productos:', error);
        return of({ productos: [] });
      })
    ).subscribe({
      next: (data) => {
        this.topProductos = (data.productos || []).map(p => ({
          nombre: p.nombre,
          cantidad: p.cantidad_vendida,
          total: p.total_neto
        }));
        this.loadingProductos = false;
      },
      error: () => {
        this.loadingProductos = false;
      }
    });
  }

  loadDailyTopCategories(): void {
    this.loadingCategorias = true;
    this.ventaService.getDailyTopCategories().pipe(
      timeout(10000),
      catchError(error => {
        console.error('Error al cargar categorías:', error);
        return of({ categorias: [] });
      })
    ).subscribe({
      next: (data) => {
        this.ventasPorCategoria = (data.categorias || []).map(c => ({
          nombre: c.nombre,
          cantidad: c.total_unidades,
          monto: c.ingreso_neto,
          color: c.color
        }));
        this.maxCategoriaMonto = Math.max(...this.ventasPorCategoria.map(c => c.monto), 1);
        this.loadingCategorias = false;
      },
      error: () => {
        this.loadingCategorias = false;
      }
    });
  }

  loadDailyRecentSales(): void {
    this.loadingVentas = true;
    this.ventaService.getDailyRecentSales().pipe(
      timeout(10000),
      catchError(error => {
        console.error('Error al cargar ventas recientes:', error);
        return of({ ventas_recientes: [] });
      })
    ).subscribe({
      next: (data) => {
        this.ultimasVentas = (data.ventas_recientes || []).map((v: any) => ({
          venta_id: v.venta_id,
          id: v.numero_comprobante,
          hora: v.hora,
          cliente: v.cliente,
          total: v.monto,
          metodo: v.metodo_pago,
          estado: (v.nota_credito && v.nota_credito.nota_credito_id) ? 'ANULADA' : (v.estado || 'COMPLETADA'),
          fecha_hora: v.fecha_hora,
          tipo_comprobante: v.tipo_comprobante,
          tipo_documento_cliente: v.tipo_documento_cliente,
          numero_documento_cliente: v.numero_documento_cliente,
          email_cliente: v.email_cliente,
          telefono_cliente: v.telefono_cliente,
          direccion_cliente: v.direccion_cliente,
          cantidad_productos: v.cantidad_productos,
          productos: v.productos || [],
          subtotal: v.subtotal,
          gravado_total: v.gravado_total,
          igv_total: v.igv_total,
          descuento_total: v.descuento_total,
          comprobante: v.comprobante || null,
          nota_credito: v.nota_credito || null
        }));
        this.loadingVentas = false;
      },
      error: () => {
        this.loadingVentas = false;
      }
    });
  }

  isAnulada(venta: { nota_credito: any }): boolean {
    return venta.nota_credito !== null && venta.nota_credito !== undefined && venta.nota_credito.nota_credito_id;
  }

  openVentaDetail(venta: typeof this.ultimasVentas[0]): void {
    const ventaData: Partial<Venta> = {
      id: venta.venta_id,
      fecha_hora: venta.fecha_hora,
      metodo_pago: venta.metodo,
      estado: venta.estado,
      tipo_comprobante: venta.tipo_comprobante,
      subtotal: venta.subtotal,
      gravado_total: venta.gravado_total,
      igv_total: venta.igv_total,
      total: venta.total,
      tipo_documento_cliente: venta.tipo_documento_cliente,
      numero_documento_cliente: venta.numero_documento_cliente,
      nombre_cliente: venta.cliente,
      correo_cliente: venta.email_cliente,
      direccion_cliente: venta.direccion_cliente,
      telefono_cliente: venta.telefono_cliente,
      email_cliente: venta.email_cliente,
      productos: (venta.productos || []).map((p: any) => ({
        id: 0,
        producto: 0,
        producto_nombre: p.nombre,
        cantidad: p.cantidad,
        valor_unitario: p.precio_unitario,
        valor_venta: p.subtotal,
        base_igv: 0,
        porcentaje_igv: 0,
        igv: 0,
        tipo_afectacion_igv: '',
        total_impuestos: 0,
        precio_unitario: p.precio_unitario,
        cantidad_total_vendida: p.cantidad,
        descuento: p.descuento
      })),
      comprobante: venta.comprobante ? {
        tipo_comprobante: venta.comprobante.tipo_comprobante,
        serie: venta.comprobante.serie,
        correlativo: venta.comprobante.correlativo,
        numero: venta.comprobante.numero_comprobante,
        moneda: venta.comprobante.moneda,
        tipo_documento_cliente: venta.tipo_documento_cliente,
        numero_documento_cliente: venta.numero_documento_cliente,
        nombre_cliente: venta.cliente,
        gravadas: venta.comprobante.gravadas,
        igv: venta.comprobante.igv,
        valorVenta: venta.comprobante.valor_venta,
        sub_total: venta.comprobante.sub_total,
        total: venta.comprobante.total,
        leyenda: venta.comprobante.leyenda || '',
        estado_sunat: venta.comprobante.estado_sunat,
        xml_url: venta.comprobante.xml_url || '',
        pdf_url: venta.comprobante.pdf_url || '',
        cdr_url: venta.comprobante.cdr_url || '',
        ticket_url: venta.comprobante.ticket_url || '',
        items: [],
        descuento_total: venta.comprobante.descuento_total
      } as any : {
        tipo_comprobante: venta.tipo_comprobante,
        serie: venta.id.split('-')[0] || '',
        correlativo: venta.id.split('-')[1] || '',
        numero: venta.id,
        moneda: 'PEN',
        tipo_documento_cliente: venta.tipo_documento_cliente,
        numero_documento_cliente: venta.numero_documento_cliente,
        nombre_cliente: venta.cliente,
        gravadas: venta.gravado_total,
        igv: venta.igv_total,
        valorVenta: venta.subtotal,
        sub_total: venta.subtotal,
        total: venta.total,
        leyenda: '',
        estado_sunat: 'ACEPTADO',
        xml_url: '',
        pdf_url: '',
        cdr_url: '',
        ticket_url: '',
        items: [],
        descuento_total: venta.descuento_total
      } as any,
      comprobante_nota_credito: (venta.nota_credito && venta.nota_credito.nota_credito_id) ? {
        id: venta.nota_credito.nota_credito_id,
        serie: venta.nota_credito.serie,
        correlativo: venta.nota_credito.correlativo,
        tipo_comprobante_modifica: venta.nota_credito.tipo_comprobante_modifica,
        serie_modifica: venta.nota_credito.serie_modifica,
        correlativo_modifica: venta.nota_credito.correlativo_modifica,
        tipo_motivo: venta.nota_credito.tipo_motivo,
        motivo: venta.nota_credito.motivo,
        moneda: venta.nota_credito.moneda,
        total: venta.nota_credito.total,
        estado_sunat: venta.nota_credito.estado_sunat,
        fecha_emision: venta.nota_credito.fecha_emision,
        xml_url: venta.nota_credito.xml_url || '',
        pdf_url: venta.nota_credito.pdf_url || '',
        cdr_url: venta.nota_credito.cdr_url || ''
      } as any : null
    };
    this.dialogVentaDetail.open(ventaData).subscribe();
  }

  loadDailyCustomers(): void {
    this.loadingClientes = true;
    this.ventaService.getDailyCustomers().pipe(
      timeout(10000),
      catchError(error => {
        console.error('Error al cargar clientes:', error);
        return of({ clientes_nuevos: 0, clientes_recurrentes: 0, tasa_retencion: 0 });
      })
    ).subscribe({
      next: (data) => {
        this.clientesNuevos = data.clientes_nuevos;
        this.clientesRecurrentes = data.clientes_recurrentes;
        this.tasaRetencion = data.tasa_retencion;
        this.donaClientesValue = data.clientes_nuevos > 0 || data.clientes_recurrentes > 0
          ? [data.clientes_nuevos, data.clientes_recurrentes]
          : [];
        this.loadingClientes = false;
      },
      error: () => {
        this.loadingClientes = false;
      }
    });
  }
}
