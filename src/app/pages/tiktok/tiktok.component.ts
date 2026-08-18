import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TuiBadge, TuiTab, TuiTabs } from '@taiga-ui/kit';
import { TuiButton, TuiIcon } from '@taiga-ui/core';
import { TuiHeader, TuiNavigation, TuiSubheaderComponent } from '@taiga-ui/layout';
import { DialogLiveService } from '../../services/dialogs-services/dialog-live.service';
import { DialogLiveSummaryService } from '../../services/dialogs-services/dialog-live-summary.service';

@Component({
  selector: 'app-tiktok',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TuiTabs,
    TuiTab,
    TuiIcon,
    TuiHeader,
    TuiNavigation,
    TuiSubheaderComponent,
    TuiButton,
    TuiBadge,
  ],
  templateUrl: './tiktok.component.html',
  styleUrl: './tiktok.component.scss',
})
export class TiktokComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private dialogLive = inject(DialogLiveService);
  private dialogSummary = inject(DialogLiveSummaryService);

  validTabs = ['lives', 'pedidos', 'envios', 'estadisticas', 'clientes'] as const;
  activeTab: string = 'lives';
  activeTabIndex = 0;

  searchTerm = '';

  lives = [
    { id: 1, titulo: 'Funda iPhone 15 Pro Max - Oferta Flash', fecha: '2026-08-16', hora: '20:00', duracion: '2h 15min', estado: 'finalizado', espectadores: 342, ventas: 28, ingresos: 896.00 },
    { id: 2, titulo: 'Mica Templada Galaxy S24 Ultra', fecha: '2026-08-14', hora: '19:30', duracion: '1h 45min', estado: 'finalizado', espectadores: 218, ventas: 19, ingresos: 456.00 },
    { id: 3, titulo: 'Auriculares Bluetooth Pro - Edicion Limitada', fecha: '2026-08-12', hora: '21:00', duracion: '2h 30min', estado: 'finalizado', espectadores: 456, ventas: 41, ingresos: 2049.50 },
    { id: 4, titulo: 'Cable USB-C Ultra Rapido 100W', fecha: '2026-08-10', hora: '18:00', duracion: '1h 20min', estado: 'finalizado', espectadores: 189, ventas: 15, ingresos: 375.00 },
    { id: 5, titulo: 'Soporte Telefonico Universal + Ring Light', fecha: '2026-08-08', hora: '20:30', duracion: '1h 50min', estado: 'finalizado', espectadores: 275, ventas: 22, ingresos: 660.00 },
    { id: 6, titulo: 'Kit Limpieza Premium para Celulares', fecha: '2026-08-06', hora: '19:00', duracion: '1h 10min', estado: 'finalizado', espectadores: 164, ventas: 12, ingresos: 216.00 },
    { id: 7, titulo: 'Powerbank 20000mAh Carga Rapida', fecha: '2026-08-17', hora: '20:00', duracion: 'EN VIVO', estado: 'en_vivo', espectadores: 89, ventas: 0, ingresos: 0 },
  ];

  pedidos = [
    { id: 'TK-2001', cliente: 'Maria Lopez', dni: '45123678', fecha: '2026-08-16', producto: 'Funda iPhone 15 Pro Max', cantidad: 2, precio: 45.00, total: 90.00, estado: 'pagado', live: 'Funda iPhone 15 Pro Max - Oferta Flash' },
    { id: 'TK-2002', cliente: 'Carlos Ramirez', dni: '71234569', fecha: '2026-08-16', producto: 'Mica Templada iPhone 15', cantidad: 3, precio: 18.00, total: 54.00, estado: 'pagado', live: 'Funda iPhone 15 Pro Max - Oferta Flash' },
    { id: 'TK-2003', cliente: 'Ana Gutierrez', dni: '10234578', fecha: '2026-08-16', producto: 'Funda Silicone MagSafe', cantidad: 1, precio: 52.00, total: 52.00, estado: 'pagado', live: 'Funda iPhone 15 Pro Max - Oferta Flash' },
    { id: 'TK-2004', cliente: 'Pedro Sanchez', dni: '46123987', fecha: '2026-08-14', producto: 'Mica Templada Galaxy S24 Ultra', cantidad: 2, precio: 24.00, total: 48.00, estado: 'enviado', live: 'Mica Templada Galaxy S24 Ultra' },
    { id: 'TK-2005', cliente: 'Lucia Fernandez', dni: '40123456', fecha: '2026-08-14', producto: 'Mica Templada Galaxy S24', cantidad: 1, precio: 22.00, total: 22.00, estado: 'enviado', live: 'Mica Templada Galaxy S24 Ultra' },
    { id: 'TK-2006', cliente: 'Jorge Mendoza', dni: '42123876', fecha: '2026-08-12', producto: 'Auriculares Bluetooth Pro', cantidad: 1, precio: 49.90, total: 49.90, estado: 'entregado', live: 'Auriculares Bluetooth Pro - Edicion Limitada' },
    { id: 'TK-2007', cliente: 'Sofia Torres', dni: '70123456', fecha: '2026-08-12', producto: 'Auriculares Bluetooth Pro', cantidad: 2, precio: 49.90, total: 99.80, estado: 'entregado', live: 'Auriculares Bluetooth Pro - Edicion Limitada' },
    { id: 'TK-2008', cliente: 'Diego Castillo', dni: '45123111', fecha: '2026-08-10', producto: 'Cable USB-C Ultra Rapido 100W', cantidad: 3, precio: 25.00, total: 75.00, estado: 'entregado', live: 'Cable USB-C Ultra Rapido 100W' },
    { id: 'TK-2009', cliente: 'Valentina Rojas', dni: '41123999', fecha: '2026-08-17', producto: 'Funda iPhone 15 Pro Max', cantidad: 1, precio: 45.00, total: 45.00, estado: 'pendiente', live: 'Powerbank 20000mAh Carga Rapida' },
    { id: 'TK-2010', cliente: 'Andres Vargas', dni: '44123555', fecha: '2026-08-17', producto: 'Mica Templada iPhone 15 Pro', cantidad: 2, precio: 20.00, total: 40.00, estado: 'pendiente', live: 'Powerbank 20000mAh Carga Rapida' },
  ];

  envios = [
    { id: 'SH-8001', pedido: 'TK-2004', cliente: 'Pedro Sanchez', distrito: 'San Isidro', provincia: 'Lima', destino: 'Av. Javier Prado Este 1234, San Isidro', transportista: 'Shalom', estado: 'en_camino', fechaEnvio: '2026-08-15', fechaEstimada: '2026-08-18', tracking: 'SH-PE-20260815-001' },
    { id: 'SH-8002', pedido: 'TK-2005', cliente: 'Lucia Fernandez', distrito: 'Miraflores', provincia: 'Lima', destino: 'Calle Larco 456, Miraflores', transportista: 'Shalom', estado: 'en_camino', fechaEnvio: '2026-08-15', fechaEstimada: '2026-08-18', tracking: 'SH-PE-20260815-002' },
    { id: 'SH-8003', pedido: 'TK-2006', cliente: 'Jorge Mendoza', distrito: 'Ate', provincia: 'Lima', destino: 'Av. Municipal 789, Ate', transportista: 'Shalom', estado: 'entregado', fechaEnvio: '2026-08-13', fechaEstimada: '2026-08-16', tracking: 'SH-PE-20260813-003' },
    { id: 'SH-8004', pedido: 'TK-2007', cliente: 'Sofia Torres', distrito: 'Surco', provincia: 'Lima', destino: 'Calle Los Frescos 321, Surco', transportista: 'Shalom', estado: 'entregado', fechaEnvio: '2026-08-13', fechaEstimada: '2026-08-16', tracking: 'SH-PE-20260813-004' },
    { id: 'SH-8005', pedido: 'TK-2008', cliente: 'Diego Castillo', distrito: 'Independencia', provincia: 'Lima', destino: 'Av. Tupa Amaru 654, Independencia', transportista: 'Shalom', estado: 'entregado', fechaEnvio: '2026-08-11', fechaEstimada: '2026-08-14', tracking: 'SH-PE-20260811-005' },
    { id: 'SH-8006', pedido: 'TK-2002', cliente: 'Carlos Ramirez', distrito: 'Callao', provincia: 'Callao', destino: 'Calle San Martin 987, Callao', transportista: 'Shalom', estado: 'pendiente', fechaEnvio: '', fechaEstimada: '2026-08-20', tracking: '' },
    { id: 'SH-8007', pedido: 'TK-2003', cliente: 'Ana Gutierrez', distrito: 'Cercado de Lima', provincia: 'Lima', destino: 'Jr. de la Union 147, Cercado', transportista: 'Shalom', estado: 'pendiente', fechaEnvio: '', fechaEstimada: '2026-08-20', tracking: '' },
    { id: 'SH-8008', pedido: 'TK-2001', cliente: 'Maria Lopez', distrito: 'La Molina', provincia: 'Lima', destino: 'Av. La Molina 258, La Molina', transportista: 'Shalom', estado: 'pendiente', fechaEnvio: '', fechaEstimada: '2026-08-21', tracking: '' },
    { id: 'SH-8009', pedido: 'TK-2009', cliente: 'Valentina Rojas', distrito: 'Comas', provincia: 'Lima', destino: 'Av. Universitaria 369, Comas', transportista: 'Shalom', estado: 'pendiente', fechaEnvio: '', fechaEstimada: '2026-08-22', tracking: '' },
    { id: 'SH-8010', pedido: 'TK-2010', cliente: 'Andres Vargas', distrito: 'San Juan de Lurigancho', provincia: 'Lima', destino: 'Av. Próceres 741, SJL', transportista: 'Shalom', estado: 'pendiente', fechaEnvio: '', fechaEstimada: '2026-08-22', tracking: '' },
    { id: 'SH-8011', pedido: 'TK-2009', cliente: 'Valentina Rojas', distrito: 'Los Olivos', provincia: 'Lima', destino: 'Calle Gran Chimu 852, Los Olivos', transportista: 'Shalom', estado: 'en_camino', fechaEnvio: '2026-08-16', fechaEstimada: '2026-08-19', tracking: 'SH-PE-20260816-006' },
    { id: 'SH-8012', pedido: 'TK-2010', cliente: 'Andres Vargas', distrito: 'Villa Maria del Triunfo', provincia: 'Lima', destino: 'Av. Separadora Industrial 963, VMT', transportista: 'Shalom', estado: 'en_camino', fechaEnvio: '2026-08-16', fechaEstimada: '2026-08-19', tracking: 'SH-PE-20260816-007' },
  ];

  clientes = [
    { id: 1, nombre: 'Maria Lopez', tiktok: '@maria_lopez_92', compras: 5, totalGastado: 225.00, ultimaCompra: '2026-08-16', distrito: 'San Isidro', telefono: '999123456' },
    { id: 2, nombre: 'Carlos Ramirez', tiktok: '@carlosram_dev', compras: 3, totalGastado: 162.00, ultimaCompra: '2026-08-16', distrito: 'Callao', telefono: '998456789' },
    { id: 3, nombre: 'Ana Gutierrez', tiktok: '@ana_guti_shop', compras: 2, totalGastado: 104.00, ultimaCompra: '2026-08-16', distrito: 'Cercado de Lima', telefono: '997789123' },
    { id: 4, nombre: 'Pedro Sanchez', tiktok: '@pedro_san_01', compras: 4, totalGastado: 196.00, ultimaCompra: '2026-08-14', distrito: 'Ate', telefono: '996321654' },
    { id: 5, nombre: 'Lucia Fernandez', tiktok: '@lucia_fer_tech', compras: 2, totalGastado: 44.00, ultimaCompra: '2026-08-14', distrito: 'Miraflores', telefono: '995987321' },
    { id: 6, nombre: 'Jorge Mendoza', tiktok: '@jorge_mendoza', compras: 6, totalGastado: 349.40, ultimaCompra: '2026-08-12', distrito: 'Ate', telefono: '994654987' },
    { id: 7, nombre: 'Sofia Torres', tiktok: '@sofia_torres_uy', compras: 3, totalGastado: 299.40, ultimaCompra: '2026-08-12', distrito: 'Surco', telefono: '993147258' },
    { id: 8, nombre: 'Diego Castillo', tiktok: '@diego_cast_pro', compras: 8, totalGastado: 520.00, ultimaCompra: '2026-08-10', distrito: 'Independencia', telefono: '992852741' },
    { id: 9, nombre: 'Valentina Rojas', tiktok: '@valen_rojas_fit', compras: 1, totalGastado: 45.00, ultimaCompra: '2026-08-17', distrito: 'Los Olivos', telefono: '991963852' },
    { id: 10, nombre: 'Andres Vargas', tiktok: '@andres_vg_music', compras: 1, totalGastado: 40.00, ultimaCompra: '2026-08-17', distrito: 'San Juan de Lurigancho', telefono: '990741852' },
  ];

  stats = {
    ventasTotales: 154,
    ingresosTotales: 4696.50,
    livesRealizados: 6,
    clientesNuevos: 10,
    productoMasVendido: 'Funda iPhone 15 Pro Max',
    promedioVenta: 30.50,
    tasaConversion: 12.8,
    crecimientoMensual: 23.5,
  };

  ngOnInit() {
    this.route.fragment.subscribe((fragment) => {
      if (fragment && (this.validTabs as readonly string[]).includes(fragment)) {
        this.activeTab = fragment;
        this.activeTabIndex = this.validTabs.indexOf(fragment as any);
      }
    });
  }

  onTabChange(index: number) {
    this.activeTab = this.validTabs[index];
  }

  get livesActivos() {
    return this.lives.filter(l => l.estado === 'en_vivo');
  }

  get livesFinalizados() {
    return this.lives.filter(l => l.estado === 'finalizado');
  }

  get pedidosPendientes() {
    return this.pedidos.filter(p => p.estado === 'pendiente');
  }

  get enviosPendientes() {
    return this.envios.filter(e => e.estado === 'pendiente');
  }

  get enviosEnCamino() {
    return this.envios.filter(e => e.estado === 'en_camino');
  }

  filtrar<T extends Record<string, any>>(items: T[], term: string): T[] {
    if (!term.trim()) return items;
    const t = term.toLowerCase();
    return items.filter(item => Object.values(item).some(v => String(v).toLowerCase().includes(t)));
  }

  getEstadoClass(estado: string): string {
    const map: Record<string, string> = {
      'en_vivo': 'bg-red-500 text-white animate-pulse',
      'finalizado': 'bg-neutral-200 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-300',
      'pagado': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'enviado': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'entregado': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'pendiente': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      'en_camino': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    };
    return map[estado] || 'bg-neutral-100 text-neutral-600';
  }

  getEstadoLabel(estado: string): string {
    const map: Record<string, string> = {
      'en_vivo': 'EN VIVO',
      'finalizado': 'Finalizado',
      'pagado': 'Pagado',
      'enviado': 'Enviado',
      'entregado': 'Entregado',
      'pendiente': 'Pendiente',
      'en_camino': 'En Camino',
    };
    return map[estado] || estado;
  }

  contarPorEstado(items: any[], estado: string): number {
    return items.filter(i => i.estado === estado).length;
  }

  sumarCampo(items: any[], campo: string): number {
    return items.reduce((sum, i) => sum + (i[campo] || 0), 0);
  }

  promedioCampo(items: any[], campo: string): number {
    if (!items.length) return 0;
    return Math.round(items.reduce((sum, i) => sum + (i[campo] || 0), 0) / items.length);
  }

  openLiveDialog(live: any) {
    if (live.estado === 'en_vivo') {
      this.dialogLive.open(live).subscribe();
    } else {
      this.dialogSummary.open(live).subscribe();
    }
  }
}
