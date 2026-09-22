import { GuiaRemisionItem } from '@/app/models/guia-remision.models';
import { crearGuia, crearGuiaError, crearGuiaExito } from '@/app/state/actions/guia-remision.actions';
import { AppState } from '@/app/state/app.state';
import { GuiaRemisionService } from '@/app/services/guia-remision.service';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiAlertService } from '@taiga-ui/core';
import { Observable, Subject, of, take, takeUntil } from 'rxjs';
import { catchError, distinctUntilChanged, filter, finalize, timeout } from 'rxjs/operators';
import { ConsultaService } from '@/app/services/consultas.service';

interface ItemForm extends GuiaRemisionItem {
  cod_sunat?: string;
}

@Component({
  selector: 'app-formguia',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formguia.component.html',
  styleUrl: './formguia.component.scss',
})
export class FormguiaComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private store = inject(Store<AppState>);
  private actions$ = inject(Actions);
  private guiaService = inject(GuiaRemisionService);
  private consultaService = inject(ConsultaService);
  private alerts = inject(TuiAlertService);
  private destroy$ = new Subject<void>();

  consultandoDest = false;
  destNoEncontrado = false;

  @Output() cancelar = new EventEmitter<void>();

  hoy = new Date().toISOString().split('T')[0];
  correlativoSugerido = '';
  registrando = false;

  form: FormGroup = this.fb.group({
    serie: ['T001', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{4}$/)]],
    mod_traslado: ['02', Validators.required],
    cod_traslado: ['01'],
    des_traslado: ['VENTA', Validators.required],
    fec_traslado: [this.hoy, [Validators.required, this.fechaTrasladoValidator]],
    observacion: [''],

    dest_tipo_doc: ['6', Validators.required],
    dest_num_doc: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
    dest_nombre: ['', Validators.required],
    dest_direccion: [''],

    partida_ubigeo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    partida_direccion: ['', Validators.required],
    partida_cod_local: [''],
    partida_ruc: [''],
    llegada_ubigeo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    llegada_direccion: ['', Validators.required],
    llegada_cod_local: [''],
    llegada_ruc: [''],

    emisor_ubigeo: [''],
    emisor_departamento: [''],
    emisor_provincia: [''],
    emisor_distrito: [''],
    emisor_direccion: [''],
    emisor_nombre_comercial: [''],

    transp_tipo_doc: ['6'],
    transp_num_doc: [''],
    transp_nombre: [''],
    transp_nro_mtc: [''],

    vehiculo_placa: ['', [
      Validators.required,
      // Placas Perú sin guion: ABC123 / ABC1234 (auto, camión), AB1234 / 1234AB (moto)
      Validators.pattern(/^([A-Z]{3}\d{3,4}|[A-Z]{2}\d{4}|\d{4}[A-Z]{2})$/i),
    ]],
    vehiculo_nro_circulacion: [''],
    vehiculo_nro_autorizacion: [''],
    vehiculo_cod_emisor: [''],

    cond_tipo_doc: ['01', Validators.required],
    cond_nro_doc: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    cond_nombres: ['', Validators.required],
    cond_apellidos: ['', Validators.required],
    cond_licencia: ['', [Validators.required, Validators.pattern(/^[A-Z0-9]+$/i)]],

    peso_total: [null as number | null, [Validators.required, Validators.min(0.01)]],
    num_bultos: [null as number | null],
    enviar: [true],
  }, { validators: [this.localRucValidator] });

  /** Se activa al intentar registrar con items incompletos. */
  mostrarErroresItems = false;

  get itemsValidos(): boolean {
    return this.items.some(i => i.codigo?.trim() && i.descripcion?.trim() && Number(i.cantidad) > 0);
  }

  get puedeEnviar(): boolean {
    return this.form.valid && this.itemsValidos && !this.registrando;
  }

  items: ItemForm[] = [
    { codigo: '', descripcion: '', unidad_medida: 'NIU', cantidad: 1, cod_sunat: '' },
  ];

  unidadesMedida = ['NIU', 'KGM', 'PIEZA', 'CAJA', 'GALON', 'JUEGO', 'METRO', 'ROLLO', 'PAR', 'DOCENA'];

  get esPublico(): boolean {
    return this.form.get('mod_traslado')?.value === '01';
  }

  ngOnInit(): void {
    this.form.get('serie')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((s) => {
      if (s?.length === 4) this.cargarCorrelativo(s);
    });
    this.form.get('mod_traslado')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.actualizarValidadoresTransportista();
    });
    this.form.get('dest_tipo_doc')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.actualizarValidadoresDest();
    });
    this.cargarCorrelativo('T001');

    // Autocompletar destinatario al escribir RUC/DNI
    this.form.get('dest_num_doc')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      filter((v: string) => !!v && (String(v).length === 8 || String(v).length === 11))
    ).subscribe((v: string) => this.consultarDestinatario(String(v).trim()));

    // Autocompletar transportista (RUC) en modo público
    this.form.get('transp_num_doc')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      filter((v: string) => !!v && String(v).length === 11)
    ).subscribe((v: string) => this.consultarTransportista(String(v).trim()));

    // Autocompletar conductor (DNI)
    this.form.get('cond_nro_doc')?.valueChanges.pipe(
      takeUntil(this.destroy$),
      distinctUntilChanged(),
      filter((v: string) => !!v && String(v).length === 8)
    ).subscribe((v: string) => this.consultarConductor(String(v).trim()));
  }

  private consultarDocumento(numero: string): Observable<any> | null {
    if (numero.length === 8) return this.consultaService.consultarDNI(numero);
    if (numero.length === 11) return this.consultaService.consultarRUC(numero);
    return null;
  }

  private consultarDestinatario(numero: string): void {
    const obs = this.consultarDocumento(numero);
    if (!obs) return;
    this.consultandoDest = true;
    this.destNoEncontrado = false;
    obs.pipe(
      timeout(5000),
      takeUntil(this.destroy$),
      finalize(() => { this.consultandoDest = false; }),
      catchError(() => {
        this.destNoEncontrado = true;
        return of(null);
      })
    ).subscribe((res: any) => {
      const nombre = res?.nombre_o_razon_social || res?.nombre_completo || '';
      if (nombre) {
        this.destNoEncontrado = false;
        this.form.patchValue({ dest_nombre: nombre }, { emitEvent: false });
      } else {
        this.destNoEncontrado = true;
      }
    });
  }

  private consultarTransportista(ruc: string): void {
    this.consultaService.consultarRUC(ruc).pipe(
      timeout(5000),
      takeUntil(this.destroy$),
      catchError(() => of(null))
    ).subscribe((res: any) => {
      const nombre = res?.nombre_o_razon_social || res?.nombre_completo || '';
      if (nombre) this.form.patchValue({ transp_nombre: nombre }, { emitEvent: false });
    });
  }

  private consultarConductor(dni: string): void {
    this.consultaService.consultarDNI(dni).pipe(
      timeout(5000),
      takeUntil(this.destroy$),
      catchError(() => of(null))
    ).subscribe((res: any) => {
      const nombre = res?.nombre_completo || res?.nombre_o_razon_social || '';
      if (!nombre) return;
      // RENIEC responde "APELLIDOS, NOMBRES": respetar ese orden y quitar comas
      const sinComas = nombre.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
      let nombres = sinComas;
      let apellidos = '';
      if (nombre.includes(',')) {
        const [izq, der] = nombre.split(',').map((s: string) => s.replace(/\s+/g, ' ').trim());
        apellidos = izq || '';
        nombres = der || '';
      } else {
        const partes = sinComas.split(' ');
        if (partes.length >= 3) {
          apellidos = partes.slice(-2).join(' ');
          nombres = partes.slice(0, -2).join(' ');
        } else if (partes.length === 2) {
          nombres = partes[0];
          apellidos = partes[1];
        }
      }
      this.form.patchValue({ cond_nombres: nombres, cond_apellidos: apellidos }, { emitEvent: false });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private cargarCorrelativo(serie: string): void {
    this.guiaService.proximoCorrelativo(serie).pipe(take(1)).subscribe({
      next: (c) => { this.correlativoSugerido = c; },
      error: () => { this.correlativoSugerido = ''; },
    });
  }

  private actualizarValidadoresDest(): void {
    const tipo = this.form.get('dest_tipo_doc')?.value;
    const ctrl = this.form.get('dest_num_doc');
    if (tipo === '1') {
      ctrl?.setValidators([Validators.required, Validators.pattern(/^\d{8}$/)]);
    } else {
      ctrl?.setValidators([Validators.required, Validators.pattern(/^\d{11}$/)]);
    }
    ctrl?.updateValueAndValidity();
    // El nombre depende del documento: si cambia el tipo, se limpia
    this.form.patchValue({ dest_nombre: '' }, { emitEvent: false });
    this.destNoEncontrado = false;
  }

  private actualizarValidadoresTransportista(): void {
    const req = this.esPublico ? [Validators.required] : [];
    this.form.get('transp_num_doc')?.setValidators(req);
    this.form.get('transp_nombre')?.setValidators(req);
    this.form.get('transp_nro_mtc')?.setValidators(req);
    this.form.get('transp_num_doc')?.updateValueAndValidity();
    this.form.get('transp_nombre')?.updateValueAndValidity();
    this.form.get('transp_nro_mtc')?.updateValueAndValidity();
  }

  addItem() {
    this.items.push({ codigo: '', descripcion: '', unidad_medida: 'NIU', cantidad: 1, cod_sunat: '' });
    this.mostrarErroresItems = false;
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.splice(index, 1);
    }
  }

  updateItem(index: number, field: keyof ItemForm, value: any) {
    if (field === 'cantidad') {
      this.items[index][field] = Number(value) || 0;
    } else {
      (this.items[index] as any)[field] = value;
    }
  }

  /** SUNAT error 3343: el inicio del traslado debe ser >= fecha de emisión (hoy). */
  fechaTrasladoValidator(control: any): { [k: string]: boolean } | null {
    if (!control?.value) return null;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const f = new Date(control.value + 'T00:00:00');
    return f < hoy ? { trasladoPasado: true } : null;
  }

  /** SUNAT error 3410: si mandas cod_local debes mandar su ruc (11 dígitos), en partida y llegada. */
  localRucValidator(group: any): { [k: string]: boolean } | null {
    const rucOk = (v: any) => !v || /^\d{11}$/.test(String(v).trim());
    let ok = true;
    const pc = String(group.get('partida_cod_local')?.value ?? '').trim();
    const pr = String(group.get('partida_ruc')?.value ?? '').trim();
    if (pc && !pr) ok = false;
    if (pr && !rucOk(pr)) ok = false;
    const lc = String(group.get('llegada_cod_local')?.value ?? '').trim();
    const lr = String(group.get('llegada_ruc')?.value ?? '').trim();
    if (lc && !lr) ok = false;
    if (lr && !rucOk(lr)) ok = false;
    return ok ? null : { localRuc: true };
  }

  private soloSiHay(v: any): string | undefined {
    const s = String(v ?? '').trim();
    return s ? s : undefined;
  }

  onSubmit() {
    const faltantes = this.camposFaltantes();
    const validos = this.items.filter(i => i.codigo?.trim() && i.descripcion?.trim() && Number(i.cantidad) > 0);
    if (faltantes.length || !validos.length) {
      this.form.markAllAsTouched();
      this.mostrarErroresItems = !validos.length;
      if (!validos.length) faltantes.push('mercaderías (código, descripción y cantidad)');
      console.error('Guía incompleta:', faltantes);
      this.alerts.open('Completa los datos', {
        label: `Falta: ${faltantes.join(', ')}`,
        appearance: 'warning',
      }).subscribe();
      return;
    }
    this.mostrarErroresItems = false;

    const v = this.form.value;
    this.registrando = true;

    this.store.dispatch(crearGuia({
      guia: {
        serie: String(v.serie).toUpperCase(),
        observacion: this.soloSiHay(v.observacion),
        emisor_ubigeo: this.soloSiHay(v.emisor_ubigeo),
        emisor_departamento: this.soloSiHay(v.emisor_departamento),
        emisor_provincia: this.soloSiHay(v.emisor_provincia),
        emisor_distrito: this.soloSiHay(v.emisor_distrito),
        emisor_direccion: this.soloSiHay(v.emisor_direccion),
        emisor_nombre_comercial: this.soloSiHay(v.emisor_nombre_comercial),
        dest_tipo_doc: v.dest_tipo_doc,
        dest_num_doc: String(v.dest_num_doc).trim(),
        dest_nombre: String(v.dest_nombre).trim(),
        dest_direccion: this.soloSiHay(v.dest_direccion),
        mod_traslado: v.mod_traslado,
        cod_traslado: this.soloSiHay(v.cod_traslado),
        des_traslado: this.soloSiHay(v.des_traslado),
        fec_traslado: v.fec_traslado,
        peso_total: Number(v.peso_total),
        und_peso_total: 'KGM',
        ...(Number(v.num_bultos) > 0 ? { num_bultos: Number(v.num_bultos) } : {}),
        partida_ubigeo: String(v.partida_ubigeo).trim(),
        partida_direccion: String(v.partida_direccion).trim(),
        partida_cod_local: this.soloSiHay(v.partida_cod_local),
        partida_ruc: this.soloSiHay(v.partida_ruc),
        llegada_ubigeo: String(v.llegada_ubigeo).trim(),
        llegada_direccion: String(v.llegada_direccion).trim(),
        llegada_cod_local: this.soloSiHay(v.llegada_cod_local),
        llegada_ruc: this.soloSiHay(v.llegada_ruc),
        vehiculo_placa: String(v.vehiculo_placa).toUpperCase().replace(/[^A-Z0-9]/g, ''),
        vehiculo_nro_circulacion: this.soloSiHay(v.vehiculo_nro_circulacion),
        vehiculo_nro_autorizacion: this.soloSiHay(v.vehiculo_nro_autorizacion),
        vehiculo_cod_emisor: this.soloSiHay(v.vehiculo_cod_emisor),
        ...(this.esPublico ? {
          transportista_tipo_doc: v.transp_tipo_doc,
          transportista_num_doc: String(v.transp_num_doc).trim(),
          transportista_nombre: String(v.transp_nombre).trim(),
          transportista_nro_mtc: String(v.transp_nro_mtc).trim(),
        } : {}),
        items: validos.map(i => ({
          codigo: String(i.codigo || '').trim() || 'SIN-COD',
          descripcion: String(i.descripcion).trim(),
          unidad: i.unidad_medida,
          cantidad: Number(i.cantidad),
          ...(i.cod_sunat?.trim() ? { cod_prod_sunat: i.cod_sunat.trim() } : {}),
        })),
        conductores: [{
          tipo: 'Principal',
          tipo_doc: v.cond_tipo_doc,
          nro_doc: String(v.cond_nro_doc).trim(),
          nombres: String(v.cond_nombres).trim(),
          apellidos: String(v.cond_apellidos).trim(),
          licencia: String(v.cond_licencia).trim(),
        }],
        enviar: !!v.enviar,
      }
    }));

    this.actions$.pipe(ofType(crearGuiaExito), take(1), takeUntil(this.destroy$)).subscribe(() => {
      this.registrando = false;
      this.cancelar.emit();
    });
    this.actions$.pipe(ofType(crearGuiaError), take(1), takeUntil(this.destroy$)).subscribe(() => {
      this.registrando = false;
    });
  }

  private camposFaltantes(): string[] {
    const faltan: string[] = [];
    const check = (campo: string, etiqueta: string) => {
      if (this.form.get(campo)?.invalid) faltan.push(etiqueta);
    };
    check('serie', 'serie');
    check('fec_traslado', 'fecha de traslado (hoy o futura)');
    check('dest_num_doc', 'documento destinatario');
    check('dest_nombre', 'nombre destinatario');
    check('partida_ubigeo', 'ubigeo partida');
    check('partida_direccion', 'dirección partida');
    check('llegada_ubigeo', 'ubigeo llegada');
    check('llegada_direccion', 'dirección llegada');
    check('vehiculo_placa', 'placa');
    check('cond_nro_doc', 'documento conductor');
    check('cond_nombres', 'nombres conductor');
    check('cond_apellidos', 'apellidos conductor');
    check('cond_licencia', 'licencia');
    check('peso_total', 'peso total');
    if (this.form.errors?.['localRuc']) faltan.push('RUC de local (11 dígitos si hay cód. local)');
    if (this.esPublico) {
      check('transp_num_doc', 'RUC transportista');
      check('transp_nombre', 'nombre transportista');
      check('transp_nro_mtc', 'N° MTC');
    }
    return faltan;
  }

  /** TEMPORAL: rellena todo menos RUC/DNI (los pone el usuario). */
  rellenarEjemplo() {
    this.form.patchValue({
      serie: 'T001',
      mod_traslado: '02',
      cod_traslado: '01',
      des_traslado: 'VENTA',
      fec_traslado: this.hoy,
      observacion: 'TRASLADO POR VENTA',
      dest_tipo_doc: '6',
      dest_nombre: 'Shalom Empresarial S.A.C.',
      dest_direccion: 'Av. Cliente 123 Lima',
      emisor_ubigeo: '150122',
      emisor_departamento: 'LIMA',
      emisor_provincia: 'LIMA',
      emisor_distrito: 'MIRAFLORES',
      emisor_direccion: 'AV LARCO 123',
      emisor_nombre_comercial: 'MI NEGOCIO SAC',
      partida_ubigeo: '150203',
      partida_direccion: 'AV ITALIA 123',
      partida_cod_local: '',
      partida_ruc: '',
      llegada_ubigeo: '150101',
      llegada_direccion: 'AV LIMA 456',
      llegada_cod_local: '',
      llegada_ruc: '',
      vehiculo_placa: 'ABC123',
      cond_tipo_doc: '01',
      cond_nombres: 'GONZALO AXEL',
      cond_apellidos: 'VALDEZ QUISPE',
      cond_licencia: 'AAAAA',
      peso_total: 12.5,
      num_bultos: 2,
      enviar: true,
    });
    this.items = [
      { codigo: 'PROD1', descripcion: 'PROD 1', unidad_medida: 'NIU', cantidad: 2, cod_sunat: 'P001' },
    ];
    this.mostrarErroresItems = false;
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!(control && control.invalid && control.touched);
  }

  trackByIndex(index: number): number {
    return index;
  }
}
