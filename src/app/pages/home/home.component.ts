import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
const DataModulosConfiguracion = [

  {
    title: "Dashboard",
    subtitle: "Resumen general",
    icono: "https://i.ibb.co/fv6M4G4/dashboard.png",
    link: "/dashboard",
  },
  {
    title: "Inventario",
    subtitle: "Gestión de inventario",
    icono: "https://i.ibb.co/V9X9CmL/inventario.png",
    link: "/inventario",
  },
  {
    title: "Ventas",
    subtitle: "Registra tus ventas",
    icono: "https://i.ibb.co/NndLtVy/ventas.png",
    link: "/ventas",
  },

  {
    title: "Crear Venta",
    subtitle: "Inicia una nueva venta",
    icono: "https://i.ibb.co/K0ffGrG/crear-venta.png",
    link: "/ventas/crear",
  },
  {
    title: "Productos",
    subtitle: "Gestiona los productos",
    icono: "https://i.ibb.co/85zJ6yG/caja-del-paquete.png",
    link: "/productos",
  },
  {
    title: "Proveedores",
    subtitle: "Administrar proveedores",
    icono: "https://i.ibb.co/5vgZ0fX/hombre.png",
    link: "/proveedores",
  },
  {
    title: "Tiendas",
    subtitle: "Manejo de tiendas",
    icono: "https://i.ibb.co/x7mHPgm/administracion-de-empresas.png",
    link: "/tiendas",
  },
  {
    title: "Perfil",
    subtitle: "Tu información personal",
    icono: "https://i.ibb.co/VYbMRLZ/categoria.png",
    link: "/perfil",
  },
  {
    title: "Configuración",
    subtitle: "Ajustes de la aplicación",
    icono: "https://i.ibb.co/1qsbCRb/piensa-fuera-de-la-caja.png",
    link: "/settings",
  },
  {
    title: "Reportes",
    subtitle: "Consulta reportes",
    icono: "https://i.ibb.co/0j3Y8Mc/reportes.png",
    link: "/reportes",
  },

];


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  modulos = DataModulosConfiguracion;

}
