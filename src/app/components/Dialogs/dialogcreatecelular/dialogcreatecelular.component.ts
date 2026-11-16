import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiDataList, TuiDialogContext } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiSwitch } from '@taiga-ui/kit';
import { TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';

export interface CelularFormResult {
  marca: string;
  modelo: string;
  color: string;
  memoria: string;
  ram: string;
  estado: string;
  imei1: string;
  imei2: string;
  dualSim: boolean;
  costoCompra: string;
  precioVenta: string;
  disponible: boolean;
  fotos: string[];
  fotosFiles: File[];
}

@Component({
  selector: 'app-dialogcreatecelular',
  standalone: true,
  imports: [CommonModule, FormsModule, TuiButton, TuiDataList, TuiDataListWrapper, TuiInputModule, TuiSelectModule, TuiSwitch, TuiTextfieldControllerModule],
  templateUrl: './dialogcreatecelular.component.html',
  styleUrl: './dialogcreatecelular.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogcreatecelularComponent {
  protected readonly context = injectContext<TuiDialogContext<CelularFormResult | null, Record<string, any>>>();
  private readonly cdr = inject(ChangeDetectorRef);

  step = 1;

  marcas = ['Apple', 'Samsung', 'Xiaomi', 'Redmi', 'Motorola', 'Honor', 'Realme', 'Infinix', 'Oppo', 'Vivo'];
  colores = ['Negro', 'Blanco', 'Azul', 'Titanio', 'Verde', 'Rosado'];
  memorias = ['128 GB', '256 GB', '512 GB', '1 TB'];
  rams = ['4 GB', '6 GB', '8 GB', '12 GB', '16 GB'];
  estados = ['Sellado', 'Nuevo', 'Seminuevo', 'Reacondicionado'];

  form = {
    marca: 'Xiaomi',
    modelo: '',
    color: 'Negro',
    memoria: '256 GB',
    ram: '8 GB',
    estado: 'Sellado',
    imei1: '',
    imei2: '',
    dualSim: true,
    costoCompra: '',
    precioVenta: '',
    disponible: true,
    fotos: [] as string[],
  };
  fotosFiles: File[] = [];
  /** Copia de las fotos con las que se abrió el diálogo (solo en editar). */
  originalFotos: string[] = [];

  get isEdit() { return !!this.context.data; }

  constructor() {
    const data = this.context.data as Record<string, any> | undefined;
    if (data) {
      this.form = {
        ...this.form,
        marca: data['marca'] ?? this.form.marca,
        modelo: data['modelo'] ?? '',
        color: data['color'] ?? this.form.color,
        memoria: data['memoria'] ?? this.form.memoria,
        ram: data['ram'] ?? this.form.ram,
        estado: data['estado_equipo'] ?? data['estado'] ?? this.form.estado,
        imei1: data['imei1'] ?? '',
        imei2: data['imei2'] ?? '',
        dualSim: data['dualSim'] ?? true,
        costoCompra: String(data['costo_compra'] ?? data['costoCompra'] ?? ''),
        precioVenta: String(data['precio_venta'] ?? data['precioVenta'] ?? ''),
        disponible: data['disponible'] ?? true,
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

  next() { if (this.step < 3) this.step++; }
  back() { if (this.step > 1) this.step--; }
  guardar() {
    if (!this.puedeGuardar) return;
    this.context.completeWith({ ...this.form, fotosFiles: this.fotosFiles });
  }
  cerrar() { this.context.completeWith(null); }

  // Todos obligatorios: datos, precios, imei1/imei2 y las 2 fotos
  get puedeGuardar(): boolean {
    const f = this.form;
    if (!String(f.marca ?? '').trim()) return false;
    if (!String(f.modelo ?? '').trim()) return false;
    if (!String(f.color ?? '').trim()) return false;
    if (!String(f.memoria ?? '').trim()) return false;
    if (!String(f.ram ?? '').trim()) return false;
    if (!String(f.estado ?? '').trim()) return false;
    if (!String(f.imei1 ?? '').trim()) return false;
    if (!String(f.imei2 ?? '').trim()) return false;
    if (String(f.costoCompra ?? '').trim() === '' || isNaN(Number(f.costoCompra))) return false;
    if (String(f.precioVenta ?? '').trim() === '' || isNaN(Number(f.precioVenta))) return false;
    if (f.fotos.length < 2) return false;
    return true;
  }

  get ganancia(): number | null {
    const c = Number(this.form.costoCompra);
    const v = Number(this.form.precioVenta);
    if (!c || !v) return null;
    return v - c;
  }
}
