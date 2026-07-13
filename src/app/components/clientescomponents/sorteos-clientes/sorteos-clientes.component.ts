import { CommonModule } from '@angular/common';
import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { TuiAppearance, TuiButton, TuiDialogService, TuiTitle } from '@taiga-ui/core';
import { map } from 'rxjs';

@Component({
  selector: 'app-sorteos-clientes',
  standalone: true,
  imports: [CommonModule, TuiButton, TuiAppearance, TuiTitle],
  templateUrl: './sorteos-clientes.component.html',
  styleUrl: './sorteos-clientes.component.scss'
})
export class SorteosClientesComponent {

  private readonly dialogs = inject(TuiDialogService);

  @ViewChild('ganadorTpl', { static: true }) ganadorTpl!: TemplateRef<any>;

  clientes = [
    { id: 1, nombre: 'Juan Pérez', compras: 24 },
    { id: 2, nombre: 'María García', compras: 18 },
    { id: 3, nombre: 'Carlos López', compras: 15 },
    { id: 4, nombre: 'Ana Martínez', compras: 12 },
    { id: 5, nombre: 'Pedro Sánchez', compras: 10 },
    { id: 6, nombre: 'Laura Hernández', compras: 9 },
    { id: 7, nombre: 'Miguel Torres', compras: 8 },
    { id: 8, nombre: 'Sofía Ramírez', compras: 7 },
    { id: 9, nombre: 'Diego Flores', compras: 6 },
    { id: 10, nombre: 'Camila Vargas', compras: 5 },
  ];

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
  winner: typeof this.clientes[0] | null = null;
  rotationAngle = 0;

  sectorAngle = 360 / this.clientes.length;

  get wheelGradient(): string {
    const stops: string[] = [];
    for (let i = 0; i < this.clientes.length; i++) {
      const start = i * this.sectorAngle;
      const end = start + this.sectorAngle;
      stops.push(`${this.colores[i]} ${start}deg ${end}deg`);
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
    if (this.isSpinning) return;

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
}
