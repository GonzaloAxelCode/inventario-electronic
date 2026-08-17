import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TuiAxes, TuiBarChart } from '@taiga-ui/addon-charts';
import { TuiHint } from '@taiga-ui/core';

@Component({
  selector: 'app-estadisticas-clientes',
  standalone: true,
  imports: [CommonModule, TuiAxes, TuiBarChart, TuiHint],
  templateUrl: './estadisticas-clientes.component.html',
  styleUrl: './estadisticas-clientes.component.scss'
})
export class EstadisticasClientesComponent {

  // Datos de ejemplo - Clientes más frecuentes (top 5)
  clientesFrecuentes = [
    { nombre: 'Juan Pérez', compras: 24, total: 1580.50 },
    { nombre: 'María García', compras: 18, total: 1120.00 },
    { nombre: 'Carlos López', compras: 15, total: 890.75 },
    { nombre: 'Ana Martínez', compras: 12, total: 750.25 },
    { nombre: 'Pedro Sánchez', compras: 10, total: 620.00 },
  ];

  // Datos de ejemplo - Clientes que más compraron (monto total)
  clientesMonto = [
    { nombre: 'Juan Pérez', total: 1580.50 },
    { nombre: 'María García', total: 1120.00 },
    { nombre: 'Carlos López', total: 890.75 },
    { nombre: 'Ana Martínez', total: 750.25 },
    { nombre: 'Pedro Sánchez', total: 620.00 },
  ];

  // Datos para gráfico de barras - Nuevos clientes por mes
  nuevosClientesMes = [
    { mes: 'Ene', cantidad: 15 },
    { mes: 'Feb', cantidad: 22 },
    { mes: 'Mar', cantidad: 18 },
    { mes: 'Abr', cantidad: 25 },
    { mes: 'May', cantidad: 30 },
    { mes: 'Jun', cantidad: 28 },
  ];

  // Total de nuevos clientes
  totalNuevosClientesMes = this.nuevosClientesMes.reduce((sum, item) => sum + item.cantidad, 0);
}
