import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiButton, TuiDataList, TuiDialogContext, TuiDropdown, TuiError, TuiExpand, TuiGroup, TuiHintUnstyledComponent, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiTextareaModule, } from '@taiga-ui/legacy';

import { Categoria } from '@/app/models/categoria.models';
import { Producto, ProductoState } from '@/app/models/producto.models';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { updateProductoAction, updateProductoFail, updateProductoSuccess } from '@/app/state/actions/producto.actions';
import { AppState } from '@/app/state/app.state';
import { selectCategoriaState } from '@/app/state/selectors/categoria.selectors';
import { selectProductoState } from '@/app/state/selectors/producto.selectors';
import { selectPermissions } from '@/app/state/selectors/user.selectors';
import { Actions, ofType } from '@ngrx/effects';
import { TuiDataListWrapper, TuiTabs } from '@taiga-ui/kit';
import { TuiComboBoxModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';
import { Subject, takeUntil } from 'rxjs';
import { DialogeditinventarioComponent } from '../dialogeditinventario/dialogeditinventario.component';


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
    TuiDataList, TuiLoader,
    TuiTextfield, DialogeditinventarioComponent,
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
  userPermissions$ = this.store.select(selectPermissions);
  protected expanded = false;
  loadingUpdateProducto: boolean = false;
  productoForm: FormGroup;
  categorias: Categoria[] = [];
  marcas = ['Genérico', 'Samsung', 'Apple', 'Xiaomi', 'Huawei'];
  modelos = ['Genérico', 'Modelo A', 'Modelo B', 'Modelo C'];
  URL_BASE = URL_BASE
  private destroy$ = new Subject<void>();
  constructor(private fb: FormBuilder, private store: Store<AppState>, private actions$: Actions) {
    this.productoForm = this.fb.group({
      nombre: [this.producto.nombre, Validators.required,],
      id: [this.producto.id],
      descripcion: [this.producto.descripcion],
      marca: [this.producto.marca || 'Genérico', Validators.required], // Valor por defecto
      modelo: [this.producto.modelo || 'Genérico', Validators.required], // Valor por defecto categoria: [this.producto.categoria, Validators.required],
      categoria: [this.producto.categoria, Validators.required],
      imagen: [this.producto?.imagen
        ? URL_BASE + this.producto.imagen
        : "https://sublimac.com/wp-content/uploads/2017/11/default-placeholder.png"],
    });
  }

  ngOnInit() {
    this.store.select(selectProductoState).subscribe((state: ProductoState) => {
      this.loadingUpdateProducto = state.loadingUpdate;
    });
    this.store.select(selectCategoriaState).subscribe((state) => {
      this.categorias = state.categorias;
    });

    this.actions$.pipe(
      ofType(updateProductoSuccess, updateProductoFail),
      takeUntil(this.destroy$)
    ).subscribe(() => {

      this.context.completeWith(true);
    });
  }
  onCloseDialog() {
    this.context.completeWith(true)
  }

  onSubmit() {
    if (this.productoForm.valid) {
      const formData = new FormData();

      const productoActualizado = {
        ...this.productoForm.value,
        nombre: this.productoForm.value.nombre?.trim()
      };

      Object.entries(productoActualizado).forEach(([key, value]: any) => {

        // ======== CONTROL ESPECIAL PARA LA IMAGEN ========
        if (key === 'imagen') {

          // Si ya hay una imagen y viene como string (URL) → NO enviarla
          if (typeof value === 'string') {
            return; // 🛑 No se agrega al FormData
          }

          // Si el usuario cambió la imagen → enviar archivo
          if (value instanceof File) {
            formData.append(key, value);
            return;
          }

          // Si es null o undefined → no enviar nada
          return;
        }
        // ==================================================

        // Campos normales
        if (value !== null && value !== undefined) {
          if (value instanceof File) {
            formData.append(key, value);
          } else if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });

      // Dispatch con FormData
      this.store.dispatch(updateProductoAction({
        producto: formData
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


  previewImage: string | ArrayBuffer | null = URL_BASE + "/" + this.producto.imagen || null;

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Guardar el archivo en el FormGroup
      this.productoForm.patchValue({ imagen: file });
      this.productoForm.get('imagen')?.updateValueAndValidity();

      // Previsualización
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

}
