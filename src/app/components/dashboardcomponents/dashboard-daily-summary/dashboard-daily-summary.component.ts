import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { TuiLegendItem, TuiPieChart } from '@taiga-ui/addon-charts';
import { TuiHovered } from '@taiga-ui/cdk';
import { VentaService } from '@/app/services/venta.service';

@Component({
  selector: 'app-dashboard-daily-summary',
  standalone: true,
  imports: [CommonModule, TuiPieChart, TuiLegendItem, TuiHovered],
  templateUrl: './dashboard-daily-summary.component.html',
  styleUrl: './dashboard-daily-summary.component.scss'
})
export class DashboardDailySummaryComponent implements OnInit {

  private ventaService = inject(VentaService);

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

  // 2. Comparación con ayer
  vsAyer = {
    ventas: 12.5,
    transacciones: -3,
    ticket: 8.2,
    clientes: 5,
  };

  // 3. Métodos de pago de hoy
  metodosPago = [
    { nombre: 'Efectivo', monto: 1250.00, porcentaje: 43.9, color: '#10B981' },
    { nombre: 'Yape', monto: 890.50, porcentaje: 31.3, color: '#8B5CF6' },
    { nombre: 'Plin', monto: 420.00, porcentaje: 14.7, color: '#3B82F6' },
    { nombre: 'Tarjeta', monto: 287.00, porcentaje: 10.1, color: '#F59E0B' },
  ];

  // 4. Hora pico de ventas (datos de las últimas 12 horas)
  horasPico: { hora: string; monto: number }[] = [];
  maxHoras = 0;
  horaPicoLabel = '--:--';

  // 5. Ventas por categoría
  ventasPorCategoria: { nombre: string; cantidad: number; monto: number; color: string }[] = [];
  maxCategoriaMonto = 0;

  // 6. Top productos más vendidos (tabla)
  topProductos: { nombre: string; cantidad: number; total: number }[] = [];

  // 7. Últimas ventas realizadas
  ultimasVentas: { id: string; hora: string; cliente: string; total: number; metodo: string }[] = [];

  // 8. Productos con bajo stock hoy
  productosBajoStock = [
    { nombre: 'Aceite vegetal', stock: 2, minimo: 5 },
    { nombre: 'Arroz 1kg', stock: 3, minimo: 8 },
    { nombre: 'Azúcar 1kg', stock: 1, minimo: 5 },
    { nombre: 'Huevos (docena)', stock: 4, minimo: 6 },
  ];

  // 9. Resumen de alertas
  alertas = {
    criticas: 3,
    advertencias: 5,
    sinStock: 1,
  };

  // 10. Ventas anuladas hoy
  ventasAnuladas = [
    { id: '#0028', hora: '3:15 pm', cliente: 'Pedro Sánchez', total: 56.00, motivo: 'Cliente se arrepintió' },
    { id: '#0025', hora: '1:40 pm', cliente: 'Lucía Fernández', total: 32.50, motivo: 'Error en precio' },
    { id: '#0019', hora: '10:20 am', cliente: 'Jorge Mendoza', total: 18.00, motivo: 'Producto dañado' },
  ];
  totalAnuladas = 106.50;
  cantidadAnuladas = 3;

  // 11. Clientes nuevos vs recurrentes
  clientesNuevos = 0;
  clientesRecurrentes = 0;
  tasaRetencion = 0;
  donaClientesActiveIndex = NaN;
  donaClientesValue: number[] = [];
  donaClientesLabels = ['Nuevos', 'Recurrentes'];
  donaClientesColores = ['#8B5CF6', '#10B981'];

  // 12. Top productos con más descuento
  productosDescuento = [
    { nombre: 'Audífonos Bluetooth', precioOriginal: 89.90, descuento: 25, precioFinal: 67.43, cantidad: 3 },
    { nombre: 'Camiseta deportiva', precioOriginal: 45.00, descuento: 20, precioFinal: 36.00, cantidad: 5 },
    { nombre: 'Crema hidratante', precioOriginal: 32.50, descuento: 15, precioFinal: 27.63, cantidad: 4 },
    { nombre: 'Funda celular', precioOriginal: 28.00, descuento: 10, precioFinal: 25.20, cantidad: 6 },
    { nombre: 'Lápiz labial', precioOriginal: 22.00, descuento: 10, precioFinal: 19.80, cantidad: 8 },
  ];
  totalDescuentoOtorgado = 62.47;

  // 13. Margen de ganancia del día
  margenData = {
    ingresos: 2847.50,
    costoProductos: 1652.00,
    gananciaBruta: 1195.50,
    porcentajeMargen: 41.9,
  };
  margenPorCategoria = [
    { nombre: 'Bebidas', ingresos: 680, costo: 340, ganancia: 340, margen: 50.0 },
    { nombre: 'Snacks', ingresos: 320, costo: 160, ganancia: 160, margen: 50.0 },
    { nombre: 'Lácteos', ingresos: 245.50, costo: 157.00, ganancia: 88.50, margen: 36.1 },
    { nombre: 'Panadería', ingresos: 180, costo: 90, ganancia: 90, margen: 50.0 },
    { nombre: 'Limpieza', ingresos: 420, costo: 252, ganancia: 168, margen: 40.0 },
  ];

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
    this.ventaService.getDailySummary().subscribe({
      next: (data) => {
        this.totalVentas = data.total_ventas;
        this.totalTransacciones = data.comprobantes_emitidos;
        this.clientesAtendidos = data.clientes_atendidos;
        this.ticketPromedio = data.comprobantes_emitidos > 0 
          ? data.total_ventas / data.comprobantes_emitidos 
          : 0;
      },
      error: (error) => {
        console.error('Error al cargar resumen del día:', error);
      }
    });
  }

  loadDailyPaymentMethods(): void {
    this.ventaService.getDailyPaymentMethods().subscribe({
      next: (data) => {
        this.donaLabels = data.metodos_pago.map(m => m.metodo_pago);
        this.donaValue = data.metodos_pago.map(m => m.cantidad_transacciones);
      },
      error: (error) => {
        console.error('Error al cargar métodos de pago:', error);
      }
    });
  }

  loadDailyPeakHours(): void {
    this.ventaService.getDailyPeakHours().subscribe({
      next: (data) => {
        this.horasPico = data.horas.map(h => ({
          hora: h.label,
          monto: h.total_soles
        }));
        this.maxHoras = Math.max(...this.horasPico.map(h => h.monto), 1);
        this.horaPicoLabel = data.hora_pico_ventas.label;
      },
      error: (error) => {
        console.error('Error al cargar horas pico:', error);
      }
    });
  }

  loadDailyTopProducts(): void {
    this.ventaService.getDailyTopProducts().subscribe({
      next: (data) => {
        this.topProductos = data.productos.map(p => ({
          nombre: p.nombre,
          cantidad: p.cantidad_vendida,
          total: p.total_neto
        }));
      },
      error: (error) => {
        console.error('Error al cargar top productos:', error);
      }
    });
  }

  loadDailyTopCategories(): void {
    this.ventaService.getDailyTopCategories().subscribe({
      next: (data) => {
        this.ventasPorCategoria = data.categorias.map(c => ({
          nombre: c.nombre,
          cantidad: c.total_unidades,
          monto: c.ingreso_neto,
          color: c.color
        }));
        this.maxCategoriaMonto = Math.max(...this.ventasPorCategoria.map(c => c.monto), 1);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }

  loadDailyRecentSales(): void {
    this.ventaService.getDailyRecentSales().subscribe({
      next: (data) => {
        this.ultimasVentas = data.ventas_recientes.map(v => ({
          id: v.numero_comprobante,
          hora: v.hora,
          cliente: v.cliente,
          total: v.monto,
          metodo: v.metodo_pago
        }));
      },
      error: (error) => {
        console.error('Error al cargar ventas recientes:', error);
      }
    });
  }

  loadDailyCustomers(): void {
    this.ventaService.getDailyCustomers().subscribe({
      next: (data) => {
        this.clientesNuevos = data.clientes_nuevos;
        this.clientesRecurrentes = data.clientes_recurrentes;
        this.tasaRetencion = data.tasa_retencion;
        this.donaClientesValue = [data.clientes_nuevos, data.clientes_recurrentes];
      },
      error: (error) => {
        console.error('Error al cargar clientes:', error);
      }
    });
  }
}
