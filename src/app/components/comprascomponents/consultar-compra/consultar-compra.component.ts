import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { tienePermiso } from '@/app/models/permissions.catalog';
import { AppState } from '@/app/state/app.state';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';
import { Store } from '@ngrx/store';
import { TuiLoader, TuiTextfield, TuiAlertService } from '@taiga-ui/core';
import { Subject, takeUntil, finalize, distinctUntilChanged, filter } from 'rxjs';
import { CompraService } from '@/app/services/compra.service';
import { ConsultaService } from '@/app/services/consultas.service';
import { ValidarCompraResponse } from '@/app/models/compra.models';

@Component({
  selector: 'app-consultar-compra',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiLoader,
    TuiTextfield,
  ],
  templateUrl: './consultar-compra.component.html',
  styleUrl: './consultar-compra.component.scss',
})
export class ConsultarCompraComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private compraService = inject(CompraService);
  private consultaService = inject(ConsultaService);
  private alerts = inject(TuiAlertService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();
  private store = inject(Store<AppState>);

  user$ = this.store.select(selectCurrenttUser);
  tiene = tienePermiso;

  form = this.fb.group({
    rucProveedor: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    serie: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{1,10}$/)]],
    correlativo: ['', [Validators.required, Validators.pattern(/^\d{1,20}$/)]],
    total: ['', [Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
  });

  validando = false;
  guardando = false;
  consultandoRuc = false;
  proveedorNombre: string | null = null;
  proveedorNoEncontrado = false;
  resultado: ValidarCompraResponse | null = null;
  errorMsg: string | null = null;
  guardadoXmlUrl: string | null = null;
  pdfFile: File | null = null;
  xmlFile: File | null = null;

  get puedeValidar(): boolean {
    return this.form.valid && !this.validando && !this.guardando;
  }

  get esValido(): boolean {
    return !!this.resultado?.valido;
  }

  ngOnInit(): void {
    this.form
      .get('rucProveedor')
      ?.valueChanges.pipe(
        takeUntil(this.destroy$),
        distinctUntilChanged(),
        filter((v): v is string => !!v && v.trim().length === 11)
      )
      .subscribe((ruc: string) => this.buscarProveedor(ruc.trim()));
  }

  buscarProveedor(ruc: string): void {
    this.consultandoRuc = true;
    this.proveedorNoEncontrado = false;
    this.cdr.markForCheck();
    this.consultaService
      .consultarRUC(ruc)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.consultandoRuc = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (res) => {
          const nombre = res?.nombre_o_razon_social || res?.nombre_completo || '';
          this.proveedorNombre = nombre || null;
          this.proveedorNoEncontrado = !nombre;
          this.cdr.markForCheck();
        },
        error: () => {
          this.proveedorNombre = null;
          this.proveedorNoEncontrado = true;
          this.cdr.markForCheck();
        },
      });
  }

  validar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.validando = true;
    this.errorMsg = null;
    this.resultado = null;
    this.guardadoXmlUrl = null;

    this.compraService
      .validarCompra(this.payload())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.validando = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (res) => {
          this.resultado = res;
          this.cdr.markForCheck();
        },
        error: (err) => {
          // El backend responde 400 con el mismo shape (incluye codigo/mensaje/detalle de SUNAT)
          const body = err?.error;
          if (body && typeof body === 'object' && ('mensaje' in body || 'codigo' in body)) {
            this.resultado = body as ValidarCompraResponse;
          } else {
            this.errorMsg = (typeof body === 'string' ? body : body?.error) || 'No se pudo validar el comprobante';
          }
          this.cdr.markForCheck();
        },
      });
  }

  async guardar(): Promise<void> {
    if (!this.resultado?.valido || this.guardando) return;

    this.errorMsg = null;

    // El XML del proveedor es obligatorio (SUNAT lo exige); el PDF es opcional.
    if (!this.xmlFile) {
      this.errorMsg = 'Adjunta el XML del proveedor: es obligatorio para registrar la compra.';
      this.cdr.markForCheck();
      return;
    }

    // Verificar que el XML coincida con lo ingresado (RUC, serie, correlativo, monto).
    let datos;
    try {
      datos = await this.leerDatosXml(this.xmlFile);
    } catch (e: any) {
      this.errorMsg = e?.message || 'No se pudo leer el XML adjuntado';
      this.cdr.markForCheck();
      return;
    }
    const fRuc = (this.form.value.rucProveedor || '').trim();
    const fSerie = (this.form.value.serie || '').trim().toUpperCase();
    const fCorr = this.normalizarCorr(this.form.value.correlativo || '');
    const fTotal = this.form.value.total ? Number(this.form.value.total) : null;
    const difs: string[] = [];
    if (datos.ruc !== fRuc) difs.push(`RUC: XML ${datos.ruc || '—'} vs ingresado ${fRuc}`);
    if (datos.serie !== fSerie) difs.push(`Serie: XML ${datos.serie} vs ${fSerie}`);
    if (this.normalizarCorr(datos.correlativo) !== fCorr) difs.push(`Correlativo: XML ${datos.correlativo} vs ${this.form.value.correlativo}`);
    if (datos.total !== null && fTotal !== null && Math.abs(datos.total - fTotal) > 0.005) {
      difs.push(`Monto: XML S/ ${datos.total} vs S/ ${fTotal}`);
    }
    if (difs.length) {
      this.errorMsg = `El XML no coincide: ${difs.join(' · ')}`;
      this.cdr.markForCheck();
      return;
    }

    this.guardando = true;

    this.compraService
      .guardarEnSunat(this.payload())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (sunat) => {
          this.compraService
            .guardarCompra({
              rucProveedor: this.form.value.rucProveedor!,
              tipo_comprobante: '01',
              serie: this.form.value.serie!,
              correlativo: this.form.value.correlativo!,
              total: this.form.value.total ? Number(this.form.value.total) : 0,
              xml_constancia: sunat.xml_url,
              estado_codigo: sunat.estado_codigo,
              estado_descripcion: sunat.estado_descripcion,
            })
            .pipe(
              takeUntil(this.destroy$),
              finalize(() => {
                this.guardando = false;
                this.cdr.markForCheck();
              })
            )
            .subscribe({
              next: (res: any) => {
                const id = res?.comprobante?.id;
                this.guardadoXmlUrl = sunat.xml_url;
                if ((this.pdfFile || this.xmlFile) && id) {
                  this.compraService
                    .subirArchivos(id, { pdf: this.pdfFile, xml: this.xmlFile })
                    .pipe(takeUntil(this.destroy$))
                    .subscribe({
                      next: () => {
                        this.pdfFile = null;
                        this.xmlFile = null;
                        this.alerts.open('Compra guardada', { label: `${sunat.estado_descripcion} · Archivos adjuntados`, appearance: 'success' }).subscribe();
                        this.cdr.markForCheck();
                      },
                      error: (err2) => {
                        const b2 = err2?.error || {};
                        this.errorMsg = `Registro guardado, pero falló la subida: ${b2.error || b2.detalle || 'revisa Mis compras'}`;
                        this.cdr.markForCheck();
                      },
                    });
                } else {
                  this.alerts.open('Compra guardada', { label: sunat.estado_descripcion || 'Validada y guardada', appearance: 'success' }).subscribe();
                }
                this.cdr.markForCheck();
              },
              error: (err) => {
                // Mensaje exacto de SUNAT: message + codigo + error
                const b = err?.error || {};
                const partes = [b.message, b.codigo ? `(${b.codigo})` : '', b.error || b.detalle].filter(Boolean);
                this.errorMsg = partes.length ? partes.join(' ') : 'SUNAT validó, pero no se pudo guardar el registro';
                this.cdr.markForCheck();
              },
            });
        },
        error: (err) => {
          this.guardando = false;
          const b = err?.error || {};
          const partes = [b.message, b.codigo ? `(${b.codigo})` : '', b.error || b.detalle].filter(Boolean);
          this.errorMsg = partes.length ? partes.join(' ') : 'No se pudo guardar en SUNAT';
          this.cdr.markForCheck();
        },
      });
  }

  limpiar(): void {
    this.form.reset({ rucProveedor: '', serie: '', correlativo: '', total: '' });
    this.resultado = null;
    this.errorMsg = null;
    this.guardadoXmlUrl = null;
    this.proveedorNombre = null;
    this.proveedorNoEncontrado = false;
    this.pdfFile = null;
    this.xmlFile = null;
  }

  onFileSelected(event: Event, kind: 'pdf' | 'xml'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file) return;
    const okExt = kind === 'pdf' ? /\.pdf$/i.test(file.name) : /\.xml$/i.test(file.name);
    if (!okExt) {
      this.alerts.open('Archivo inválido', { label: kind === 'pdf' ? 'Solo se permite PDF' : 'Solo se permite XML', appearance: 'error' }).subscribe();
      return;
    }
    if (kind === 'pdf') this.pdfFile = file;
    else this.xmlFile = file;
    this.cdr.markForCheck();
  }

  quitarArchivo(kind: 'pdf' | 'xml'): void {
    if (kind === 'pdf') this.pdfFile = null;
    else this.xmlFile = null;
    this.cdr.markForCheck();
  }

  private leerDatosXml(file: File): Promise<{ ruc: string; serie: string; correlativo: string; total: number | null }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const doc = new DOMParser().parseFromString(String(reader.result ?? ''), 'application/xml');
          if (doc.getElementsByTagName('parsererror').length) {
            reject(new Error('El archivo no es un XML válido'));
            return;
          }
          const local = (el: Element) => el.localName || (el.tagName.split(':').pop() ?? '');
          const root = doc.documentElement;

          let numero = '';
          for (const child of Array.from(root.children)) {
            if (local(child) === 'ID' && (child.textContent || '').trim()) {
              numero = (child.textContent || '').trim();
              break;
            }
          }
          if (!numero || !numero.includes('-')) {
            reject(new Error('No se pudo leer serie-correlativo del XML'));
            return;
          }
          const [serie, ...corrParts] = numero.split('-');

          let ruc = '';
          const parties = Array.from(doc.getElementsByTagNameNS('*', 'AccountingSupplierParty'));
          const scope: Element[] = parties.length ? [parties[0]] : [root];
          const all = Array.from(scope[0].getElementsByTagName('*'));
          for (const el of all) {
            if (local(el) === 'ID' && /^\d+$/.test((el.textContent || '').trim())) {
              const v = (el.textContent || '').trim();
              if (el.getAttribute('schemeID') === '6' || v.length === 11) {
                ruc = v;
                break;
              }
              if (!ruc) ruc = v;
            }
          }
          if (!ruc) {
            const ep = Array.from(scope[0].getElementsByTagNameNS('*', 'EndpointID'))[0];
            if (ep?.textContent?.trim()) ruc = ep.textContent.trim();
          }

          let total: number | null = null;
          const pay = Array.from(doc.getElementsByTagNameNS('*', 'PayableAmount'))[0];
          if (pay?.textContent?.trim() && !isNaN(Number(pay.textContent.trim()))) {
            total = Number(pay.textContent.trim());
          }
          resolve({ ruc, serie: serie.trim().toUpperCase(), correlativo: corrParts.join('-').trim(), total });
        } catch {
          reject(new Error('No se pudo leer el XML'));
        }
      };
      reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
      reader.readAsText(file);
    });
  }

  private normalizarCorr(v: string): string {
    const t = (v || '').trim();
    return /^\d+$/.test(t) ? String(Number(t)) : t.toUpperCase();
  }

  private payload() {
    return {
      rucProveedor: this.form.value.rucProveedor!.trim(),
      tipoDoc: '01',
      serie: this.form.value.serie!.trim().toUpperCase(),
      correlativo: Number(this.form.value.correlativo),
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
