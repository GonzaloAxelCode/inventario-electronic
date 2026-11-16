import { AppState } from '@/app/state/app.state';
import { InventarioState } from '@/app/state/reducers/inventario.reducer';
import { selectInventarioState } from '@/app/state/selectors/inventario.selectors';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiLegendItem, TuiPieChart } from '@taiga-ui/addon-charts';
import { TuiHovered } from '@taiga-ui/cdk';
import { TuiFormatNumberPipe } from '@taiga-ui/core';
import { TuiSkeleton } from '@taiga-ui/kit';
import { Observable, map } from 'rxjs';
import { GrupoResumen } from '@/app/models/inventario.models';
import { InventarioService } from '@/app/services/inventario.service';
import { RepuestoService } from '@/app/services/repuesto.service';
import { CelularService } from '@/app/services/celular.service';
import { CategoriaService } from '@/app/services/categoria.service';
import { URL_BASE } from '@/app/services/utils/endpoints';

interface TopRow {
  nombre: string;
  categoria: string;
  cantidad: number;
  imagen?: string | null;
}

interface TopCelularCosto {
  marca: string;
  modelo: string;
  color?: string | null;
  memoria?: string | null;
  costo_compra: number;
  precio_venta: number;
  disponible: boolean;
  imagen?: string | null;
}

interface LowStockProduct {
  item: { nombre: string; marca?: string | null; modelo?: string | null; imagen?: string | null };
  inventario: {
    cantidad: number;
    stock_minimo: number;
    stock_maximo: number;
    producto_nombre?: string;
    categoria_nombre?: string;
    imagen_producto?: string | null;
  };
}

const TELEFONOS_KEYWORDS = [
  'sellado', 'nuevo', 'seminuevo', 'reacondicionado',
  'celular', 'telefono', 'teléfono', 'telefonos', 'teléfonos',
  'equipo', 'equipos', 'smartphone', 'iphone', 'celulares',
];
const ACCESORIOS_KEYWORDS = [
  'funda', 'mica', 'hidrogel', 'cargador', 'cable',
  'audifono', 'audífono', 'parlante', 'smartwatch', 'correa',
  'reloj', 'accesorio', 'protector', 'case', 'vidrio',
  'templado', 'cargadores', 'cables', 'fundas', 'micas',
];
const REPUESTOS_KEYWORDS = [
  'pantalla', 'bateria', 'batería', 'pin de carga', 'pin',
  'centro de carga', 'flex', 'camara', 'cámara', 'tapa',
  'repuesto', 'repuestos', 'tactil', 'táctil', 'display',
];

function clasificarGrupo(categoriaNombre?: string | null): 'telefonos' | 'accesorios' | 'repuestos' | 'otros' {
  const nombre = (categoriaNombre || '').toLowerCase();
  if (TELEFONOS_KEYWORDS.some(k => nombre.includes(k))) return 'telefonos';
  if (REPUESTOS_KEYWORDS.some(k => nombre.includes(k))) return 'repuestos';
  if (ACCESORIOS_KEYWORDS.some(k => nombre.includes(k))) return 'accesorios';
  return 'otros';
}

function cantidadDe(p: LowStockProduct): number {
  return p.inventario.cantidad ?? 0;
}

function nuevoGrupo(): GrupoResumen {
  return { total: 0, agotados: 0, bajo_stock: 0, critico: 0, alerta_total: 0, normal: 0 };
}

@Component({
  selector: 'app-alertas-stock',
  standalone: true,
  imports: [
    CommonModule,
    TuiTable,
    TuiFormatNumberPipe,
    TuiSkeleton,
    TuiPieChart,
    TuiLegendItem,
    TuiHovered,
  ],
  templateUrl: './alertas-stock.component.html',
  styleUrl: './alertas-stock.component.scss'
})
export class AlertasStockComponent implements OnInit {
  private readonly store = inject(Store<AppState>);
  private readonly inventarioService = inject(InventarioService);
  private readonly repuestoService = inject(RepuestoService);
  private readonly celularService = inject(CelularService);
  private readonly categoriaService = inject(CategoriaService);
  selectInventario$!: Observable<InventarioState>;

  lowStockProducts: LowStockProduct[] = [];
  celularesPorMarca: Array<{ marca: string; total: number; disponibles: number }> = [];
  celularesTopCosto: TopCelularCosto[] = [];
  tipoCelularCosto: 'compra' | 'venta' = 'compra';
  repuestosTop: TopRow[] = [];
  protected readonly URL_BASE = URL_BASE;

  /** Top 10 accesorios ordenados por menor stock (cantidad asc). */
  get accesoriosTop10(): LowStockProduct[] {
    return [...(this.lowStockProducts || [])]
      .sort((a, b) => (a.inventario?.cantidad ?? 0) - (b.inventario?.cantidad ?? 0))
      .slice(0, 10);
  }

  // Una sola sección: Inventario por grupo (cards altos con alertas integradas)
  grupoAccesorios: GrupoResumen = nuevoGrupo();
  grupoTelefonos: GrupoResumen = nuevoGrupo();
  grupoRepuestos: GrupoResumen = nuevoGrupo();
  totalItems = 0;

  // Globales (para barra de salud + tabla)
  totalAgotados = 0;
  totalBajoStock = 0; // 1-3 unidades
  critico = 0;        // 1-3 unidades
  alertaTotal = 0;    // 0-3 unidades
  // Compat
  advertencia = 0;
  bajoNoCritico = 0;

  // Compat (ya no se usa ring en template)
  ringValue = [0, 0];
  ringLabels = ['Agotado (0)', 'Crítico (1-3)'];
  ringActiveIndex = NaN;

  // Ranking Accesorios (barras a todo ancho) + pies Teléfonos/Repuestos
  pieAccLabels: string[] = [];
  pieAccValues: number[] = [];
  pieTelLabels: string[] = [];
  pieTelValues: number[] = [];
  pieTelActiveIndex = NaN;
  pieRepLabels: string[] = [];
  pieRepValues: number[] = [];
  pieRepActiveIndex = NaN;
  private backendTelSet = false;
  private backendRepSet = false;
  // Todas las categorías ACCESORIO de la tienda (aunque tengan 0 productos)
  private todasCategoriasAcc: string[] = [];
  private baseAccItems: Array<{ categoria_nombre?: string }> = [];

  get maxAcc(): number {
    return this.pieAccValues.length > 0 ? Math.max(...this.pieAccValues, 1) : 1;
  }

  /** Tabla: todas las categorías ordenadas por stock (alterna asc/desc con toggleAccOrden). */
  accOrdenAsc = true;
  filtroAcc = '';

  toggleAccOrden(): void {
    this.accOrdenAsc = !this.accOrdenAsc;
  }

  get accTablaOrdenada(): Array<{ label: string; valor: number }> {
    const q = (this.filtroAcc || '').trim().toLowerCase();
    const arr = this.pieAccLabels.map((label, i) => ({ label, valor: this.pieAccValues[i] ?? 0 }));
    const filtrado = q ? arr.filter(r => r.label.toLowerCase().includes(q)) : arr;
    return filtrado.sort((a, b) => (this.accOrdenAsc ? a.valor - b.valor : b.valor - a.valor));
  }

  constructor() {}

  ngOnInit() {
    this.selectInventario$ = this.store.select(selectInventarioState);
    this.store.select(selectInventarioState).subscribe((state) => {
      const products = (state.lowStockProducts || []) as LowStockProduct[];
      this.lowStockProducts = products;
      this.calcularFallbackLocal(state);
    });

    // Fuente principal: backend /inventarios/resumen-tienda/
    this.inventarioService.fetchResumenTienda().subscribe({
      next: (res) => {
        if (res.grupos) {
          this.grupoAccesorios = res.grupos.accesorios ?? nuevoGrupo();
          this.grupoTelefonos = res.grupos.telefonos ?? nuevoGrupo();
          this.grupoRepuestos = res.grupos.repuestos ?? nuevoGrupo();
        } else {
          // Compat: backend antiguo sin "grupos" -> repartir global como fallback
          const acc = res.totales.accesorios ?? 0;
          const tel = res.totales.telefonos ?? 0;
          const rep = res.totales.repuestos ?? 0;
          this.grupoAccesorios = { ...nuevoGrupo(), total: acc };
          this.grupoTelefonos = { ...nuevoGrupo(), total: tel };
          this.grupoRepuestos = { ...nuevoGrupo(), total: rep };
        }
        this.totalItems = res.totales.total_items ?? 0;
        this.totalAgotados = res.stock.agotados ?? 0;
        this.totalBajoStock = res.stock.bajo_stock ?? 0;
        this.critico = res.stock.critico ?? this.totalBajoStock;
        this.alertaTotal = res.stock.alerta_total ?? (this.totalAgotados + this.totalBajoStock);
        this.ringValue = [this.totalAgotados, this.critico];
        // Backend manda desglose real: teléfonos por marca y repuestos por tipo
        if (Array.isArray((res as any).telefonos_por_marca) && (res as any).telefonos_por_marca.length > 0) {
          this.setPieTelDesdeBackend((res as any).telefonos_por_marca);
        }
        if (Array.isArray((res as any).repuestos_por_tipo) && (res as any).repuestos_por_tipo.length > 0) {
          this.setPieRepDesdeBackend((res as any).repuestos_por_tipo);
        }
      },
      error: () => {
        // Se mantiene el fallback local ya calculado desde el store
      }
    });

    this.cargarTopRepuestos();
    this.cargarCelularesPorMarca();
    this.cargarTopCelularesCosto();
    // Todas las categorías de la tienda para el gráfico (incluye las que tienen 0 productos)
    this.categoriaService.fetchCategorias('ACCESORIO').subscribe({
      next: (cats) => {
        this.todasCategoriasAcc = (cats || []).map(c => (c.nombre || '').trim()).filter(n => n.length > 0);
        this.aplicarTodasCategoriasAcc();
      },
      error: () => {
        this.todasCategoriasAcc = [];
      }
    });
  }

  private cargarTopRepuestos() {
    this.repuestoService.list({ page: 1, page_size: 200 } as any).subscribe({
      next: (res) => {
        const rows: TopRow[] = (res.results || []).map(r => ({
          nombre: r.nombre || 'Sin nombre',
          categoria: r.categoria_nombre || 'Sin tipo',
          cantidad: Number(r.stock ?? r.cantidad ?? 0),
          imagen: r.imagen1 || r.imagen2 || null,
        }));
        rows.sort((a, b) => a.cantidad - b.cantidad);
        this.repuestosTop = rows.slice(0, 10);
      },
      error: () => {
        this.repuestosTop = [];
      }
    });
  }

  private cargarCelularesPorMarca() {
    // Top 10 marcas: cuántos tengo y cuántos disponibles
    this.celularService.fetchPorMarca().subscribe({
      next: (res) => {
        this.celularesPorMarca = (res.por_marca || [])
          .map(m => ({
            marca: m.marca || 'Sin marca',
            total: Number(m.total ?? 0),
            disponibles: Number(m.disponibles ?? 0),
          }))
          .sort((a, b) => b.total - a.total)
          .slice(0, 10);
      },
      error: () => {
        this.celularesPorMarca = [];
      }
    });
  }

  private cargarTopCelularesCosto() {
    // Top 10 modelos más caros (ordenado en backend, desc) según tipo compra/venta
    this.celularService.fetchTopCostoCompra(this.tipoCelularCosto).subscribe({
      next: (res) => {
        const rows: TopCelularCosto[] = (res.top_costo_compra || []).map(c => ({
          marca: c.marca || 'Sin marca',
          modelo: c.modelo || 'Sin modelo',
          color: null,
          memoria: null,
          costo_compra: Number(c.costo_compra ?? 0),
          precio_venta: Number(c.precio_venta ?? 0),
          disponible: Boolean(c.disponible ?? true),
          imagen: (c as any).imagen || null,
        }));
        this.celularesTopCosto = rows.slice(0, 10);
      },
      error: () => {
        this.celularesTopCosto = [];
      }
    });
  }

  onTipoCelularCostoChange(event: Event): void {
    const v = (event.target as HTMLSelectElement).value as 'compra' | 'venta';
    if (v !== this.tipoCelularCosto) {
      this.tipoCelularCosto = v;
      this.cargarTopCelularesCosto();
    }
  }

  costoCelularMostrado(item: TopCelularCosto): number {
    return this.tipoCelularCosto === 'venta' ? (item.precio_venta ?? 0) : (item.costo_compra ?? 0);
  }

  private resolverUrlImagen(raw: string | null | undefined): string | null {
    if (!raw) return null;
    const s = String(raw).trim();
    if (!s) return null;
    if (s.startsWith('data:')) return s;
    const mediaIdx = s.indexOf('/media/');
    if (mediaIdx >= 0) return URL_BASE + s.slice(mediaIdx);
    if (s.startsWith('http')) return s;
    return URL_BASE + (s.startsWith('/') ? s : '/' + s);
  }

  private calcularFallbackLocal(state: InventarioState) {
    const products = this.lowStockProducts;
    const agotados = products.filter(p => cantidadDe(p) === 0).length;
    const bajo = products.filter(p => cantidadDe(p) >= 1 && cantidadDe(p) <= 3).length;
    if (this.alertaTotal === 0 && this.totalAgotados === 0) {
      this.totalAgotados = agotados;
      this.totalBajoStock = bajo;
      this.critico = bajo;
      this.alertaTotal = agotados + bajo;
      this.ringValue = [this.totalAgotados, this.critico];
    }

    // Grupos estimados desde el inventario completo del store (cantidad + categoria_nombre)
    const inventarios = (state as any).inventarios as Array<{ categoria_nombre?: string; cantidad?: number; producto?: number | null; producto_marca?: string | null; repuesto_tipo?: string | null }> | undefined;
    if (Array.isArray(inventarios) && inventarios.length > 0 && this.totalItems === 0) {
      const acc = nuevoGrupo();
      const tel = nuevoGrupo();
      const rep = nuevoGrupo();
      const porGrupo: Record<string, GrupoResumen> = { accesorios: acc, telefonos: tel, repuestos: rep };
      for (const inv of inventarios) {
        let g = clasificarGrupo(inv.categoria_nombre);
        // Todo inventario con producto ES accesorio (igual que el backend)
        if (g === 'otros' && inv.producto) g = 'accesorios';
        if (!(g in porGrupo)) continue;
        const grupo = porGrupo[g];
        const cantidad = inv.cantidad ?? 0;
        grupo.total++;
        if (cantidad === 0) grupo.agotados++;
        else if (cantidad >= 1 && cantidad <= 3) { grupo.bajo_stock++; grupo.critico++; }
        else grupo.normal++;
      }
      for (const grupo of Object.values(porGrupo)) {
        grupo.alerta_total = grupo.agotados + grupo.bajo_stock;
      }
      this.grupoAccesorios = acc;
      this.grupoTelefonos = tel;
      this.grupoRepuestos = rep;
      this.totalItems = acc.total + tel.total + rep.total;
    }

    // Pies por tipo con todas las categorías (usa inventario completo si hay, si no el top del store)
    // Accesorios sigue por categoria_nombre; teléfonos por marca y repuestos por tipo (ver métodos abajo)
    const baseInventarios = Array.isArray(inventarios) && inventarios.length > 0
      ? inventarios.map(i => ({ categoria_nombre: i.categoria_nombre, producto_marca: i.producto_marca, repuesto_tipo: i.repuesto_tipo }))
      : products.map(p => ({ categoria_nombre: p.inventario.categoria_nombre, producto_marca: (p.item as any)?.marca ?? null, repuesto_tipo: null }));
    this.construirPiesPorTipo(baseInventarios);
  }

  private setPieTelDesdeBackend(rows: Array<{ marca: string; total: number }>) {
    // Pie: top 6 + Otros (el pie no escala a muchas marcas)
    const sorted = [...rows].sort((a, b) => (b.total || 0) - (a.total || 0));
    const top = sorted.slice(0, 6);
    const resto = sorted.slice(6).reduce((s, r) => s + (r.total || 0), 0);
    if (resto > 0) top.push({ marca: 'Otros', total: resto });
    this.pieTelLabels = top.map(r => r.marca || 'Sin marca');
    this.pieTelValues = top.map(r => r.total || 0);
    this.backendTelSet = true;
  }

  private setPieRepDesdeBackend(rows: Array<{ tipo: string; total: number }>) {
    const sorted = [...rows].sort((a, b) => (b.total || 0) - (a.total || 0));
    const top = sorted.slice(0, 6);
    const resto = sorted.slice(6).reduce((s, r) => s + (r.total || 0), 0);
    if (resto > 0) top.push({ tipo: 'Otros', total: resto });
    this.pieRepLabels = top.map(r => r.tipo || 'Sin tipo');
    this.pieRepValues = top.map(r => r.total || 0);
    this.backendRepSet = true;
  }

  private construirPiesPorTipo(items: Array<{ categoria_nombre?: string; producto_marca?: string | null; repuesto_tipo?: string | null }>) {
    const tel = new Map<string, number>();
    const rep = new Map<string, number>();
    for (const it of items) {
      const g = clasificarGrupo(it.categoria_nombre);
      if (g === 'telefonos') {
        // Teléfonos por marca (no por categoría)
        const marca = ((it.producto_marca || '') as string).trim() || 'Sin marca';
        tel.set(marca, (tel.get(marca) || 0) + 1);
      } else if (g === 'repuestos') {
        // Repuestos por tipo (su categoría)
        const tipo = ((it.repuesto_tipo || it.categoria_nombre || 'Sin tipo') as string).trim() || 'Sin tipo';
        rep.set(tipo, (rep.get(tipo) || 0) + 1);
      }
    }
    const aTop6 = (m: Map<string, number>) => {
      // Pies: top 6 + Otros (el pie no escala)
      const arr = Array.from(m.entries()).sort((x, y) => y[1] - x[1]);
      const top = arr.slice(0, 6);
      const resto = arr.slice(6).reduce((s, [, v]) => s + v, 0);
      if (resto > 0) top.push(['Otros', resto]);
      return { labels: top.map(([k]) => k), values: top.map(([, v]) => v) };
    };
    // Accesorios: se resuelve en aplicarTodasCategoriasAcc (incluye categorías con 0)
    this.baseAccItems = items.map(i => ({ categoria_nombre: i.categoria_nombre }));
    this.aplicarTodasCategoriasAcc();
    const t = aTop6(tel);
    const r = aTop6(rep);
    // No pisar el desglose real del backend (marcas incluye Celulares, tipos incluye modelo Repuesto)
    if (!this.backendTelSet && t.labels.length > 0) {
      this.pieTelLabels = t.labels;
      this.pieTelValues = t.values;
    }
    if (!this.backendRepSet && r.labels.length > 0) {
      this.pieRepLabels = r.labels;
      this.pieRepValues = r.values;
    }
  }

  /** Accesorios por categoría con TODAS las categorías de la tienda (las de 0 productos salen en 0). */
  private aplicarTodasCategoriasAcc() {
    const conteo = new Map<string, number>();
    for (const nombre of this.todasCategoriasAcc) {
      conteo.set(nombre, 0);
    }
    for (const it of this.baseAccItems) {
      if (clasificarGrupo(it.categoria_nombre) !== 'accesorios') continue;
      const cat = (it.categoria_nombre || 'Sin categoría').trim() || 'Sin categoría';
      conteo.set(cat, (conteo.get(cat) ?? 0) + 1);
    }
    // Si aún no llegaron las categorías, mostrar lo que haya en inventario
    if (conteo.size === 0) {
      for (const it of this.baseAccItems) {
        if (clasificarGrupo(it.categoria_nombre) !== 'accesorios') continue;
        const cat = (it.categoria_nombre || 'Sin categoría').trim() || 'Sin categoría';
        conteo.set(cat, (conteo.get(cat) ?? 0) + 1);
      }
    }
    const arr = Array.from(conteo.entries()).sort((x, y) => y[1] - x[1]);
    this.pieAccLabels = arr.map(([k]) => k);
    this.pieAccValues = arr.map(([, v]) => v);
  }

  alertaPct(grupo: GrupoResumen): number {
    if (!grupo.total) return 0;
    return Math.round((grupo.alerta_total / grupo.total) * 100);
  }

  grupoPctAgotados(grupo: GrupoResumen): number {
    if (!grupo.total) return 0;
    return Math.round(((grupo.agotados ?? 0) / grupo.total) * 100);
  }

  grupoPctBajo(grupo: GrupoResumen): number {
    if (!grupo.total) return 0;
    return Math.round(((grupo.bajo_stock ?? 0) / grupo.total) * 100);
  }

  /** % de no disponibles sobre el universo real (disponibles + no disponibles). */
  grupoPctNoDisp(grupo: GrupoResumen): number {
    const base = (grupo.total ?? 0) + (grupo.no_disponibles ?? 0);
    if (!base) return 0;
    return Math.round(((grupo.no_disponibles ?? 0) / base) * 100);
  }

  imagenAccesorio(item: LowStockProduct): string | null {
    const raw = item.inventario?.imagen_producto || (item.item as any)?.imagen || null;
    return this.resolverUrlImagen(raw);
  }

  imagenRepuesto(item: TopRow): string | null {
    return this.resolverUrlImagen(item.imagen);
  }

  imagenCelular(item: TopCelularCosto): string | null {
    return this.resolverUrlImagen(item.imagen);
  }

  // --- Barra de salud: siempre visible, aunque alertaTotal sea 0 ---
  get totalNormal(): number {
    return Math.max(0, (this.totalItems ?? 0) - (this.alertaTotal ?? 0));
  }

  get saludPct(): number {
    if (!this.totalItems) return 0;
    return Math.round((this.totalNormal / this.totalItems) * 100);
  }

  get pctAgotados(): number {
    if (!this.totalItems) return 0;
    return Math.round(((this.totalAgotados ?? 0) / this.totalItems) * 100);
  }

  get pctBajo(): number {
    if (!this.totalItems) return 0;
    return Math.round(((this.totalBajoStock ?? 0) / this.totalItems) * 100);
  }

  get pctNormal(): number {
    if (!this.totalItems) return 0;
    return Math.max(0, 100 - this.pctAgotados - this.pctBajo);
  }

  get repuestosDisponibles(): number {
    const total = this.grupoRepuestos.total ?? 0;
    const agotados = this.grupoRepuestos.agotados ?? 0;
    return Math.max(0, total - agotados);
  }

  getColorClass(cantidad: number): string {
    const c = cantidad ?? 0;
    if (c === 0) {
      return 'text-red-600 bg-red-100 dark:bg-red-900/30';
    } else if (c >= 1 && c <= 3) {
      return 'text-red-500 bg-red-50 dark:bg-red-900/20';
    }
    return 'text-green-500 bg-green-50 dark:bg-green-900/20';
  }

  getEstadoLabel(cantidad: number): string {
    const c = cantidad ?? 0;
    if (c === 0) return 'Agotado';
    if (c >= 1 && c <= 3) return 'Crítico';
    return 'Normal';
  }

  isPieTelActive(index: number): boolean {
    return this.pieTelActiveIndex === index;
  }

  onPieTelHover(index: number, hovered: boolean): void {
    this.pieTelActiveIndex = hovered ? index : NaN;
  }

  isPieRepActive(index: number): boolean {
    return this.pieRepActiveIndex === index;
  }

  onPieRepHover(index: number, hovered: boolean): void {
    this.pieRepActiveIndex = hovered ? index : NaN;
  }
}
