import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiButton, TuiDataList, TuiDialogContext, TuiDropdown, TuiError, TuiExpand, TuiGroup, TuiHintUnstyledComponent, TuiIcon, TuiLoader, TuiNumberFormat, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiTextareaModule, } from '@taiga-ui/legacy';

import { Categoria } from '@/app/models/categoria.models';
import { Inventario } from '@/app/models/inventario.models';
import { Producto, ProductoState } from '@/app/models/producto.models';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { updateProductoAction, updateProductoFail, updateProductoSuccess } from '@/app/state/actions/producto.actions';
import { actualizarInventario, actualizarInventarioFail, actualizarInventarioSuccess } from '@/app/state/actions/inventario.actions';
import { AppState } from '@/app/state/app.state';
import { selectCategoriaState } from '@/app/state/selectors/categoria.selectors';
import { selectProductoState } from '@/app/state/selectors/producto.selectors';
import { selectPermissions } from '@/app/state/selectors/user.selectors';
import { Actions, ofType } from '@ngrx/effects';
import { TuiDataListWrapper, TuiTabs } from '@taiga-ui/kit';
import { TuiComboBoxModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { TuiInputNumber } from '@taiga-ui/kit';
import { injectContext } from '@taiga-ui/polymorpheus';
import { Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-dialogupdateproduct',
  standalone: true,
  imports: [CommonModule, TuiDropdown,
    ReactiveFormsModule,
    TuiInputModule,
    TuiTextareaModule, TuiIcon,
    TuiError,
    TuiButton,
    TuiDataListWrapper,
    TuiDataList, TuiLoader,
    TuiTextfield, TuiNumberFormat,
    FormsModule, TuiComboBoxModule,
    TuiSelectModule, TuiTabs, TuiTextfieldControllerModule, TuiExpand, TuiGroup, TuiHintUnstyledComponent,
    TuiInputNumber
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
  protected expandedCaracteristicas = false;
  emptyCaracteristicas = false
  userPermissions$ = this.store.select(selectPermissions);
  protected expanded = false;
  loadingUpdateProducto: boolean = false;
  loadingInventarioUpdate: boolean = false;
  productoForm: FormGroup;
  inventarioFormEdit!: FormGroup;
  categorias: Categoria[] = [];
  marcas = ['Genérico', 'Samsung', 'Apple', 'Xiaomi', 'Huawei'];
  modelos = ['Genérico', 'Modelo A', 'Modelo B', 'Modelo C'];
  URL_BASE = URL_BASE
  previewImage: string | ArrayBuffer | null = null;

  hasInventario: boolean = false;
  private pendingProducto = false;
  private pendingInventario = false;

  private destroy$ = new Subject<void>();
  constructor(private fb: FormBuilder, private store: Store<AppState>, private actions$: Actions) {
    this.productoForm = this.fb.group({
      nombre: [this.producto.nombre, Validators.required,],
      id: [this.producto.id],
      descripcion: [this.producto.descripcion],
      marca: [this.producto.marca || 'Genérico', Validators.required],
      modelo: [this.producto.modelo || 'Genérico', Validators.required],
      categoria: [this.producto.categoria, Validators.required],
      imagen: [null],
      caracteristicas: this.buildCaracteristicasGroup()

    });

    const inv: Partial<Inventario> | null | undefined = (this.producto as any).inventario;
    this.hasInventario = !!(inv && (inv as any).id);
    this.inventarioFormEdit = this.fb.group({
      cantidad: [inv?.cantidad ?? 0, [Validators.required, Validators.min(0)]],
      costo_compra: [inv?.costo_compra ?? 0, [Validators.required, Validators.min(0)]],
      costo_venta: [inv?.costo_venta ?? 0, [Validators.required, Validators.min(0)]],
    });
  }
  removeImage(): void {
    this.previewImage = null;
    this.productoForm.patchValue({ imagen: null });
  }
  buildCaracteristicasGroup(): FormGroup {
    const caracteristicas = this.producto?.caracteristicas || {};
    const group: any = {};
    Object.keys(caracteristicas).forEach(key => {
      group[key] = [caracteristicas[key]];
    });
    return this.fb.group(group);
  }
  ngOnInit() {
    this.previewImage = this.producto?.imagen
      ? URL_BASE + this.producto.imagen
      : "https://sublimac.com/wp-content/uploads/2017/11/default-placeholder.png";
    this.store.select(selectProductoState).subscribe((state: ProductoState) => {
      this.loadingUpdateProducto = state.loadingUpdate;
    });
    this.store.select(selectCategoriaState).subscribe((state) => {
      this.categorias = state.categorias;
    });

    this.actions$.pipe(
      ofType(updateProductoSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.pendingProducto = false;
      this.loadingUpdateProducto = false;
      this.tryComplete();
    });

    this.actions$.pipe(
      ofType(updateProductoFail),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.pendingProducto = false;
      this.loadingUpdateProducto = false;
      this.loadingInventarioUpdate = false;
      // no cerrar, permitir corregir
    });

    this.actions$.pipe(
      ofType(actualizarInventarioSuccess),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.pendingInventario = false;
      this.loadingInventarioUpdate = false;
      this.tryComplete();
    });

    this.actions$.pipe(
      ofType(actualizarInventarioFail),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.pendingInventario = false;
      this.loadingInventarioUpdate = false;
    });

    //
    this.productoForm.patchValue({
      caracteristicas: this.buildCaracteristicasGroup()
    });
    if (Object.keys(this.producto.caracteristicas || {}).length === 0) {
      this.emptyCaracteristicas = true
    } else {
      this.emptyCaracteristicas = false
    }

    this.productoForm.get('categoria')!.valueChanges.subscribe(catId => {
      this.expandedCaracteristicas = true;
      if (!catId) {
        return;
      }
      const categoriaSeleccionada: any = this.categorias.find(c => c.id === catId);
      if (categoriaSeleccionada) {
        if (categoriaSeleccionada.caracteristicas_template.length === 0) {
          this.emptyCaracteristicas = true
        } else {
          this.emptyCaracteristicas = false
        }
        if (categoriaSeleccionada.id === this.producto.categoria) {
          this.cargarCaracteristicasDinamicas(categoriaSeleccionada.caracteristicas_template, this.producto.caracteristicas);
        } else {
          this.cargarCaracteristicasDinamicas(categoriaSeleccionada.caracteristicas_template);
        }
      }
    });

  }

  private tryComplete(): void {
    if (!this.pendingProducto && !this.pendingInventario) {
      this.context.completeWith(true);
    }
  }

  onCloseDialog() {
    this.context.completeWith(true)
  }

  get isUpdating(): boolean {
    return this.loadingUpdateProducto || this.loadingInventarioUpdate;
  }

  onSubmit() {
    const productoValid = this.productoForm.valid;
    const inventarioValid = !this.hasInventario || this.inventarioFormEdit.valid;

    if (!productoValid || !inventarioValid) {
      this.productoForm.markAllAsTouched();
      if (this.hasInventario) this.inventarioFormEdit.markAllAsTouched();
      return;
    }

    // --- Producto ---
    const formData = new FormData();
    const productoActualizado = {
      ...this.productoForm.value,
      nombre: this.productoForm.value.nombre?.trim()
    };

    Object.entries(productoActualizado).forEach(([key, value]: any) => {
      if (key === 'imagen') {
        if (typeof value === 'string') {
          return;
        }
        if (key === "caracteristicas") {
          formData.append("caracteristicas", JSON.stringify(value));
          return;
        }
        if (value instanceof File) {
          formData.append(key, value);
          return;
        }
        return;
      }
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

    this.pendingProducto = true;
    this.store.dispatch(updateProductoAction({
      producto: formData
    }));

    // --- Inventario (mismo botón) ---
    if (this.hasInventario) {
      const inv: any = (this.producto as any).inventario;
      const preparedData: Partial<Inventario> = {
        id: inv.id,
        cantidad: this.inventarioFormEdit.value.cantidad,
        costo_compra: this.inventarioFormEdit.value.costo_compra,
        costo_venta: this.inventarioFormEdit.value.costo_venta,
      };
      this.pendingInventario = true;
      this.loadingInventarioUpdate = true;
      this.store.dispatch(actualizarInventario({ newInventario: preparedData }));
    }

    // Si no hay inventario, solo esperamos producto
    if (!this.hasInventario) {
      this.pendingInventario = false;
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


  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.productoForm.patchValue({ imagen: file });
      this.productoForm.get('imagen')?.updateValueAndValidity();
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getCaracteristicasKeys(): string[] {
    const group = this.productoForm.get('caracteristicas') as FormGroup;
    return group ? Object.keys(group.controls) : [];
  }
  cargarCaracteristicasDinamicas(campos: string[], valores: any = {}) {
    const caracteristicasGroup = this.fb.group({});
    campos.forEach(campo => {
      caracteristicasGroup.addControl(
        campo,
        this.fb.control(valores[campo] ?? '')
      );
    });
    this.productoForm.setControl('caracteristicas', caracteristicasGroup);
  }

}
