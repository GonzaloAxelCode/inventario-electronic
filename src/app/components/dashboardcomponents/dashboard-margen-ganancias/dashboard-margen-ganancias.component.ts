import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-margen-ganancias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-margen-ganancias.component.html',
  styleUrl: './dashboard-margen-ganancias.component.scss'
})
export class DashboardMargenGananciasComponent {

  // Margen de ganancia del día
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
    { nombre: 'Limpieza', ingresos: 420, costo: 280, ganancia: 140, margen: 33.3 },
    { nombre: 'Higiene', ingresos: 350, costo: 195, ganancia: 155, margen: 44.3 },
  ];
}
