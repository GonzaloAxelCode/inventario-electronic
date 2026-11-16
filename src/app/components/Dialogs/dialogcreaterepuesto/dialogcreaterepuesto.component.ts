import { Categoria } from '@/app/models/categoria.models';
import { Proveedor } from '@/app/models/proveedor.models';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiButton, TuiDataList, TuiDialogContext, TuiLabel, TuiTextfield } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiInputNumber } from '@taiga-ui/kit';
import { TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs';
import { loadProveedores } from '@/app/state/actions/proveedor.actions';
import { AppState } from '@/app/state/app.state';
import { selectProveedores } from '@/app/state/selectors/proveedor.selectors';
import { ProveedorState } from '@/app/state/reducers/proveedor.reducer';
import { CategoriaService } from '@/app/services/categoria.service';

export interface RepuestoFormResult {
  nombre: string;
  tipo: string;
  categoria: number | string;
  modelos: string;
  cantidad: number | string;
  valorizacion: string;
  proveedor: number | string;
  ubicacion: string;
  fotos: string[];
  fotosFiles: File[];
}

@Component({
  selector: 'app-dialogcreaterepuesto',
  standalone: true,
  imports: [CommonModule, FormsModule, TuiButton, TuiDataList, TuiDataListWrapper, TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule, TuiTextfield, TuiLabel, TuiInputNumber],
  templateUrl: './dialogcreaterepuesto.component.html',
  styleUrl: './dialogcreaterepuesto.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogcreaterepuestoComponent {
  protected readonly context = injectContext<TuiDialogContext<RepuestoFormResult | null, Record<string, any>>>();
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly store = inject(Store<AppState>);
  private readonly categoriaService = inject(CategoriaService);

  // Categorías propias de repuestos (el store compartido trae ACCESORIO por defecto)
  categorias$: Observable<Categoria[]> = this.categoriaService.fetchCategorias('REPUESTO').pipe(
    map((list) => list ?? []),
    catchError(() => of([])),
  );
  private categoriasCache: Categoria[] = [];

  categoriaNombre(id: number | string): string {
    if (id === '' || id === null || id === undefined) return 'Seleccione tipo';
    const found = this.categoriasCache.find((c) => c.id === Number(id));
    return found ? found.nombre : String(id);
  }

  categoriaStringify = (id: number | string | null | undefined): string =>
    this.categoriaNombre(id ?? '');

  proveedores$: Observable<Proveedor[]> = this.store.select(selectProveedores).pipe(
    map((state: ProveedorState) => state.proveedores ?? [])
  );
  private proveedoresCache: Proveedor[] = [];

  proveedorNombre(id: number | string): string {
    if (id === '' || id === null || id === undefined) return 'Sin proveedor';
    const found = this.proveedoresCache.find((p) => p.id === Number(id));
    return found ? found.nombre : String(id);
  }

  form = {
    nombre: '',
    tipo: '',
    categoria: '' as number | string,
    modelos: '',
    cantidad: '' as number | string,
    valorizacion: '',
    proveedor: '' as number | string,
    ubicacion: '',
    fotos: [] as string[],
  };
  fotosFiles: File[] = [];
  /** Copia de las fotos con las que se abrió el diálogo (solo en editar). */
  originalFotos: string[] = [];

  get isEdit() { return !!this.context.data; }

  constructor() {
    this.store.dispatch(loadProveedores());
    this.categorias$.subscribe((list) => { this.categoriasCache = list; this.cdr.markForCheck(); });
    this.proveedores$.subscribe((list) => { this.proveedoresCache = list; this.cdr.markForCheck(); });
    const data = this.context.data as Record<string, any> | undefined;
    if (data) {
      this.form = {
        ...this.form,
        nombre: data['nombre'] ?? '',
        tipo: data['tipo'] ?? this.form.tipo,
        categoria: (data['categoria'] ?? data['categoria_id'] ?? '') as number | string,
        modelos: data['modelos_compatibles'] ?? data['modelos'] ?? '',
        // Backend devuelve "stock"; se mapea al campo "cantidad" del form
        cantidad: (data['stock'] ?? data['cantidad'] ?? '') as number | string,
        valorizacion: String(data['valorizacion'] ?? ''),
        proveedor: (data['proveedor'] as number | string) ?? '',
        ubicacion: data['ubicacion'] ?? '',
        fotos: (data['fotos'] as string[]) ?? this.previewFromImagenes(data),
      };
      this.originalFotos = [...this.form.fotos];
    }
  }

  private previewFromImagenes(data: Record<string, any>): string[] {
    const imgs = ['imagen1', 'imagen2']
      .map((k) => data[k])
      .filter((v) => typeof v === 'string' && v);
    return imgs.slice(0, 2);
  }

  onFotosSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []).slice(0, 2 - this.form.fotos.length);
    for (const file of files) {
      this.fotosFiles = [...this.fotosFiles, file];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          this.form.fotos = [...this.form.fotos, reader.result];
          this.cdr.markForCheck();
        }
      };
      reader.readAsDataURL(file);
    }
    input.value = '';
  }

  removeFoto(index: number) {
    this.form.fotos = this.form.fotos.filter((_, i) => i !== index);
    // Recorta archivos nuevos al número de previews nuevas restantes
    const nuevas = this.form.fotos.filter((f) => !this.originalFotos.includes(f)).length;
    if (this.fotosFiles.length > nuevas) this.fotosFiles = this.fotosFiles.slice(0, nuevas);
    this.cdr.markForCheck();
  }

  /** ¿Cambiaron las fotos respecto a las originales? (solo editar) */
  get hasFotosChanged(): boolean {
    if (this.fotosFiles.length > 0) return true;
    if (this.form.fotos.length !== this.originalFotos.length) return true;
    return this.form.fotos.some((f, i) => f !== this.originalFotos[i]);
  }

  /** Vuelve a las imágenes originales, descarta las nuevas. */
  restablecerFotos(): void {
    this.form.fotos = [...this.originalFotos];
    this.fotosFiles = [];
    this.cdr.markForCheck();
  }

  guardar() {
    if (!this.puedeGuardar) return;
    let categoria = this.form.categoria;
    // Compat: registros antiguos solo traen `tipo` (nombre). Resolver id por nombre.
    if ((categoria === '' || categoria == null) && this.form.tipo) {
      const found = this.categoriasCache.find(
        (c) => c.nombre?.toLowerCase() === String(this.form.tipo).toLowerCase()
      );
      if (found?.id != null) categoria = found.id;
    }
    const nombre = this.categoriaNombre(categoria);
    const tipo = nombre && nombre !== 'Seleccione tipo' ? nombre : this.form.tipo;
    this.context.completeWith({ ...this.form, categoria, tipo, fotosFiles: this.fotosFiles });
  }

  // Obligatorios: nombre, cantidad, valorización. Opcionales: modelos, ubicación, proveedor, fotos.
  get puedeGuardar(): boolean {
    const nombre = String(this.form.nombre ?? '').trim();
    const cantidad = this.form.cantidad;
    const val = String(this.form.valorizacion ?? '').trim();
    if (!nombre) return false;
    if (cantidad === '' || cantidad == null || isNaN(Number(cantidad)) || Number(cantidad) < 0) return false;
    if (!val || isNaN(Number(val)) || Number(val) < 0) return false;
    return true;
  }
  cerrar() { this.context.completeWith(null); }
}
