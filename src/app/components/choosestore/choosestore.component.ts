import { CommonModule, NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiDataList, TuiDropdown } from '@taiga-ui/core';
import { TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
interface Store {
  id: number;
  name: string;
}
@Component({
  standalone: true,
  selector: 'app-choosestore',

  imports: [
    FormsModule,
    NgForOf,
    ReactiveFormsModule,
    TuiDataList,
    TuiDropdown,

    CommonModule,
    TuiDropdown,
    TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule,
    TuiDataList,

  ],
  templateUrl: './choosestore.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChoosestoreComponent implements OnInit {
  formChoose: FormGroup;

  listMetodosPago = ["Tienda Accesorios 1", "Accesorios Tienda 2", "Tienda Accesorios 3", "Tienda Accesorios 4"];
  constructor(private fb: FormBuilder) {
    this.formChoose = this.fb.group({



      metodoPago: [this.listMetodosPago[1], Validators.required],


    });
  }

  ngOnInit(): void {
    this.formChoose.get('metodoPago')?.disable();
  }

}
