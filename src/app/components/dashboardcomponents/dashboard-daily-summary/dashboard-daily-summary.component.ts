import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TuiLegendItem, TuiPieChart } from '@taiga-ui/addon-charts';
import { TuiHovered } from '@taiga-ui/cdk';

@Component({
  selector: 'app-dashboard-daily-summary',
  standalone: true,
  imports: [CommonModule, TuiPieChart, TuiLegendItem, TuiHovered],
  templateUrl: './dashboard-daily-summary.component.html',
  styleUrl: './dashboard-daily-summary.component.scss'
})
export class DashboardDailySummaryComponent {

  // Dona: Métodos de pago por cantidad
  donaActiveIndex = NaN;
  donaValue = [15, 10, 6, 3];
  donaLabels = ['Efectivo', 'Yape', 'Plin', 'Tarjeta'];
  donaColores = ['#10B981', '#8B5CF6', '#3B82F6', '#F59E0B'];

  // 1. Métricas principales
  totalVentas = 2847.50;
  totalTransacciones = 34;
  ticketPromedio = 83.75;
  clientesAtendidos = 28;

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
  horasPico = [
    { hora: '8am', ventas: 3 },
    { hora: '9am', ventas: 5 },
    { hora: '10am', ventas: 8 },
    { hora: '11am', ventas: 12 },
    { hora: '12pm', ventas: 15 },
    { hora: '1pm', ventas: 11 },
    { hora: '2pm', ventas: 9 },
    { hora: '3pm', ventas: 6 },
    { hora: '4pm', ventas: 4 },
    { hora: '5pm', ventas: 7 },
    { hora: '6pm', ventas: 10 },
    { hora: '7pm', ventas: 6 },
  ];
  maxHoras = 15;

  // 5. Ventas por categoría
  ventasPorCategoria = [
    { nombre: 'Bebidas', cantidad: 12, monto: 680.00 },
    { nombre: 'Snacks', cantidad: 9, monto: 320.00 },
    { nombre: 'Lácteos', cantidad: 6, monto: 245.50 },
    { nombre: 'Panadería', cantidad: 4, monto: 180.00 },
    { nombre: 'Limpieza', cantidad: 3, monto: 420.00 },
  ];

  // 6. Top 5 productos más vendidos (tabla)
  topProductos = [
    { nombre: 'Gaseosa 600ml', cantidad: 8, precio: 3.50, total: 28.00 },
    { nombre: 'Pan integral', cantidad: 6, precio: 2.80, total: 16.80 },
    { nombre: 'Leche 1L', cantidad: 5, precio: 4.20, total: 21.00 },
    { nombre: "Papa Lay's", cantidad: 5, precio: 3.00, total: 15.00 },
    { nombre: 'Jabón líquido', cantidad: 4, precio: 8.50, total: 34.00 },
  ];

  // 7. Últimas ventas realizadas
  ultimasVentas = [
    { id: '#0034', hora: '6:45 pm', cliente: 'María López', total: 42.50, metodo: 'Yape' },
    { id: '#0033', hora: '6:32 pm', cliente: 'Carlos Ruiz', total: 18.00, metodo: 'Efectivo' },
    { id: '#0032', hora: '6:15 pm', cliente: 'Ana García', total: 67.30, metodo: 'Plin' },
    { id: '#0031', hora: '5:58 pm', cliente: 'Luis Torres', total: 25.00, metodo: 'Efectivo' },
    { id: '#0030', hora: '5:40 pm', cliente: 'Rosa Martínez', total: 89.90, metodo: 'Tarjeta' },
  ];

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
  clientesNuevos = 8;
  clientesRecurrentes = 20;
  donaClientesActiveIndex = NaN;
  donaClientesValue = [8, 20];
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

  getBarHeight(ventas: number): number {
    return this.maxHoras > 0 ? (ventas / this.maxHoras) * 100 : 0;
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
}
