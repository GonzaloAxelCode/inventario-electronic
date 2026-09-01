import { DialogVentaDetailService } from '@/app/services/dialogs-services/dialog-venta-detail.service';
import { ClientsSalesHistoryResponse, VentaService } from '@/app/services/venta.service';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { CommonModule, Location } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TuiAppearance, TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiTabs, TuiTab } from '@taiga-ui/kit';
import { TuiHeader, TuiNavigation } from '@taiga-ui/layout';
import { Venta } from '@/app/models/venta.models';
import { catchError, of, timeout } from 'rxjs';
import * as dayjs from 'dayjs';
import { EstadisticasClientesComponent } from '@/app/components/clientescomponents/estadisticas-clientes/estadisticas-clientes.component';
import { SorteosClientesComponent } from '@/app/components/clientescomponents/sorteos-clientes/sorteos-clientes.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, TuiButton, TuiAppearance, TuiTextfield, TuiTabs, TuiTab, TuiHeader, TuiNavigation, EstadisticasClientesComponent, SorteosClientesComponent],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss'
})
export class ClientesComponent implements OnInit {
  private ventaService = inject(VentaService);
  private dialogVenta = inject(DialogVentaDetailService);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);

  URL_BASE = URL_BASE;
  validTabs = ['mis-clientes', 'estadisticas', 'sorteos'] as const;
  activeTab: 'mis-clientes' | 'estadisticas' | 'sorteos' = 'mis-clientes';

  // data
  loading = true;
  clientes: ClientsSalesHistoryResponse['clientes'] = [];
  totalClientes = 0;
  page = 1;
  pageSize = 20;
  totalPages = 1;

  search = '';
  estado: string = 'ALL';

  selected: ClientsSalesHistoryResponse['clientes'][0] | null = null;
  showMobileModal = false;
  isMobileView = false;

  ngOnInit(): void {
    this.checkMobileView();
    window.addEventListener('resize', () => this.checkMobileView());
    this.loadClientes(true);
    this.route.fragment.subscribe((fragment) => {
      if (fragment && this.isValidTab(fragment)) {
        this.activeTab = fragment as typeof this.activeTab;
        this.cdr.markForCheck();
      }
    });
  }

  setTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
    this.location.replaceState(`/app/clientes#${tab}`);
  }
  private isValidTab(tab: string): boolean {
    return (this.validTabs as readonly string[]).includes(tab);
  }

  hasVentas(c: ClientsSalesHistoryResponse['clientes'][0]): boolean {
    if (!c) return false;
    if (typeof (c as any).is_sale === 'boolean') return (c as any).is_sale;
    if (typeof (c.cliente as any)?.is_sale === 'boolean') return (c.cliente as any).is_sale;
    return (c.resumen?.total_ventas ?? 0) > 0 && (c.historial_ventas?.length ?? 0) > 0;
  }

  loadClientes(reset = false): void {
    if (reset) { this.page = 1; this.clientes = []; }
    this.loading = true;
    this.ventaService.getClientsSalesHistory({
      page: this.page,
      page_size: this.pageSize,
      search: this.search?.trim() || undefined,
      estado: this.estado !== 'ALL' ? this.estado : undefined
    }).pipe(
      timeout(12000),
      catchError(() => of({ total_clientes: 0, page: 1, page_size: 20, total_pages: 1, clientes: [] } as ClientsSalesHistoryResponse))
    ).subscribe(res => {
      this.totalClientes = res.total_clientes;
      this.totalPages = res.total_pages || 1;
      this.page = res.page;
      if (reset) this.clientes = res.clientes;
      else this.clientes = [...this.clientes, ...res.clientes];
      if (!this.selected && this.clientes.length > 0) {
        this.selected = this.clientes[0];
      } else if (this.selected) {
        const still = this.clientes.find(c => c.cliente.cliente_id === this.selected!.cliente.cliente_id);
        if (still) this.selected = still;
      }
      this.loading = false;
    });
  }

  onSearch(): void { this.loadClientes(true); }
  onClearSearch(): void { this.search = ''; this.loadClientes(true); }

  onSelect(c: typeof this.clientes[0]): void {
    this.selected = c;
    if (this.isMobileView) {
      this.showMobileModal = true;
    }
  }

  onSelectMobile(c: typeof this.clientes[0]): void {
    this.selected = c;
    this.showMobileModal = true;
  }

  closeMobileModal(): void {
    this.showMobileModal = false;
  }

  private checkMobileView(): void {
    this.isMobileView = window.innerWidth < 1024;
  }

  loadMore(): void {
    if (this.page < this.totalPages && !this.loading) {
      this.page++;
      this.loadClientes(false);
    }
  }

  getInitials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length-1][0]).toUpperCase();
    return parts[0].substring(0,2).toUpperCase();
  }
  getAvatarColor(id: number): string {
    const colors = ['#667eea','#f093fb','#4facfe','#43e97b','#fa709a','#a18cd1','#fccb90','#8ec5fc','#ff9a9e','#a3ffce'];
    return colors[(id || 0) % colors.length];
  }
  formatoCorto(fecha: string): string {
    if (!fecha) return '--';
    return dayjs(fecha).format('DD MMM YYYY');
  }
  formatoHora(fecha: string): string {
    if (!fecha) return '--';
    return dayjs(fecha).format('h:mm A');
  }
  getProductos(venta: any): any[] {
    try {
      const raw = venta?.productos_json;
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch {}
    return venta?.productos ?? [];
  }
  openVenta(v: Venta): void { this.dialogVenta.open(v as any).subscribe(); }
  trackByCliente = (_: number, c: any) => c?.cliente?.cliente_id ?? c?.cliente?.numero_documento ?? _;
  trackByVenta = (_: number, v: any) => v?.id ?? _;
}
