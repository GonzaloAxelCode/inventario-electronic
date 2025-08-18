import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiButton, TuiDataList, TuiDialogContext, TuiDropdown, TuiError, TuiExpand, TuiGroup, TuiHintUnstyledComponent, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiTextareaModule, } from '@taiga-ui/legacy';

import { Categoria } from '@/app/models/categoria.models';
import { Producto } from '@/app/models/producto.models';
import { updateProductoAction } from '@/app/state/actions/producto.actions';
import { AppState } from '@/app/state/app.state';
import { selectCategoriaState } from '@/app/state/selectors/categoria.selectors';
import { TuiDataListWrapper, TuiTabs } from '@taiga-ui/kit';
import { TuiComboBoxModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';


@Component({
  selector: 'app-dialogupdateproduct',
  standalone: true,
  imports: [CommonModule, TuiDropdown,
    ReactiveFormsModule,
    TuiInputModule,
    TuiTextareaModule,
    TuiError,
    TuiButton,
    TuiDataListWrapper,
    TuiDataList,
    TuiTextfield,
    FormsModule, TuiComboBoxModule,
    TuiSelectModule, TuiTabs, TuiTextfieldControllerModule, TuiExpand, TuiGroup, TuiHintUnstyledComponent
  ],
  providers: [],
  templateUrl: './dialogupdateproduct.component.html',
  styleUrl: './dialogupdateproduct.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class DialogupdateproductComponent implements OnInit {
  protected readonly context = injectContext<TuiDialogContext<boolean, Partial<Producto>>>();
  public producto: Partial<Producto> = this.context.data ?? {};
  selectedCategory: any;

  protected expanded = false;

  productoForm: FormGroup;
  categorias: Categoria[] = [];
  marcas = ['Genérico', 'Samsung', 'Apple', 'Xiaomi', 'Huawei'];
  modelos = ['Genérico', 'Modelo A', 'Modelo B', 'Modelo C'];


  constructor(private fb: FormBuilder, private store: Store<AppState>) {
    this.productoForm = this.fb.group({
      nombre: [this.producto.nombre, Validators.required,],
      descripcion: [this.producto.descripcion],
      marca: [this.producto.marca || 'Genérico', Validators.required], // Valor por defecto
      modelo: [this.producto.modelo || 'Genérico', Validators.required], // Valor por defecto categoria: [this.producto.categoria, Validators.required],
      categoria: [this.producto.categoria, Validators.required],

    });
  }

  ngOnInit() {
    this.store.select(selectCategoriaState).subscribe((state) => {
      this.categorias = state.categorias;
    });
  }
  onCloseDialog() {
    this.context.completeWith(true)
  }

  onSubmit() {
    if (this.productoForm.valid) {
      const nuevoProducto = this.productoForm.value;
      console.log(nuevoProducto)
      this.store.dispatch(updateProductoAction({
        producto: {
          ...this.producto,
          ...nuevoProducto,


        }
      }));
    }
  }

  getCategoriaNombre = (id: number): string => {
    const categoria = this.categorias.find((c) => c.id === id);
    return categoria ? categoria.nombre : '';
  };
  validateNumberInput(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    const charStr = String.fromCharCode(charCode);


    if (!charStr.match(/[\d.]/) || (charStr === '.' && (event.target as HTMLInputElement).value.includes('.'))) {
      event.preventDefault();
    }
  }

  protected activeItemIndex = 0;
  protected readonly items = ['Edit', 'Download', 'Rename', 'Delete'];

  protected readonly selectItems = ['Item 1', 'Item 2'];

  protected open = false;

  protected selected = null;

  protected onClick(): void {
    this.open = false;
  }
}
