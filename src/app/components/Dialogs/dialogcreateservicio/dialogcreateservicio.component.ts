import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiDataList, TuiDialogContext } from '@taiga-ui/core';
import { TuiDataListWrapper } from '@taiga-ui/kit';
import { TuiInputModule, TuiSelectModule, TuiTextareaModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';

@Component({
  selector: 'app-dialogcreateservicio',
  standalone: true,
  imports: [CommonModule, FormsModule, TuiButton, TuiDataList, TuiDataListWrapper, TuiInputModule, TuiSelectModule, TuiTextareaModule, TuiTextfieldControllerModule],
  templateUrl: './dialogcreateservicio.component.html',
  styleUrl: './dialogcreateservicio.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogcreateservicioComponent {
  protected readonly context = injectContext<TuiDialogContext<boolean, Record<string, any>>>();

  tipos = ['Pantallas', 'Baterías', 'Software', 'Otro'];

  form = {
    tipo: 'Pantallas',
    nombre: '',
    descripcion: '',
    precio: '',
    duracion: '',
    garantia: '90 días',
  };

  garantias = ['30 días', '60 días', '90 días'];

  get isEdit() { return !!this.context.data; }

  constructor() {
    const data = this.context.data as Record<string, any> | undefined;
    if (data) this.form = { ...this.form, ...data };
  }

  guardar() { this.context.completeWith(true); }
  cerrar() { this.context.completeWith(false); }
}
