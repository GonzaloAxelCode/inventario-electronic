import { ComprobanteCompra, UpdateCompra } from '@/app/models/compra.models';
import { Proveedor } from '@/app/models/proveedor.models';
import { ConsultaService } from '@/app/services/consultas.service';
import { editarCompra, editarCompraExito } from '@/app/state/actions/compra.actions';
import { loadProveedores } from '@/app/state/actions/proveedor.actions';
import { AppState } from '@/app/state/app.state';
import { selectProveedores } from '@/app/state/selectors/proveedor.selectors';
import { parseXmlCompra } from '@/app/utils/xml-parser';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiAlertService, TuiButton, TuiDataList, TuiTextfield } from '@taiga-ui/core';
import { TuiDialogContext } from '@taiga-ui/core';
import { TuiInputModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';
import { TuiSegmented } from '@taiga-ui/kit';
import { injectContext } from '@taiga-ui/polymorpheus';
import { Subject, takeUntil, finalize, timeout, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

type FileKind = 'xml' | 'pdf' | 'imagen';
type FileModo = 'mantener' | 'reemplazar' | 'quitar';

@Component({
  selector: 'app-dialogeditarcompra',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TuiButton,
    TuiDataList,
    TuiTextfield,
    TuiInputModule,
    TuiSelectModule,
    TuiTextfieldControllerModule,
    TuiSegmented,
  ],
  templateUrl: './dialogeditarcompra.component.html',
  styleUrl: './dialogeditarcompra.component.scss'
})
export class DialogeditarcompraComponent implements OnInit, OnDestroy {
  protected readonly context = injectContext<TuiDialogContext<boolean, ComprobanteCompra>>();
  public compra: ComprobanteCompra = this.context.data ?? {} as ComprobanteCompra;

  private fb = inject(FormBuilder);
  private store = inject(Store<AppState>);
  private alerts = inject(TuiAlertService);
  private actions$ = inject(Actions);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();
  private consultaService = inject(ConsultaService);

  loadingUpdate$ = this.store.select((s: AppState) => (s as any).Compra?.loadingUpdate ?? false);
  serverError$ = this.store.select((s: AppState) => (s as any).Compra?.error?.error || {});

  submitted = false;
  itemsModificados = false;

  tipoComprobantes = ['01', '03'];
  tipoComprobanteLabels: Record<string, string> = { '01': 'Factura', '03': 'Boleta' };
  monedas = ['PEN', 'USD'];
  formasPago = ['CONTADO', 'CREDITO'];
  formasPagoLabels: Record<string, string> = { 'CONTADO': 'Contado', 'CREDITO': 'Crédito' };

  proveedores: Proveedor[] = [];
  proveedorMode: 'mantener' | 'registrados' | 'manual' = 'mantener';
  proveedorRucSel = '';
  proveedorManualRuc = '';
  proveedorManualNombre = '';
  consultandoRuc = false;
  rucNoEncontrado = false;
  private ultimoRucConsultado = '';

  sincronizadoXml = false;
  parseandoXml = false;
  private snapshotPreSync: {
    form: any; items: any[]; itemsModificados: boolean;
    proveedorMode: 'mantener' | 'registrados' | 'manual';
    proveedorRucSel: string; proveedorManualRuc: string; proveedorManualNombre: string;
  } | null = null;

  archivos: Record<FileKind, { modo: FileModo; file: File | null; actualUrl: string | null }> = {
    xml: { modo: 'mantener', file: null, actualUrl: null },
    pdf: { modo: 'mantener', file: null, actualUrl: null },
    imagen: { modo: 'mantener', file: null, actualUrl: null },
  };
  fileKinds: FileKind[] = ['xml', 'pdf', 'imagen'];

  editForm: FormGroup = this.fb.group({
    tipo_comprobante: ['01', Validators.required],
    serie: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{1,10}$/)]],
    correlativo: ['', [Validators.required, Validators.pattern(/^\d{1,20}$/)]],
    fecha_emision: ['', Validators.required],
    fecha_vencimiento: [''],
    forma_pago: ['CONTADO', Validators.required],
    moneda: ['PEN'],
    documento_relacionado: [''],
    enlace_verificacion: [''],
    observaciones: [''],
    items: this.fb.array([]),
  });

  ngOnInit() {
    const c = this.compra;
    this.archivos.xml.actualUrl = (c as any).xml_url ?? (c as any).archivo_xml ?? null;
    this.archivos.pdf.actualUrl = (c as any).pdf_url ?? (c as any).archivo_pdf ?? null;
    this.archivos.imagen.actualUrl = (c as any).image_url ?? null;

    this.editForm.patchValue({
      tipo_comprobante: c.tipo_comprobante || '01',
      serie: c.serie || '',
      correlativo: c.correlativo || '',
      fecha_emision: c.fecha_emision || '',
      fecha_vencimiento: c.fecha_vencimiento || '',
      forma_pago: c.forma_pago || 'CONTADO',
      moneda: c.moneda || 'PEN',
      documento_relacionado: c.documento_relacionado || '',
      enlace_verificacion: c.enlace_verificacion || '',
      observaciones: c.observaciones || '',
    });

    const arr = this.editForm.get('items') as FormArray;
    arr.clear();
    this.setItems((c.items || []).map((it: any) => ({
      descripcion: it.descripcion ?? it.producto ?? '',
      codigo: it.codigo ?? '',
      cantidad: it.cantidad ?? 1,
      precio_unitario: it.precio_unitario ?? 0,
      descuento: it.descuento ?? 0,
    })));

    this.store.dispatch(loadProveedores());
    this.store.select(selectProveedores)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state: any) => {
        this.proveedores = state?.proveedores ?? [];
        this.cdr.detectChanges();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get items(): FormArray {
    return this.editForm.get('items') as FormArray;
  }

  private setItems(list: any[]) {
    const arr = this.editForm.get('items') as FormArray;
    arr.clear();
    list.forEach((d: any) => arr.push(this.crearItemGroup({
      descripcion: d.descripcion ?? d.producto ?? '',
      codigo: d.codigo ?? '',
      cantidad: d.cantidad ?? 1,
      precio_unitario: d.precio_unitario ?? 0,
      descuento: d.descuento ?? 0,
    })));
  }

  get f() {
    return this.editForm.controls;
  }

  private crearItemGroup(d: any): FormGroup {
    const g = this.fb.group({
      descripcion: [d.descripcion || '', Validators.required],
      codigo: [d.codigo || ''],
      cantidad: [d.cantidad ?? 1, [Validators.required, Validators.min(1)]],
      precio_unitario: [d.precio_unitario ?? 0, [Validators.required, Validators.min(0.01)]],
      descuento: [d.descuento ?? 0, [Validators.min(0)]],
    });
    g.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.itemsModificados = true;
    });
    return g;
  }

  agregarItem() {
    this.items.push(this.crearItemGroup({ descripcion: '', cantidad: 1, precio_unitario: 0, descuento: 0 }));
    this.itemsModificados = true;
  }

  eliminarItem(index: number) {
    this.items.removeAt(index);
    this.itemsModificados = true;
  }

  get totales() {
    let bruto = 0;
    let dctos = 0;
    this.items.controls.forEach((it) => {
      bruto += (Number(it.get('cantidad')?.value) || 0) * (Number(it.get('precio_unitario')?.value) || 0);
      dctos += Number(it.get('descuento')?.value) || 0;
    });
    const gravadas = parseFloat((bruto - dctos).toFixed(2));
    const igv = parseFloat((gravadas * 0.18).toFixed(2));
    return { gravadas, igv, total: parseFloat((gravadas + igv).toFixed(2)), dctos: parseFloat(dctos.toFixed(2)) };
  }

  // ---------- Proveedor ----------
  getProveedorNombre(): string {
    if (this.compra.nombre_proveedor) return this.compra.nombre_proveedor;
    const p = this.compra.proveedor;
    if (typeof p === 'string') return p;
    if (p && typeof p === 'object') return p.nombre || 'Sin proveedor';
    return 'Sin proveedor';
  }

  getProveedorDoc(): string {
    if (this.compra.numero_documento_proveedor) return this.compra.numero_documento_proveedor;
    const p = this.compra.proveedor;
    if (p && typeof p === 'object') return (p as any).numero_documento || (p as any).ruc || '-';
    return '-';
  }

  setProveedorMode(m: 'mantener' | 'registrados' | 'manual') {
    this.proveedorMode = m;
  }

  get proveedorSeleccionado(): Proveedor | null {
    return this.proveedores.find((x) => x.ruc === this.proveedorRucSel) ?? null;
  }

  private buildProveedor(): UpdateCompra['proveedor'] | undefined {
    if (this.proveedorMode === 'registrados') {
      const sel = this.proveedorSeleccionado;
      return sel ? { id: sel.id } : undefined;
    }
    if (this.proveedorMode === 'manual') {
      const ruc = (this.proveedorManualRuc || '').trim();
      const nombre = (this.proveedorManualNombre || '').trim();
      if (!ruc && !nombre) return undefined;
      return {
        ...(nombre ? { nombre } : {}),
        tipo_documento: '07',
        ...(ruc ? { numero_documento: ruc } : {}),
      };
    }
    return undefined;
  }

  private rucEfectivo(): string {
    if (this.proveedorMode === 'manual') return (this.proveedorManualRuc || '').trim();
    if (this.proveedorMode === 'registrados') return (this.proveedorSeleccionado?.ruc || '').trim();
    return (this.compra.numero_documento_proveedor
      || (this.compra.proveedor && typeof this.compra.proveedor === 'object'
        ? ((this.compra.proveedor as any).numero_documento || (this.compra.proveedor as any).ruc || '')
        : '') || '').trim();
  }

  // ---------- RUC manual con consulta a la API (razón social bloqueada) ----------
  onManualRucChange(valor: string) {
    const ruc = (valor || '').trim();
    this.rucNoEncontrado = false;
    if (ruc.length !== 11 || ruc === this.ultimoRucConsultado) {
      if (ruc.length !== 11) {
        this.ultimoRucConsultado = '';
        this.proveedorManualNombre = '';
      }
      return;
    }
    this.ultimoRucConsultado = ruc;
    this.consultandoRuc = true;
    this.cdr.detectChanges();
    this.consultaService.consultarRUC(ruc).pipe(
      timeout(5000),
      takeUntil(this.destroy$),
      finalize(() => {
        this.consultandoRuc = false;
        this.cdr.detectChanges();
      }),
      catchError(() => {
        this.rucNoEncontrado = true;
        return of(null);
      })
    ).subscribe((response: any) => {
      const nombre = response?.nombre_o_razon_social || response?.nombre_completo || '';
      if (nombre) {
        this.rucNoEncontrado = false;
        this.proveedorManualNombre = nombre;
      } else {
        this.rucNoEncontrado = true;
        this.proveedorManualNombre = '';
      }
      this.cdr.detectChanges();
    });
  }

  // ---------- Sincronizar datos desde el XML / restaurar anteriores ----------
  async sincronizarXml() {
    const file = this.archivos.xml.modo === 'reemplazar' ? this.archivos.xml.file : null;
    if (!file) return;
    this.parseandoXml = true;
    this.cdr.detectChanges();
    try {
      const datos = await parseXmlCompra(file);
      const tipoForm = this.editForm.get('tipo_comprobante')?.value || '01';
      const xmlTipo = (datos.tipo_comprobante || '').trim();
      if (xmlTipo !== tipoForm) {
        this.alerts.open('El XML no coincide con el tipo', {
          label: 'Sube el XML correcto para este comprobante.',
          appearance: 'error'
        }).subscribe();
        return;
      }
      const xmlRuc = (datos.numero_documento_proveedor || '').trim();
      const { items, ...resto } = this.editForm.value;
      this.snapshotPreSync = {
        form: { ...resto },
        items: (items || []).map((it: any) => ({ ...it })),
        itemsModificados: this.itemsModificados,
        proveedorMode: this.proveedorMode,
        proveedorRucSel: this.proveedorRucSel,
        proveedorManualRuc: this.proveedorManualRuc,
        proveedorManualNombre: this.proveedorManualNombre,
      };
      // El sincronizar siempre reemplaza: el RUC del XML sobrescribe
      // cualquier RUC puesto a mano (igual que al crear).
      if (xmlRuc) {
        this.proveedorMode = 'manual';
        this.proveedorManualRuc = xmlRuc;
        this.proveedorManualNombre = datos.nombre_proveedor || '';
        this.ultimoRucConsultado = xmlRuc;
        this.rucNoEncontrado = false;
      }
      this.editForm.patchValue({
        serie: (datos.serie || '').toUpperCase(),
        correlativo: datos.correlativo || '',
        fecha_emision: datos.fecha_emision || '',
        moneda: datos.moneda || 'PEN',
        forma_pago: datos.forma_pago || 'CONTADO',
      });
      this.setItems((datos.items || []).map((it: any) => ({
        descripcion: it.producto || '',
        cantidad: it.cantidad ?? 1,
        precio_unitario: it.precio_unitario ?? 0,
        descuento: it.descuento ?? 0,
      })));
      this.itemsModificados = true;
      this.sincronizadoXml = true;
      this.alerts.open('Sincronizado', {
        label: `${(datos.items || []).length} producto(s) importado(s) del XML`,
        appearance: 'success'
      }).subscribe();
    } catch (error: any) {
      this.alerts.open('Error al sincronizar', {
        label: error.message || 'No se pudo parsear el XML',
        appearance: 'error'
      }).subscribe();
    } finally {
      this.parseandoXml = false;
      this.cdr.detectChanges();
    }
  }

  restaurarPrevio() {
    if (!this.snapshotPreSync) return;
    this.editForm.patchValue(this.snapshotPreSync.form);
    this.setItems(this.snapshotPreSync.items);
    this.itemsModificados = this.snapshotPreSync.itemsModificados;
    this.proveedorMode = this.snapshotPreSync.proveedorMode;
    this.proveedorRucSel = this.snapshotPreSync.proveedorRucSel;
    this.proveedorManualRuc = this.snapshotPreSync.proveedorManualRuc;
    this.proveedorManualNombre = this.snapshotPreSync.proveedorManualNombre;
    this.ultimoRucConsultado = (this.snapshotPreSync.proveedorManualRuc || '').trim();
    this.snapshotPreSync = null;
    this.sincronizadoXml = false;
    this.cdr.detectChanges();
  }

  // ---------- Archivos por kind ----------
  onFileSelected(kind: FileKind, event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    const okExt = kind === 'xml'
      ? (file.type === 'text/xml' || file.name.endsWith('.xml'))
      : kind === 'pdf'
        ? (file.type === 'application/pdf' || file.name.endsWith('.pdf'))
        : (file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name));
    if (!okExt) {
      this.alerts.open('Archivo invalido', {
        label: kind === 'xml' ? 'Solo .xml' : kind === 'pdf' ? 'Solo .pdf' : 'Solo .jpg/.jpeg/.png/.webp',
        appearance: 'warning'
      }).subscribe();
      return;
    }
    this.archivos[kind] = { ...this.archivos[kind], modo: 'reemplazar', file };
    this.cdr.detectChanges();
  }

  marcarQuitar(kind: FileKind) {
    this.archivos[kind] = { ...this.archivos[kind], modo: 'quitar', file: null };
  }

  restaurar(kind: FileKind) {
    this.archivos[kind] = { ...this.archivos[kind], modo: 'mantener', file: null };
  }

  // ---------- Guardar (PATCH parcial) ----------
  async guardar() {
    this.submitted = true;
    this.editForm.markAllAsTouched();
    this.items.controls.forEach((i) => i.markAllAsTouched());

    if (this.editForm.invalid) {
      this.alerts.open('Revisa el formulario', {
        label: 'Hay campos obligatorios incompletos',
        appearance: 'warning'
      }).subscribe();
      return;
    }
    if (this.itemsModificados && this.items.length === 0) {
      this.alerts.open('Sin productos', {
        label: 'Agrega al menos un producto o cierra sin guardar',
        appearance: 'warning'
      }).subscribe();
      return;
    }

    const f = this.editForm.value;
    const cambios: UpdateCompra = {
      tipo_comprobante: f.tipo_comprobante,
      serie: (f.serie || '').trim().toUpperCase(),
      correlativo: (f.correlativo || '').trim(),
      fecha_emision: f.fecha_emision,
      forma_pago: f.forma_pago,
      moneda: f.moneda,
      documento_relacionado: f.documento_relacionado || null,
      enlace_verificacion: f.enlace_verificacion || null,
      observaciones: f.observaciones || '',
    };
    if (f.fecha_vencimiento) cambios.fecha_vencimiento = f.fecha_vencimiento;

    const prov = this.buildProveedor();
    if (prov) cambios.proveedor = prov;

    if (this.itemsModificados) {
      cambios.items = this.items.controls.map((it) => ({
        cantidad: Number(it.get('cantidad')?.value),
        precio_unitario: Number(it.get('precio_unitario')?.value),
        descuento: Number(it.get('descuento')?.value) || 0,
        descripcion: it.get('descripcion')?.value || '',
        ...(it.get('codigo')?.value ? { codigo: it.get('codigo')?.value } : {}),
      }));
    }

    // XML nuevo: debe coincidir tipo y RUC
    const xmlFile = this.archivos.xml.modo === 'reemplazar' ? this.archivos.xml.file : null;
    if (xmlFile) {
      let datos;
      try {
        datos = await parseXmlCompra(xmlFile);
      } catch (error: any) {
        this.alerts.open('No se pudo leer el XML', {
          label: error.message || 'Sube un XML válido',
          appearance: 'error'
        }).subscribe();
        return;
      }
      const xmlTipo = (datos.tipo_comprobante || '').trim();
      if (xmlTipo !== cambios.tipo_comprobante) {
        this.alerts.open('El XML no coincide con el tipo', {
          label: 'Sube el XML correcto para este comprobante.',
          appearance: 'error'
        }).subscribe();
        return;
      }
      const xmlRuc = (datos.numero_documento_proveedor || '').trim();
      const rucEff = this.rucEfectivo();
      if (xmlRuc && rucEff && xmlRuc !== rucEff) {
        this.alerts.open('El RUC no coincide con el XML', {
          label: `El comprobante es de ${rucEff} pero el XML es de ${xmlRuc}.`,
          appearance: 'error'
        }).subscribe();
        return;
      }
      cambios.xml = xmlFile;
    }

    const pdfFile = this.archivos.pdf.modo === 'reemplazar' ? this.archivos.pdf.file : null;
    if (pdfFile) cambios.pdf = pdfFile;
    const imgFile = this.archivos.imagen.modo === 'reemplazar' ? this.archivos.imagen.file : null;
    if (imgFile) cambios.imagen = imgFile;

    if (this.archivos.xml.modo === 'quitar') cambios.eliminar_xml = true;
    if (this.archivos.pdf.modo === 'quitar') cambios.eliminar_pdf = true;
    if (this.archivos.imagen.modo === 'quitar') cambios.eliminar_imagen = true;

    this.store.dispatch(editarCompra({ id: this.compra.id, cambios }));
    this.actions$.pipe(ofType(editarCompraExito), takeUntil(this.destroy$)).subscribe(() => {
      this.context.completeWith(true);
    });
  }

  cerrar() {
    this.context.completeWith(false);
  }
}
