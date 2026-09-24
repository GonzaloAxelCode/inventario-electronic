import { createTiendaAction, createTiendaFail, createTiendaSuccess, loadTiendasAction } from '@/app/state/actions/tienda.actions';
import { ConsultaService } from '@/app/services/consultas.service';
import { AppState } from '@/app/state/app.state';
import { selectTienda, selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiAppearance, TuiButton, TuiDataList, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiInputPasswordModule, TuiSelectModule } from '@taiga-ui/legacy';
import { TuiDataListWrapper } from '@taiga-ui/kit';
import { map, Observable, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-formaddstore',
  standalone: true,
  imports: [TuiLoader, CommonModule, ReactiveFormsModule, TuiTextfield, TuiInputModule, TuiInputPasswordModule, TuiSelectModule, TuiDataList, TuiDataListWrapper, TuiAppearance, TuiButton],
  templateUrl: './formaddstore.component.html',
  styleUrl: './formaddstore.component.scss'
})
export class FormaddstoreComponent implements OnInit {
  @Output() cancelled = new EventEmitter<void>();
  @Output() created = new EventEmitter<void>();
  /** Padre prefijado al crear sucursal desde su tarjeta: jerarquía bloqueada. */
  @Input() tiendaPadrePreset: any | null = null;
  tiendaForm: FormGroup;
  protected loadingCreateTienda$!: Observable<any>
  // Creación en curso: solo se cierra/limpia al confirmar éxito
  creandoTienda = false;
  createError: string | null = null;
  selectedLogo: File | null = null;
  logoPreview: string | null = null;
  selectedLogoDark: File | null = null;
  logoDarkPreview: string | null = null;
  readonly seriesOptions = ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010'];

  isAdminTienda = false;
  parentTiendaId: number | null = null;
  parentTiendaNombre: string | null = null;
  parentTiendaRazonSocial: string | null = null;
  parentTiendaRuc: string | null = null;
  isSuperUser = false;
  selectedCert: File | null = null;
  certFileName: string | null = null;
  selectedCertPrivada: File | null = null;
  certPrivadaFileName: string | null = null;
  certPrivadaString: string | null = null;
  selectedCertPublica: File | null = null;
  certPublicaFileName: string | null = null;
  certPublicaString: string | null = null;
  tiendasList: any[] = [];
  esSucursal = false;

  // Consulta automática de RUC (SUNAT) para superusuario
  consultandoRuc = false;
  rucConsultadoOk = false;
  rucError: string | null = null;
  private lastQueriedRuc: string | null = null;

  constructor(private store: Store<AppState>, private fb: FormBuilder, private consultaService: ConsultaService, private actions$: Actions) {


    this.tiendaForm = this.fb.group({
      nombre: ['', Validators.required],
      razon_social: ['', Validators.required],
      ruc: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      direccion: ['', Validators.required],
      telefono: [''],
      email: [''],
      activo: [true],
      serie: ["", Validators.required],
      sol_user: [''],
      sol_password: [''],
      tienda_padre_select: [''],
      propietario_username: [''],
      propietario_password: ['']
    });


    this.loadingCreateTienda$ = this.store.select(selectTienda);

  }

  ngOnInit(): void {
    // Sucursal prefijada desde la tarjeta padre: jerarquía bloqueada y datos heredados
    if (this.tiendaPadrePreset?.id != null) {
      const padre = this.tiendaPadrePreset;
      this.esSucursal = true;
      const jerCtrl = this.tiendaForm.get('tienda_padre_select');
      jerCtrl?.setValue(`${padre.nombre} — RUC ${padre.ruc || '—'} · ID ${padre.id}`, { emitEvent: false });
      jerCtrl?.disable({ emitEvent: false });
      this.tiendaForm.patchValue({
        razon_social: padre.razon_social || '',
        ruc: padre.ruc || '',
        sol_user: '',
        sol_password: ''
      }, { emitEvent: false });
      this.actualizarValidadoresPropietario();
    }
    this.store.select(selectCurrenttUser).pipe(map(u => u as any)).subscribe((user: any) => {
      if (!user) return;
      this.isSuperUser = !!user.is_superuser;
      const isAdmin = user.es_propietario === true;
      this.isAdminTienda = !this.isSuperUser && isAdmin;
      if (this.isAdminTienda) {
        const rawId: any = user.tienda;
        this.parentTiendaId = typeof rawId === 'number' ? rawId : rawId?.id ?? user.tienda_data?.id ?? null;
        this.parentTiendaNombre = user.tienda_data?.nombre ?? user.tienda_nombre ?? (this.parentTiendaId ? `Tienda #${this.parentTiendaId}` : null);
        this.parentTiendaRazonSocial = user.tienda_data?.razon_social ?? null;
        this.parentTiendaRuc = user.tienda_data?.ruc ?? null;

        // Auto-fill razon_social and ruc from parent store
        this.tiendaForm.patchValue({
          razon_social: this.parentTiendaRazonSocial || '',
          ruc: this.parentTiendaRuc || ''
        });
      } else {
        this.parentTiendaId = null;
        this.parentTiendaNombre = null;
        this.parentTiendaRazonSocial = null;
        this.parentTiendaRuc = null;
      }
      // Jerarquía visible solo al crear sucursal (valor prefijado y bloqueado);
      // en nueva tienda siempre es padre y el select está oculto, así que sin validador.
      const ctrl = this.tiendaForm.get('tienda_padre_select');
      if (this.isSuperUser && this.esSucursal) {
        ctrl?.setValidators([Validators.required]);
      } else {
        ctrl?.clearValidators();
      }
      ctrl?.updateValueAndValidity({ emitEvent: false });
      this.actualizarValidadoresPropietario();
    });

    this.store.select(selectTiendaState).pipe(map(s => s.tiendas ?? [])).subscribe(tiendas => {
      this.tiendasList = tiendas;
    });
    // Cargar lista para superusuario si aún no se cargó (usa flag, no length: la lista puede ser vacía legítima)
    this.store.select(selectTienda).pipe(map(s => s as any)).subscribe((state: any) => {
      if (this.isSuperUser && !state.tiendasLoaded && !state.loadingTiendas) {
        this.store.dispatch(loadTiendasAction());
      }
    });

    // Éxito: verificar agregada al estado, limpiar y cerrar el modal
    this.actions$.pipe(ofType(createTiendaSuccess)).subscribe(({ tienda }: any) => {
      if (!this.creandoTienda) return;
      this.creandoTienda = false;
      const id = tienda?.id;
      const enEstado = id != null && (this.tiendasList ?? []).some((t: any) => t?.id === id);
      if (!enEstado) {
        // No se refleja en la lista local: recargar desde el backend
        this.store.dispatch(loadTiendasAction());
      }
      this.resetFormularioTienda();
      this.created.emit();
    });

    // Fallo: NO cerrar y NO borrar los datos del formulario
    this.actions$.pipe(ofType(createTiendaFail)).subscribe(() => {
      if (!this.creandoTienda) return;
      this.creandoTienda = false;
      this.createError = 'No se pudo crear la tienda. Revisa los datos e inténtalo de nuevo.';
    });

    // Detectar cambio en Jerarquía: si se selecciona una tienda (sucursal), heredar datos del padre
    this.tiendaForm.get('tienda_padre_select')?.valueChanges.subscribe(value => {
      const pid = this.parseJerarquiaId(value);
      this.esSucursal = pid != null;
      this.actualizarValidadoresPropietario();
      if (this.esSucursal) {
        const selectedTienda = this.tiendasList?.find((t: any) => t.id === pid);
        if (selectedTienda) {
          this.tiendaForm.patchValue({
            razon_social: selectedTienda.razon_social || '',
            ruc: selectedTienda.ruc || '',
            sol_user: '',
            sol_password: ''
          });
        }
      }
    });

    // Superusuario: al completar 11 dígitos del RUC, consultar SUNAT y
    // autocompletar la razón social (el campo queda no editable).
    this.tiendaForm.get('ruc')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(raw => {
      const ruc = String(raw ?? '').trim();
      if (!this.isSuperUser || this.isAdminTienda || this.esSucursal) return;
      if (/^\d{11}$/.test(ruc)) {
        if (ruc !== this.lastQueriedRuc) this.consultarRucTienda(ruc);
      } else {
        // RUC incompleto: desbloquear para no atrapar al usuario
        this.rucConsultadoOk = false;
        this.lastQueriedRuc = null;
        this.rucError = null;
      }
    });
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedLogo = input.files[0];
      const reader = new FileReader();
      reader.onload = e => this.logoPreview = reader.result as string;
      reader.readAsDataURL(this.selectedLogo);
    } else {
      this.selectedLogo = null;
      this.logoPreview = null;
    }
  }

  onLogoDarkSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedLogoDark = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.logoDarkPreview = reader.result as string;
      reader.readAsDataURL(this.selectedLogoDark);
    } else {
      this.selectedLogoDark = null;
      this.logoDarkPreview = null;
    }
  }

  onCertSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedCert = input.files[0];
      this.certFileName = this.selectedCert.name;
    } else {
      this.selectedCert = null;
      this.certFileName = null;
    }
  }

  onCertPrivadaSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedCertPrivada = input.files[0];
      this.certPrivadaFileName = this.selectedCertPrivada.name;
      const reader = new FileReader();
      reader.onload = () => this.certPrivadaString = reader.result as string;
      reader.readAsText(this.selectedCertPrivada);
    } else {
      this.selectedCertPrivada = null;
      this.certPrivadaFileName = null;
      this.certPrivadaString = null;
    }
  }

  onCertPublicaSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedCertPublica = input.files[0];
      this.certPublicaFileName = this.selectedCertPublica.name;
      const reader = new FileReader();
      reader.onload = () => this.certPublicaString = reader.result as string;
      reader.readAsText(this.selectedCertPublica);
    } else {
      this.selectedCertPublica = null;
      this.certPublicaFileName = null;
      this.certPublicaString = null;
    }
  }


  readonly jerarquiaPadreLabel = 'Registrar como tienda Padre';

  get jerarquiaOptions(): string[] {
    const tiendas = (this.tiendasList ?? []).map((t: any) => `${t.nombre} — RUC ${t.ruc || '—'} · ID ${t.id}`);
    return [this.jerarquiaPadreLabel, ...tiendas];
  }

  parseJerarquiaId(value: string | null | undefined): number | null {
    if (!value || value === this.jerarquiaPadreLabel) return null;
    const m = String(value).match(/ID\s+(\d+)\s*$/);
    return m ? Number(m[1]) : null;
  }

  /** Razón social no editable: heredada, de sucursal o autocompletada por SUNAT. */
  get razonSocialBloqueada(): boolean {
    return this.isSuperUser && !this.isAdminTienda && !this.esSucursal &&
      (this.consultandoRuc || this.rucConsultadoOk);
  }

  /** Consulta el RUC en SUNAT y autocompleta la razón social. */
  consultarRucTienda(ruc: string): void {
    this.consultandoRuc = true;
    this.rucError = null;
    this.consultaService.consultarRUC(ruc).subscribe({
      next: (resp: any) => {
        this.consultandoRuc = false;
        const razon = resp?.nombre_o_razon_social || resp?.razon_social ||
          resp?.nombre_completo || resp?.razonSocial || '';
        if (razon) {
          this.lastQueriedRuc = ruc;
          this.rucConsultadoOk = true;
          this.tiendaForm.patchValue({ razon_social: razon }, { emitEvent: false });
        } else {
          this.rucConsultadoOk = false;
          this.rucError = 'SUNAT no devolvió razón social para este RUC. Ingrésala manualmente.';
        }
      },
      error: () => {
        this.consultandoRuc = false;
        this.rucConsultadoOk = false;
        // Fallback: se deja editable para no bloquear la creación sin conexión
        this.rucError = 'No se pudo consultar el RUC. Verifica tu conexión o ingresa la razón social manualmente.';
      }
    });
  }

  /** Propietario obligatorio solo al crear tienda padre (no sucursal). */
  actualizarValidadoresPropietario(): void {
    const visible = !this.esSucursal && !this.isAdminTienda;
    const userCtrl = this.tiendaForm.get('propietario_username');
    const passCtrl = this.tiendaForm.get('propietario_password');
    if (visible) {
      userCtrl?.setValidators([Validators.required]);
      passCtrl?.setValidators([Validators.required]);
    } else {
      userCtrl?.clearValidators();
      passCtrl?.clearValidators();
      userCtrl?.setValue('', { emitEvent: false });
      passCtrl?.setValue('', { emitEvent: false });
    }
    userCtrl?.updateValueAndValidity({ emitEvent: false });
    passCtrl?.updateValueAndValidity({ emitEvent: false });
  }

  /** Consulta manual del RUC (botón lupa): fuerza la consulta aunque ya se haya consultado. */
  consultarRucManual(): void {
    const ruc = String(this.tiendaForm.get('ruc')?.value ?? '').trim();
    this.tiendaForm.get('ruc')?.markAsTouched();
    if (!/^\d{11}$/.test(ruc) || this.consultandoRuc) return;
    this.lastQueriedRuc = null;
    this.consultarRucTienda(ruc);
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onSubmit() {
    if (this.tiendaForm.valid) {
      // Creamos FormData
      const formData = new FormData();
      // Agregamos todos los campos del formulario excepto el select de padre (se maneja aparte)
      // y los datos del propietario (se envían como objeto aparte)
      Object.entries(this.tiendaForm.value).forEach(([key, value]) => {
        if (key === 'tienda_padre_select' || key === 'propietario_username' || key === 'propietario_password') return;
        formData.append(key, value as any);
      });

      // Propietario como objeto { username, password } (JSON en campo multipart)
      if (!this.esSucursal && !this.isAdminTienda) {
        const ownerUser = String(this.tiendaForm.get('propietario_username')?.value ?? '').trim();
        const ownerPass: string = this.tiendaForm.get('propietario_password')?.value ?? '';
        if (ownerUser && ownerPass) {
          formData.append('propietario', JSON.stringify({ username: ownerUser, password: ownerPass }));
        }
      }

      // Superusuario: si elige tienda padre en Jerarquía es sucursal; vacío o Padre = tienda padre
      if (this.isSuperUser) {
        const sel = this.tiendaForm.get('tienda_padre_select')?.value as string;
        const pid = this.parseJerarquiaId(sel);
        if (pid != null) {
          formData.append('tienda_padre', String(pid));
          formData.append('parent', String(pid));
          formData.append('parent_id', String(pid));
          formData.append('tienda_padre_id', String(pid));
          formData.append('es_sucursal', 'true');
          formData.append('es_padre', 'false');
        } else {
          formData.append('es_padre', 'true');
          formData.append('es_sucursal', 'false');
          formData.append('tienda_padre', '');
        }
      } else if (this.isAdminTienda && this.parentTiendaId) {
        // Admin tienda: solo bajo su tienda padre
        formData.append('tienda_padre', String(this.parentTiendaId));
        formData.append('parent', String(this.parentTiendaId));
        formData.append('parent_id', String(this.parentTiendaId));
        formData.append('tienda_padre_id', String(this.parentTiendaId));
      }

      // Agregamos logos si existen
      if (this.selectedLogo) {
        formData.append('logo_img', this.selectedLogo);
        formData.append('logo', this.selectedLogo);
      }
      if (this.selectedLogoDark) {
        formData.append('logo_dark', this.selectedLogoDark);
        formData.append('logo_dark_img', this.selectedLogoDark);
        formData.append('logo_oscuro', this.selectedLogoDark);
      }
      if (this.selectedCert && this.isSuperUser) {
        formData.append('certificado', this.selectedCert);
        formData.append('clave', this.selectedCert);
        formData.append('archivo_sunat', this.selectedCert);
        formData.append('sunat_cert', this.selectedCert);
      }

      // Convertimos los archivos de cert_clave_privada y cert_clave_publica a texto string y los enviamos en el payload
      if (this.certPrivadaString) {
        formData.append('cert_clave_privada', this.certPrivadaString);
      }
      if (this.certPublicaString) {
        formData.append('cert_clave_publica', this.certPublicaString);
      }

      // Despachamos la acción. NO se limpia ni se cierra aquí:
      // en éxito se limpia+cierra, en fallo se conservan los datos.
      this.creandoTienda = true;
      this.createError = null;
      this.store.dispatch(createTiendaAction({ tienda: formData }));
    }
  }

  /** Limpia el formulario tras una creación exitosa. */
  resetFormularioTienda(): void {
      // Limpiamos el formulario
      this.tiendaForm.reset({
        nombre: [''],
        razon_social: [''],
        ruc: [''],
        direccion: [''],
        telefono: [''],
        email: [''],
        activo: [true],
        serie: [''],
        sol_user: [''],
        sol_password: [''],
        tienda_padre_select: '',
        propietario_username: [''],
        propietario_password: ['']
      });
      this.selectedLogo = null;
      this.selectedLogoDark = null;
      this.logoDarkPreview = null;
      this.selectedCert = null;
      this.certFileName = null;
      this.selectedCertPrivada = null;
      this.certPrivadaFileName = null;
      this.certPrivadaString = null;
      this.selectedCertPublica = null;
      this.certPublicaFileName = null;
      this.certPublicaString = null;
      this.consultandoRuc = false;
      this.rucConsultadoOk = false;
      this.rucError = null;
      this.lastQueriedRuc = null;
  }
}
