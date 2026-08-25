import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { TuiDay, TuiDayLike, TuiDayRange } from '@taiga-ui/cdk';
import { TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge, TuiPagination, TuiSwitch } from '@taiga-ui/kit';
import { TuiExpand } from '@taiga-ui/experimental';
import { TuiSearch } from '@taiga-ui/layout';
import { TuiInputDateRangeModule, TuiInputModule, TuiSelectModule } from '@taiga-ui/legacy';

@Component({
  selector: 'app-guia-remision',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
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
  ],
  templateUrl: './guia-remision.component.html',
  styleUrls: ['./guia-remision.component.scss'],
})
export class GuiaRemisionComponent {

  expanded = false;
  viewMode = 'table' as string;

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

  onSearch() {
    // TODO: implementar busqueda
  }

  clearFilters() {
    this.form.reset();
    this.range = new TuiDayRange(
      TuiDay.currentLocal().append({ day: -TuiDay.currentLocal().day + 1 }),
      TuiDay.currentLocal()
    );
  }
}
