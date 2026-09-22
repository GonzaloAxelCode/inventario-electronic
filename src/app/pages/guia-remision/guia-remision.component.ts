import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { TuiDay, TuiDayLike, TuiDayRange } from '@taiga-ui/cdk';
import { TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge, TuiPagination, TuiSwitch } from '@taiga-ui/kit';
import { TuiExpand } from '@taiga-ui/experimental';
import { TuiSearch } from '@taiga-ui/layout';
import { TuiInputDateRangeModule, TuiInputModule, TuiSelectModule } from '@taiga-ui/legacy';
import { GuiaRemisionRemitente } from '@/app/models/guia-remision.models';
import { cargarGuias } from '@/app/state/actions/guia-remision.actions';
import { AppState } from '@/app/state/app.state';
import { DetalleguiaComponent } from '@/app/components/guiaremisioncomponents/detalleguia/detalleguia.component';
import { ListaguiasComponent } from '@/app/components/guiaremisioncomponents/listaguias/listaguias.component';

@Component({
  selector: 'app-guia-remision',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TuiButton,
    TuiTextfield,
    TuiBadge,
    TuiPagination,
    TuiSwitch,
    TuiSearch,
    TuiExpand,
    TuiInputDateRangeModule,
    TuiInputModule,
    TuiSelectModule,
    ListaguiasComponent,
    DetalleguiaComponent,
  ],
  templateUrl: './guia-remision.component.html',
  styleUrls: ['./guia-remision.component.scss'],
})
export class GuiaRemisionComponent {

  private store = inject(Store<AppState>);

  expanded = false;
  viewMode = 'table' as string;
  guiaSeleccionada: GuiaRemisionRemitente | null = null;

  readonly maxLength: TuiDayLike = { month: 12 };

  range: TuiDayRange = new TuiDayRange(
    TuiDay.currentLocal().append({ day: -TuiDay.currentLocal().day + 1 }),
    TuiDay.currentLocal()
  );

  form = new FormGroup({
    numero_guia: new FormControl(''),
    nombre_destinatario: new FormControl(''),
    estado: new FormControl(''),
  });

  readonly estados = ['PENDIENTE', 'EN_TRANSITO', 'ENTREGADO', 'CANCELADO'];

  onRangeChange(newRange: TuiDayRange): void {
    this.range = newRange;
  }

  private fechaISO(day: TuiDay): string {
    const d = day.toLocalNativeDate();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${dd}`;
  }

  onSearch() {
    const f = this.form.value;
    this.store.dispatch(cargarGuias({
      page: 1,
      page_size: 10,
      from_date: this.fechaISO(this.range.from),
      to_date: this.fechaISO(this.range.to),
      query: {
        ...(f.numero_guia?.trim() ? { numero_guia: f.numero_guia.trim() } : {}),
        ...(f.nombre_destinatario?.trim() ? { dest_nombre: f.nombre_destinatario.trim() } : {}),
        ...(f.estado ? { estado: f.estado } : {}),
      },
    }));
  }

  clearFilters() {
    this.form.reset();
    this.range = new TuiDayRange(
      TuiDay.currentLocal().append({ day: -TuiDay.currentLocal().day + 1 }),
      TuiDay.currentLocal()
    );
    this.store.dispatch(cargarGuias({ page: 1, page_size: 10 }));
  }

  onVerDetalle(guia: GuiaRemisionRemitente): void {
    this.guiaSeleccionada = guia;
  }

  cerrarDetalle(): void {
    this.guiaSeleccionada = null;
  }
}
