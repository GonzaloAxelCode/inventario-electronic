import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormguiaComponent } from '@/app/components/guiaremisioncomponents/formguia/formguia.component';

@Component({
  selector: 'app-nueva-guia',
  standalone: true,
  imports: [CommonModule, RouterModule, FormguiaComponent],
  template: `
    <main style="font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif;" class="p-3 sm:p-6">
      <div class="max-w-4xl mx-auto min-w-0">
        <button (click)="goBack()" class="inline-flex items-center gap-1.5 h-9 px-4 rounded-full bg-stone-100 dark:bg-white/10 text-stone-900 dark:text-white text-[13px] font-semibold hover:opacity-90 transition-opacity mb-4">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
          Volver a Guías
        </button>
        <div class="mb-4">
          <h2 class="text-lg sm:text-xl font-semibold tracking-tight text-stone-900 dark:text-white">Nueva Guía de Remisión</h2>
          <p class="text-xs text-stone-400 mt-0.5">Completa los datos para generar la guía</p>
        </div>
        <app-formguia (cancelar)="goBack()"></app-formguia>
      </div>
    </main>
  `,
})
export class NuevaGuiaComponent {
  constructor(private router: Router) {}
  goBack(): void {
    this.router.navigate(['/app/guia-remision']);
  }
}
