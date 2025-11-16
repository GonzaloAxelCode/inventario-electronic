import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiButton, TuiDataList, TuiDialogContext, TuiDropdown, TuiError, TuiExpand, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiTextareaModule, } from '@taiga-ui/legacy';

import { Categoria } from '@/app/models/categoria.models';
import { ProductoState } from '@/app/models/producto.models';
import { createProductoAction, createProductoFail, createProductoSuccess } from '@/app/state/actions/producto.actions';
import { AppState } from '@/app/state/app.state';
import { selectCategoriaState } from '@/app/state/selectors/categoria.selectors';
import { selectProductoState } from '@/app/state/selectors/producto.selectors';
import { selectPermissions, selectUsersState } from '@/app/state/selectors/user.selectors';
import { Actions, ofType } from '@ngrx/effects';
import { TuiDataListWrapper, TuiTabs } from '@taiga-ui/kit';
import { TuiComboBoxModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';
import { map, Observable, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dialogcreateproduct',
  standalone: true,
  imports: [
    CommonModule, TuiLoader,
    ReactiveFormsModule,
    TuiInputModule,
    TuiTextareaModule,
    TuiError,
    TuiButton,
    TuiDataListWrapper,
    TuiDataList,
    TuiTextfield,
    FormsModule, TuiComboBoxModule,
    TuiSelectModule, TuiTabs, TuiTextfieldControllerModule, TuiDropdown, TuiExpand
  ],
  templateUrl: './dialogcreateproduct.component.html',
  styleUrl: './dialogcreateproduct.component.scss'
})
export class DialogcreateproductComponent {
  protected expanded = false;
  userPermissions$ = this.store.select(selectPermissions);
  protected readonly context = injectContext<TuiDialogContext<boolean, Partial<Categoria>>>();
  productoForm: FormGroup;
  categorias: Categoria[] = [];
  marcas = ['Genérico', 'Samsung', 'Apple', 'Xiaomi', 'Huawei'];
  modelos = ['Genérico', 'Modelo A', 'Modelo B', 'Modelo C'];
  tiendaUser!: number
  private destroy$ = new Subject<void>();
  loadingCreateProduct$!: Observable<boolean>
  constructor(private fb: FormBuilder, private store: Store<AppState>, private actions$: Actions) {
    this.productoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: [''],
      marca: ['Genérico', Validators.required],
      modelo: ['Genérico', Validators.required],
      categoria: [null, Validators.required],
      imagen: [null],
    });
  }
  previewImage: string | ArrayBuffer | null = null;

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




  ngOnInit() {
    this.store.select(selectCategoriaState).subscribe((state) => {
      this.categorias = state.categorias;

    });

    //  tiendaUser!: number

    this.store.select(selectUsersState).pipe(
      map(userState => userState.user.tienda)
    ).subscribe(tienda => {
      this.tiendaUser = tienda || 0;
    });
    this.loadingCreateProduct$ = this.store.select(selectProductoState).pipe(
      map((state: ProductoState) => state.loadingCreate)
    );
    this.actions$.pipe(
      ofType(createProductoSuccess, createProductoFail),
      takeUntil(this.destroy$)
    ).subscribe(() => {

      this.context.completeWith(true);
    });
  }

  onSubmit() {
    if (this.productoForm.valid) {
      const formData = new FormData();
      const nuevoProducto = this.productoForm.value;

      // Agregar todos los campos al FormData
      Object.entries(nuevoProducto).forEach(([key, value]: any) => {
        if (value !== null) {
          // Si es un objeto (como categoria o caracteristica), convertir a JSON
          if (typeof value === 'object' && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });

      // Agregar el nombre de la categoría
      formData.append('categoria_nombre', this.getCategoriaNombre(nuevoProducto.categoria));

      // Dispatch usando FormData directamente
      this.store.dispatch(createProductoAction({ producto: formData }));
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
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}