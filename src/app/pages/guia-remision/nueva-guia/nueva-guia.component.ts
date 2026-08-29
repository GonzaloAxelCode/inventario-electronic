import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormguiaComponent } from '@/app/components/guiaremisioncomponents/formguia/formguia.component';

@Component({
  selector: 'app-nueva-guia',
  standalone: true,
  imports: [CommonModule, RouterModule, FormguiaComponent],
  template: `
    <main class="p-4 sm:p-6">
      <div class="max-w-4xl mx-auto">
        <button (click)="goBack()" class="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#0071e3] hover:text-[#0077ed] transition-colors mb-6">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
          Volver a Guías
        </button>
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
