import { Categoria } from '@/app/models/categoria.models';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiDialogContext, TuiTextfield } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';

export interface SelectCategoriaDialogData {
  categorias: Categoria[];
  seleccionadaId?: number | null;
}

@Component({
  selector: 'app-dialogselectcategoria',
  standalone: true,
  imports: [CommonModule, FormsModule, TuiButton, TuiTextfield],
  templateUrl: './dialogselectcategoria.component.html',
})
export class DialogselectcategoriaComponent {
  protected readonly context = injectContext<TuiDialogContext<Categoria | null | undefined, SelectCategoriaDialogData>>();
  search = '';

  get categorias(): Categoria[] {
    return this.context.data?.categorias ?? [];
  }

  get seleccionadaId(): number | null | undefined {
    return this.context.data?.seleccionadaId;
  }

  filtradas(): Categoria[] {
    const q = (this.search || '').trim().toLowerCase();
    if (!q) return this.categorias;
    return this.categorias.filter((c) => (c.nombre || '').toLowerCase().includes(q));
  }

  elegir(cat: Categoria | null): void {
    this.context.completeWith(cat);
  }

  cerrar(): void {
    this.context.completeWith(undefined);
  }
}
