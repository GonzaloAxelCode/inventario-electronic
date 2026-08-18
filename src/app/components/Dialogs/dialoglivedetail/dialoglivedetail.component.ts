import { loadCategorias } from '@/app/state/actions/categoria.actions';
import { searchInventarios } from '@/app/state/actions/inventario.actions';
import { AppState } from '@/app/state/app.state';
import { selectCategoria } from '@/app/state/selectors/categoria.selectors';
import { selectInventario } from '@/app/state/selectors/inventario.selectors';
import { QuerySearchInventario } from '@/app/services/inventario.service';
import { DialogService } from '@/app/services/dialogs-services/dialog.service';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, ViewChild, TemplateRef } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiAlertService, TuiAppearance, TuiButton, TuiDataList, TuiDialogContext, TuiDialogService, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiChip, TuiDataListWrapper, TuiSelect } from '@taiga-ui/kit';
import { injectContext } from '@taiga-ui/polymorpheus';
import { map, Observable, Subject, takeUntil } from 'rxjs';

export interface Live {
  id: number;
  titulo: string;
  fecha: string;
  hora: string;
  duracion: string;
  estado: string;
  ventas: number;
  ingresos: number;
}

export interface VentaLive {
  id: string;
  cliente: string;
  productos: { nombre: string; cantidad: number; precio: number }[];
  total: number;
  metodoPago: string;
  estado: string;
  hora: string;
}

@Component({
  selector: 'app-dialoglivedetail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiButton,
    TuiTextfield,
    TuiSelect,
    TuiDataList,
    TuiDataListWrapper,
    TuiChip,
    TuiAppearance,
    TuiTitle,
  ],
  templateUrl: './dialoglivedetail.component.html',
  styleUrl: './dialoglivedetail.component.scss',
})
export class DialoglivedetailComponent implements OnInit, OnDestroy {
  protected readonly context = injectContext<TuiDialogContext<boolean, Live>>();
  public live: Live = this.context.data;
  private store = inject(Store<AppState>);
  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private alerts = inject(TuiAlertService);
  private dialogService = inject(DialogService);
  private dialogs = inject(TuiDialogService);

  @ViewChild('ganadorTpl', { static: true }) ganadorTpl!: TemplateRef<any>;

  URL_BASE = URL_BASE;

  vistaActiva: 'usuarios' | 'venta' | 'sorteos' | 'pedidosHoy' = 'usuarios';

  inventariosState$?: Observable<any>;
  selectCategorias$?: Observable<any>;
  allInventarios: any[] = [];
  inventariosToShow: any[] = [];
  selectedCategoriaId: number | null = null;
  isTheSearchWasDone = false;
  allInventariosSearch: any[] = [];
  inventariosSearchToShow: any[] = [];
  loading = false;
  hasMore = true;
  private itemsPerBatch = 20;
  private currentIndex = 0;

  protected readonly form = new FormGroup({
    nombre: new FormControl(),
  });

  busquedaCliente = '';
  clienteSeleccionado: { nombre: string; telefono: string } | null = null;

  clientes: { nombre: string; telefono: string }[] = [
    { nombre: '@maria_lopez_92', telefono: '999123456' },
    { nombre: '@carlosram_dev', telefono: '998456789' },
    { nombre: '@ana_guti_shop', telefono: '997789123' },
    { nombre: '@pedro_san_01', telefono: '996321654' },
    { nombre: '@lucia_fer_tech', telefono: '995987321' },
    { nombre: '@jorge_mendoza', telefono: '994654987' },
  ];

  ventas: VentaLive[] = [
    {
      id: 'TK-V001', cliente: '@maria_lopez_92', total: 90.00, metodoPago: 'YAPE', estado: 'pagado', hora: '20:05',
      productos: [{ nombre: 'Funda iPhone 15 Pro Max', cantidad: 2, precio: 45.00 }],
    },
    {
      id: 'TK-V002', cliente: '@carlosram_dev', total: 54.00, metodoPago: 'PLIN', estado: 'pagado', hora: '20:12',
      productos: [{ nombre: 'Mica Templada iPhone 15', cantidad: 3, precio: 18.00 }],
    },
    {
      id: 'TK-V003', cliente: '@ana_guti_shop', total: 52.00, metodoPago: 'PLIN', estado: 'pagado', hora: '20:18',
      productos: [{ nombre: 'Funda Silicone MagSafe', cantidad: 1, precio: 52.00 }],
    },
  ];

  listMetodosPago = ['YAPE', 'PLIN'];
  listFormasPago = ['Contraentrega', 'Adelanto', 'Pago 100%'];
  arrayCantidades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  ventaForm: FormGroup = this.fb.group({
    metodoPago: ['YAPE', Validators.required],
    formaPago: ['Contraentrega', Validators.required],
    nombre_cliente: [''],
    telefono_cliente: [''],
    cliente: [null],
    productos: this.fb.array([], [Validators.required, Validators.minLength(1)]),
  });

  salesTotals = { total: 0 };

  // ==================== SORTEOS ====================
  colores = ['#FF0000', '#FF7F00', '#FFD700', '#00CC00', '#00CED1', '#0000FF', '#4B0082', '#9400D3', '#FF1493', '#FF69B4'];
  isSpinning = false;
  winner: { nombre: string; telefono: string } | null = null;
  rotationAngle = 0;

  get sectorAngle(): number {
    return 360 / this.clientes.length;
  }

  get wheelGradient(): string {
    const stops: string[] = [];
    for (let i = 0; i < this.clientes.length; i++) {
      const start = i * this.sectorAngle;
      const end = start + this.sectorAngle;
      stops.push(`${this.colores[i % this.colores.length]} ${start}deg ${end}deg`);
    }
    return `conic-gradient(from 0deg, ${stops.join(', ')})`;
  }

  getTextStyle(index: number): { [key: string]: string } {
    const midAngle = index * this.sectorAngle + this.sectorAngle / 2;
    const radians = (midAngle - 90) * (Math.PI / 180);
    const radius = 36;
    const x = 50 + radius * Math.cos(radians);
    const y = 50 + radius * Math.sin(radians);
    return {
      'left': `${x}%`,
      'top': `${y}%`,
      'transform': `translate(-50%, -50%) rotate(${midAngle}deg)`,
    };
  }

  girarRuleta() {
    if (this.isSpinning || this.clientes.length === 0) return;
    this.isSpinning = true;
    this.winner = null;

    const winnerIndex = Math.floor(Math.random() * this.clientes.length);
    const sectorCenter = winnerIndex * this.sectorAngle + this.sectorAngle / 2;
    const extraDegrees = (360 - sectorCenter + 360) % 360;
    const totalRotation = 360 * 5 + extraDegrees;

    this.rotationAngle += totalRotation;

    setTimeout(() => {
      this.winner = this.clientes[winnerIndex];
      this.isSpinning = false;
      this.mostrarGanador();
    }, 4200);
  }

  mostrarGanador() {
    this.dialogs
      .open(this.ganadorTpl, {
        dismissible: true,
        label: 'Sorteo TikTok Live',
        size: 's',
        closeable: true,
      })
      .pipe(map(() => {}))
      .subscribe();
  }

  getColor(index: number): string {
    return this.colores[index % this.colores.length];
  }

  // ==================== PEDIDOS HOY ====================
  get pedidosDeHoy(): VentaLive[] {
    return this.ventas;
  }

  // ==================== INIT ====================
  ngOnInit() {
    this.store.dispatch(loadCategorias());
    this.inventariosState$ = this.store.select(selectInventario);
    this.selectCategorias$ = this.store.select(selectCategoria);

    this.store.select(selectInventario)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.allInventarios = state.inventarios || [];
        this.allInventariosSearch = state.inventarios_search || [];
        if (this.inventariosToShow.length === 0 && this.allInventarios.length > 0 && !this.isTheSearchWasDone) {
          this.loadInitialBatch();
        }
        if (this.isTheSearchWasDone && state.inventarios_search) {
          this.loadInitialSearchBatch();
        }
      });

    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.onSubmitSearch();
    });

    this.productosFormArray.valueChanges.subscribe(() => {
      this.calcularTotales();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get currentInventarios(): any[] {
    return this.isTheSearchWasDone ? this.inventariosSearchToShow : this.inventariosToShow;
  }

  get productosFormArray(): FormArray<FormGroup> {
    return this.ventaForm.get('productos') as FormArray<FormGroup>;
  }

  loadInitialBatch() {
    this.inventariosToShow = this.allInventarios.slice(0, this.itemsPerBatch);
    this.currentIndex = this.itemsPerBatch;
    this.hasMore = this.currentIndex < this.allInventarios.length;
  }

  loadInitialSearchBatch() {
    this.inventariosSearchToShow = this.allInventariosSearch.slice(0, this.itemsPerBatch);
    this.currentIndex = this.itemsPerBatch;
    this.hasMore = this.currentIndex < this.allInventariosSearch.length;
  }

  loadMore() {
    if (this.loading || !this.hasMore) return;
    this.loading = true;
    setTimeout(() => {
      const source = this.isTheSearchWasDone ? this.allInventariosSearch : this.allInventarios;
      const next = source.slice(this.currentIndex, this.currentIndex + this.itemsPerBatch);
      if (this.isTheSearchWasDone) {
        this.inventariosSearchToShow = [...this.inventariosSearchToShow, ...next];
      } else {
        this.inventariosToShow = [...this.inventariosToShow, ...next];
      }
      this.currentIndex += this.itemsPerBatch;
      this.hasMore = this.currentIndex < source.length;
      this.loading = false;
    }, 300);
  }

  onScroll() {
    this.loadMore();
  }

  onSubmitSearch() {
    const searchQuery: Partial<QuerySearchInventario> = {
      nombre: (this.form.value.nombre || '').trim(),
      categoria: this.selectedCategoriaId || 0,
    };
    this.store.dispatch(searchInventarios({ inventarios: this.allInventarios, query: searchQuery }));
    this.isTheSearchWasDone = true;
    this.currentIndex = 0;
    this.inventariosSearchToShow = [];
    this.loadInitialSearchBatch();
  }

  onCategoriaTabChange(categoriaId: number | null) {
    this.selectedCategoriaId = categoriaId;
    this.onSubmitSearch();
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }

  seleccionarCliente(cliente: { nombre: string; telefono: string }) {
    this.clienteSeleccionado = cliente;
    this.ventaForm.patchValue({
      nombre_cliente: cliente.nombre,
      telefono_cliente: cliente.telefono,
      cliente: cliente,
    });
    this.busquedaCliente = '';
  }

  get clientesFiltrados() {
    if (!this.busquedaCliente.trim()) return this.clientes;
    const t = this.busquedaCliente.toLowerCase();
    return this.clientes.filter(c =>
      c.nombre.toLowerCase().includes(t) || c.telefono.includes(t)
    );
  }

  finalizarLive() {
    this.live.estado = 'finalizado';
    this.live.duracion = new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0');
    this.context.completeWith(true);
  }

  get totalVentas() {
    return this.ventas.reduce((sum, v) => sum + v.total, 0);
  }

  showDialog() {
    this.dialogService.open().subscribe((result: any) => {
      if (!result) return;

      const productoExiste = this.productosFormArray.controls.some(
        control => control.get('inventarioId')?.value === result.id
      );

      if (productoExiste) {
        const productoControl = this.productosFormArray.controls.find(
          control => control.get('inventarioId')?.value === result.id
        );
        if (productoControl) {
          const cantidadActual = parseInt(productoControl.get('cantidad_final')?.value || '0');
          const stockDisponible = result.cantidad;
          if (cantidadActual + 1 > stockDisponible) {
            this.alerts.open('Stock insuficiente', {
              label: `No hay suficiente stock disponible. Stock actual: ${stockDisponible}`,
              appearance: 'error'
            }).subscribe();
            return;
          }
          productoControl.get('cantidad_final')?.setValue((cantidadActual + 1).toString());
        }
      } else {
        if (result.costo_venta <= 0) {
          this.alerts.open('Producto sin costo', {
            label: 'El producto no tiene costo de venta configurado.',
            appearance: 'error'
          }).subscribe();
          return;
        }
        if (result.cantidad <= 0) {
          this.alerts.open('Sin stock', {
            label: 'No hay stock disponible para este producto.',
            appearance: 'error'
          }).subscribe();
          return;
        }

        const nuevoProducto = this.fb.group({
          inventarioId: [result.id],
          cantidad_final: ['1', [Validators.required]],
          producto_nombre: [result.producto_nombre],
          producto_sku: [result.producto_sku],
          imagen_producto: [result.imagen_producto ? URL_BASE + result.imagen_producto : 'https://sublimac.com/wp-content/uploads/2017/11/default-placeholder.png'],
          nombre_categoria: [result.categoria_nombre],
          costo_venta: [result.costo_venta],
          productoId: [result.producto?.id],
          stock_actual: [result.cantidad],
          costo_original: [result.costo_venta],
        });

        this.productosFormArray.push(nuevoProducto);
      }

      this.calcularTotales();
    });
  }

  eliminarProductoForm(index: number) {
    this.productosFormArray.removeAt(index);
    this.calcularTotales();
  }

  calcularTotales() {
    let total = 0;
    this.productosFormArray.controls.forEach(control => {
      const cantidad = parseInt(control.get('cantidad_final')?.value || '0');
      const costoVenta = parseFloat(control.get('costo_original')?.value || '0');
      total += cantidad * costoVenta;
    });
    this.salesTotals = { total };
  }

  registrarPedido() {
    if (this.productosFormArray.length === 0) return;

    const ahora = new Date();
    const hora = ahora.getHours().toString().padStart(2, '0') + ':' + ahora.getMinutes().toString().padStart(2, '0');
    const cliente = this.clienteSeleccionado?.nombre || 'Cliente TikTok';

    const productosVenta = this.productosFormArray.controls.map(control => ({
      nombre: control.get('producto_nombre')?.value,
      cantidad: parseInt(control.get('cantidad_final')?.value || '0'),
      precio: parseFloat(control.get('costo_original')?.value || '0'),
    }));

    this.ventas.unshift({
      id: 'TK-V' + (3000 + this.ventas.length + 1),
      cliente,
      productos: productosVenta,
      total: this.salesTotals.total,
      metodoPago: this.ventaForm.get('metodoPago')?.value,
      estado: 'pagado',
      hora,
    });

    this.live.ventas++;
    this.live.ingresos += this.salesTotals.total;

    this.alerts.open('Pedido registrado', {
      label: `Pedido por S/ ${this.salesTotals.total.toFixed(2)} registrado correctamente`,
      appearance: 'success'
    }).subscribe();

    while (this.productosFormArray.length) {
      this.productosFormArray.removeAt(0);
    }
    this.clienteSeleccionado = null;
    this.ventaForm.patchValue({ nombre_cliente: '', telefono_cliente: '', cliente: null });
    this.calcularTotales();
  }
}
