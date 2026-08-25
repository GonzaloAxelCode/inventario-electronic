import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '@/app/state/app.state';
import { selectCliente, selectClientesFrecuentes, selectTopClientesCompra } from '@/app/state/selectors/cliente.selectors';
import { loadClientes, loadClientesFrecuentes, loadTopClientesCompra } from '@/app/state/actions/cliente.actions';
import { Cliente, ClienteFrecuente, TopClienteCompra } from '@/app/models/cliente.models';
import { TuiAppearance, TuiButton, TuiDialogService, TuiTitle } from '@taiga-ui/core';
import { map, Subject, takeUntil } from 'rxjs';

type FiltroSorteo = 'todos' | 'frecuentes' | 'top-compras';

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

@Component({
  selector: 'app-sorteos-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TuiButton, TuiAppearance, TuiTitle],
  templateUrl: './sorteos-clientes.component.html',
  styleUrl: './sorteos-clientes.component.scss'
})
export class SorteosClientesComponent implements OnInit, OnDestroy {

  private readonly dialogs = inject(TuiDialogService);
  private store = inject(Store<AppState>);
  private destroy$ = new Subject<void>();

  @ViewChild('ganadorTpl', { static: true }) ganadorTpl!: TemplateRef<any>;

  clientes: Cliente[] = [];
  allClientes: Cliente[] = [];
  clientesFrecuentes: ClienteFrecuente[] = [];
  topClientes: TopClienteCompra[] = [];

  colores = [
    '#FF0000',
    '#FF7F00',
    '#FFD700',
    '#00CC00',
    '#00CED1',
    '#0000FF',
    '#4B0082',
    '#9400D3',
    '#FF1493',
    '#FF69B4',
  ];

  isSpinning = false;
  winner: Cliente | null = null;
  rotationAngle = 0;

  // ==================== FILTROS ====================
  busquedaSorteo = '';
  filtroActivo: FiltroSorteo | null = null;
  sorteoSeleccionados: Set<number> = new Set();
  sorteoListo = false;

  // Selectores de mes/año
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;
  yearNumbers = [this.currentYear, this.currentYear - 1, this.currentYear - 2];
  monthNames = MONTH_NAMES;
  selectedMonth = this.currentMonth;
  selectedYear = this.currentYear;

  filtros = [
    { key: 'todos' as FiltroSorteo, label: 'Todos', icon: '👥' },
    { key: 'frecuentes' as FiltroSorteo, label: 'Más frecuentes', icon: '⭐' },
    { key: 'top-compras' as FiltroSorteo, label: 'Top compras', icon: '💰' },
  ];

  get sorteoParticipants(): Cliente[] {
    return this.clientes.filter(c => c.id !== undefined && this.sorteoSeleccionados.has(c.id));
  }

  get sectorAngle(): number {
    const count = this.sorteoListo ? this.sorteoParticipants.length : this.clientes.length;
    return count > 0 ? 360 / count : 360;
  }

  get wheelGradient(): string {
    const participants = this.sorteoListo ? this.sorteoParticipants : this.clientes;
    const stops: string[] = [];
    for (let i = 0; i < participants.length; i++) {
      const start = i * this.sectorAngle;
      const end = start + this.sectorAngle;
      stops.push(`${this.colores[i % this.colores.length]} ${start}deg ${end}deg`);
    }
    return `conic-gradient(from 0deg, ${stops.join(', ')})`;
  }

  getTextStyle(index: number): { [key: string]: string } {
    const midAngle = index * this.sectorAngle + this.sectorAngle / 2;
    return {
      'left': '50%',
      'top': '50%',
      'transform-origin': '0 0',
      'transform': `rotate(${midAngle}deg) translateX(20%)`,
      'white-space': 'nowrap',
    };
  }

  ngOnInit() {
    this.store.dispatch(loadClientes());
    this.dispatchMonthActions();

    this.store.select(selectCliente)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.allClientes = (state.clientes || []).filter((c: Cliente) => c.activo !== false);
        this.clientes = [...this.allClientes];
      });

    this.store.select(selectClientesFrecuentes)
      .pipe(takeUntil(this.destroy$))
      .subscribe((clientes) => {
        this.clientesFrecuentes = clientes;
      });

    this.store.select(selectTopClientesCompra)
      .pipe(takeUntil(this.destroy$))
      .subscribe((clientes) => {
        this.topClientes = clientes;
      });
  }

  private dispatchMonthActions(): void {
    this.store.dispatch(loadClientesFrecuentes({ anio: this.selectedYear, mes: this.selectedMonth }));
    this.store.dispatch(loadTopClientesCompra({ anio: this.selectedYear, mes: this.selectedMonth }));
  }

  onMonthChange(value: string): void {
    this.selectedMonth = Number(value);
    this.dispatchMonthActions();
  }

  onYearChange(value: number): void {
    this.selectedYear = value;
    this.dispatchMonthActions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSorteoUsuario(id: number) {
    if (this.sorteoListo) return;
    if (this.sorteoSeleccionados.has(id)) {
      this.sorteoSeleccionados.delete(id);
    } else {
      this.sorteoSeleccionados.add(id);
    }
    this.sorteoSeleccionados = new Set(this.sorteoSeleccionados);
  }

  isSorteoSeleccionado(id: number): boolean {
    return this.sorteoSeleccionados.has(id);
  }

  toggleTodosSorteo() {
    if (this.sorteoListo) return;
    const filtrados = this.clientesSorteoFiltrados;
    const todosSeleccionados = filtrados.every(c => c.id !== undefined && this.sorteoSeleccionados.has(c.id));
    if (todosSeleccionados) {
      filtrados.forEach(c => {
        if (c.id !== undefined) this.sorteoSeleccionados.delete(c.id);
      });
    } else {
      filtrados.forEach(c => {
        if (c.id !== undefined) this.sorteoSeleccionados.add(c.id);
      });
    }
    this.sorteoSeleccionados = new Set(this.sorteoSeleccionados);
  }

  confirmarSorteo() {
    if (this.sorteoParticipants.length < 2) return;
    this.sorteoListo = true;
    this.winner = null;
    this.rotationAngle = 0;
  }

  editarSorteo() {
    this.sorteoListo = false;
    this.winner = null;
    this.rotationAngle = 0;
    this.isSpinning = false;
  }

  get clientesSorteoFiltrados(): Cliente[] {
    let resultado = this.clientes;

    // Aplicar filtro de categoría
    if (this.filtroActivo === 'frecuentes') {
      const nombresFrecuentes = new Set(this.clientesFrecuentes.map(c => c.nombre));
      resultado = resultado.filter(c => nombresFrecuentes.has(c.fullname));
    } else if (this.filtroActivo === 'top-compras') {
      const nombresTop = new Set(this.topClientes.map(c => c.nombre));
      resultado = resultado.filter(c => nombresTop.has(c.fullname));
    }

    // Aplicar búsqueda
    if (this.busquedaSorteo.trim()) {
      const t = this.busquedaSorteo.toLowerCase();
      resultado = resultado.filter(c =>
        c.fullname.toLowerCase().includes(t) ||
        c.firstname.toLowerCase().includes(t) ||
        c.lastname.toLowerCase().includes(t) ||
        c.document.includes(t) ||
        c.phone.includes(t)
      );
    }

    return resultado;
  }

  setFiltro(filtro: FiltroSorteo) {
    if (this.filtroActivo === filtro) {
      this.filtroActivo = null;
    } else {
      this.filtroActivo = filtro;
    }
    this.sorteoSeleccionados.clear();
    this.sorteoSeleccionados = new Set(this.sorteoSeleccionados);
  }

  getFiltroCount(filtro: FiltroSorteo): number {
    if (filtro === 'todos') return this.clientes.length;
    if (filtro === 'frecuentes') return this.clientesFrecuentes.length;
    if (filtro === 'top-compras') return this.topClientes.length;
    return 0;
  }

  get todosFiltradosSeleccionados(): boolean {
    const filtrados = this.clientesSorteoFiltrados;
    return filtrados.length > 0 && filtrados.every(c => c.id !== undefined && this.sorteoSeleccionados.has(c.id));
  }

  girarRuleta() {
    const participants = this.sorteoListo ? this.sorteoParticipants : this.clientes;
    if (this.isSpinning || participants.length === 0) return;

    this.isSpinning = true;
    this.winner = null;

    const winnerIndex = Math.floor(Math.random() * participants.length);
    const sectorCenter = winnerIndex * this.sectorAngle + this.sectorAngle / 2;
    const extraDegrees = (360 - sectorCenter + 360) % 360;
    const totalRotation = 360 * 5 + extraDegrees;

    this.rotationAngle += totalRotation;

    setTimeout(() => {
      this.winner = participants[winnerIndex];
      this.isSpinning = false;
      this.mostrarGanador();
    }, 4200);
  }

  mostrarGanador() {
    this.dialogs
      .open(this.ganadorTpl, {
        dismissible: true,
        label: 'Sorteo de Clientes',
        size: 's',
        closeable: true,
      })
      .pipe(map(() => {}))
      .subscribe();
  }

  getColor(index: number): string {
    return this.colores[index % this.colores.length];
  }

  getInitial(cliente: Cliente): string {
    return cliente.firstname ? cliente.firstname.charAt(0).toUpperCase() : cliente.fullname.charAt(0).toUpperCase();
  }
}
