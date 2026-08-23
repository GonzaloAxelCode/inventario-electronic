import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AppState } from '@/app/state/app.state';
import { selectCliente } from '@/app/state/selectors/cliente.selectors';
import { loadClientes } from '@/app/state/actions/cliente.actions';
import { Cliente } from '@/app/models/cliente.models';
import { TuiAppearance, TuiButton, TuiDialogService, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { map, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-sorteos-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TuiButton, TuiAppearance, TuiTitle, TuiTextfield],
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

  // ==================== SORTEOS (igual que TikTok) ====================
  busquedaSorteo = '';
  sorteoSeleccionados: Set<number> = new Set();
  sorteoListo = false;

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

  ngOnInit() {
    this.store.dispatch(loadClientes());
    this.store.select(selectCliente)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {
        this.allClientes = (state.clientes || []).filter((c: Cliente) => c.activo !== false);
        this.clientes = [...this.allClientes];
      });
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
    if (this.sorteoSeleccionados.size === this.clientes.length) {
      this.sorteoSeleccionados.clear();
    } else {
      this.clientes.forEach(c => {
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
    if (!this.busquedaSorteo.trim()) return this.clientes;
    const t = this.busquedaSorteo.toLowerCase();
    return this.clientes.filter(c =>
      c.fullname.toLowerCase().includes(t) ||
      c.firstname.toLowerCase().includes(t) ||
      c.lastname.toLowerCase().includes(t) ||
      c.document.includes(t) ||
      c.phone.includes(t)
    );
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
