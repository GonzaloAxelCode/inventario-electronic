import { Tienda } from '@/app/models/tienda.models';
import { URL_BASE, imageUrl } from '@/app/services/utils/endpoints';
import { updateTiendaAction, updateTiendaSuccess } from '@/app/state/actions/tienda.actions';
import { AppState } from '@/app/state/app.state';
import { selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ConsultaService } from '@/app/services/consultas.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiAlertService, TuiAppearance, TuiButton, TuiDialogContext, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiSelectModule } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dialogupdattienda',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TuiInputModule, TuiSelectModule, TuiButton, TuiAppearance, TuiLoader, TuiTextfield],
  templateUrl: './dialogupdattienda.component.html',
  styleUrl: './dialogupdattienda.component.scss'
})
export class DialogupdattiendaComponent implements OnInit, OnDestroy {
  protected dialogCtx: TuiDialogContext<boolean, Partial<Tienda>> | null = null;
  /** Tienda a editar fuera de diálogo (tab SUNAT). Si se usa, el contexto es opcional. */
  @Input() tiendaInput: Partial<Tienda> | null = null;
  /** Solo muestra secciones SUNAT (certificados, SOL, guías); oculta el resto. */
  @Input() soloSunat = false;

  public get tienda(): Partial<Tienda> {
    return this.tiendaInput ?? this.dialogCtx?.data ?? {};
  }
  tiendaForm!: FormGroup;
  URL_BASE = URL_BASE;
  protected readonly imageUrl = imageUrl;
  readonly seriesOptions = ['001','002','003','004','005','006','007','008','009','010'];
  loadingUpdateTienda = false;
  selectedCertPrivada: File | null = null;
  certPrivadaFileName: string | null = null;
  certPrivadaString: string | null = null;
  selectedCertPublica: File | null = null;
  certPublicaFileName: string | null = null;
  certPublicaString: string | null = null;
  isSuperUser = false;
  isAdminTienda = false;

  // Consulta SUNAT de RUC al editar padre (razón social no editable)
  consultandoRuc = false;
  rucConsultadoOk = false;
  rucError: string | null = null;
  private lastQueriedRuc: string | null = null;

  /** Razón social no editable: superusuario en padre con RUC válido/SUNAT (fallback manual si falla). */
  get razonSocialBloqueadaEdit(): boolean {
    if (!this.isSuperUser || this.isAdminTienda || this.esSucursal) return false;
    if (this.consultandoRuc) return true;
    if (this.rucError) return false;
    if (this.rucConsultadoOk) return true;
    return /^\d{11}$/.test(String(this.tiendaForm.get('ruc')?.value ?? '').trim());
  }

  get esSucursal(): boolean {
    return !!(this.tienda as any).tienda_padre;
  }

  /** La tienda ya tiene certificado guardado (flag del GET; el valor real nunca viene). */
  get tieneCertPrivadaGuardada(): boolean {
    const t: any = this.tienda as any;
    return !!(t?.tiene_certificado || t?.cert_clave_privada || t?.tiene_cert_privada || t?.tiene_certificado_privada);
  }

  get tieneCertPublicaGuardada(): boolean {
    const t: any = this.tienda as any;
    return !!(t?.tiene_certificado || t?.cert_clave_publica || t?.tiene_cert_publica || t?.tiene_certificado_publica);
  }

  /** Hay clave SOL guardada (flag del GET; el valor real nunca viene). */
  get tieneSolGuardada(): boolean {
    return !!((this.tienda as any)?.tiene_sol || (this.tienda as any)?.sol_user);
  }

  /** Keys SUNAT de guías guardadas (flag del GET; los valores reales nunca vienen). */
  get tieneClientIdGuardado(): boolean {
    const t: any = this.tienda as any;
    if (t?.tiene_credenciales_guia !== undefined && t?.tiene_credenciales_guia !== null) return !!t.tiene_credenciales_guia;
    return !!(t?.tiene_client_id || t?.client_id);
  }

  get tieneClientSecretGuardado(): boolean {
    const t: any = this.tienda as any;
    if (t?.tiene_credenciales_guia !== undefined && t?.tiene_credenciales_guia !== null) return !!t.tiene_credenciales_guia;
    return !!(t?.tiene_client_secret || t?.client_secret);
  }

  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private actions$: Actions,
    private cdRef: ChangeDetectorRef,
    private consultaService: ConsultaService
  ) {
    try {
      this.dialogCtx = injectContext<TuiDialogContext<boolean, Partial<Tienda>>>();
    } catch {
      this.dialogCtx = null;
    }
    this.tiendaForm = this.fb.group({
      nombre: [this.tienda.nombre || '', Validators.required],
      razon_social: [this.tienda.razon_social || '', Validators.required],
      ruc: [this.tienda.ruc || '', Validators.required],
      direccion: [this.tienda.direccion || '', Validators.required],
      telefono: [this.tienda.telefono || ''],
      email: [this.tienda.email || ''],
      serie: [this.tienda.serie || '', Validators.required],
      correlativo_inicial_boleta: [this.tienda.correlativo_inicial_boleta || 1],
      correlativo_inicial_factura: [this.tienda.correlativo_inicial_factura || 1],
      correlativo_inicial_nota_credito: [this.tienda.correlativo_inicial_nota_credito || 1],
      sol_user: [(this.tienda as any).sol_user || ''],
      sol_password: [(this.tienda as any).sol_password || ''],
      client_id: [''],
      client_secret: ['']
    });
  }

  ngOnInit(): void {
    // Modo embebido (tab SUNAT): los @Input llegan después del constructor
    if (this.tiendaInput) {
      const t: any = this.tiendaInput;
      this.tiendaForm.patchValue({
        nombre: t.nombre || '',
        razon_social: t.razon_social || '',
        ruc: t.ruc || '',
        direccion: t.direccion || '',
        telefono: t.telefono || '',
        email: t.email || '',
        representante: t.representante || '',
        serie: t.serie || '',
        sol_user: t.sol_user || '',
        sol_password: t.sol_password || '',
      }, { emitEvent: false });
    }
    // RUC con el que se abrió: solo se consulta si el usuario lo cambia
    this.lastQueriedRuc = String(this.tiendaForm.get('ruc')?.value ?? '').trim() || null;
    // Superusuario en padre: al completar 11 dígitos se consulta SUNAT y se autocompleta la razón
    this.tiendaForm.get('ruc')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(raw => {
      const ruc = String(raw ?? '').trim();
      this.rucError = null;
      if (!this.isSuperUser || this.isAdminTienda || this.esSucursal) return;
      if (/^\d{11}$/.test(ruc)) {
        if (ruc !== this.lastQueriedRuc) this.consultarRucEdit(ruc);
      } else {
        this.rucConsultadoOk = false;
        this.lastQueriedRuc = null;
      }
      this.cdRef.markForCheck();
    });
    this.store.select(selectTiendaState).pipe(takeUntil(this.destroy$)).subscribe(state => {
      this.loadingUpdateTienda = state.loadingUpdateTienda;
      this.cdRef.markForCheck();
    });

    this.store.select(selectCurrenttUser).pipe(takeUntil(this.destroy$)).subscribe(user => {
      const u: any = user as any;
      this.isSuperUser = !!u?.is_superuser;
      this.isAdminTienda = !this.isSuperUser && u?.es_propietario === true;
    if (this.isAdminTienda || this.esSucursal) {
      this.tiendaForm.get('ruc')?.disable({ emitEvent: false });
    } else {
      this.tiendaForm.get('ruc')?.enable({ emitEvent: false });
    }

    if (this.esSucursal) {
      this.tiendaForm.get('razon_social')?.disable({ emitEvent: false });
      this.tiendaForm.get('sol_user')?.disable({ emitEvent: false });
      this.tiendaForm.get('sol_password')?.disable({ emitEvent: false });
      this.tiendaForm.get('client_id')?.disable({ emitEvent: false });
      this.tiendaForm.get('client_secret')?.disable({ emitEvent: false });
    } else {
      this.tiendaForm.get('razon_social')?.enable({ emitEvent: false });
      this.tiendaForm.get('sol_user')?.enable({ emitEvent: false });
      this.tiendaForm.get('sol_password')?.enable({ emitEvent: false });
      this.tiendaForm.get('client_id')?.enable({ emitEvent: false });
      this.tiendaForm.get('client_secret')?.enable({ emitEvent: false });
    }
      this.cdRef.markForCheck();
    });

    this.actions$.pipe(ofType(updateTiendaSuccess), takeUntil(this.destroy$)).subscribe(() => {
      this.dialogCtx?.completeWith(true);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.cdRef.markForCheck();
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
    this.cdRef.markForCheck();
  }

  /** Consulta el RUC en SUNAT y autocompleta la razón social (editar padre). */
  consultarRucEdit(ruc: string): void {
    this.consultandoRuc = true;
    this.rucError = null;
    this.cdRef.markForCheck();
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
        this.cdRef.markForCheck();
      },
      error: () => {
        this.consultandoRuc = false;
        this.rucConsultadoOk = false;
        this.rucError = 'No se pudo consultar el RUC. Verifica tu conexión o ingresa la razón social manualmente.';
        this.cdRef.markForCheck();
      }
    });
  }

  onSubmit(): void {
    if (this.tiendaForm.invalid) {
      this.tiendaForm.markAllAsTouched();
      return;
    }
    const formData = new FormData();
    const raw = (this.tiendaForm as any).getRawValue ? (this.tiendaForm as any).getRawValue() : this.tiendaForm.value;

    Object.entries(raw).forEach(([key, value]) => {
      if (this.esSucursal && (key === 'ruc' || key === 'razon_social')) return;
      // No mandar clave SOL vacía si ya hay una guardada: solo se envía si se escribió algo nuevo
      if ((key === 'sol_user' || key === 'sol_password') && (value === '' || value == null) && this.tieneSolGuardada) return;
      // Igual con las keys SUNAT de guías: solo se envían si se escribió algo nuevo
      if (key === 'client_id' && (value === '' || value == null) && this.tieneClientIdGuardado) return;
      if (key === 'client_secret' && (value === '' || value == null) && this.tieneClientSecretGuardado) return;
      formData.append(key, value as any);
    });
    if (this.certPrivadaString) {
      formData.append('cert_clave_privada', this.certPrivadaString);
    }
    if (this.certPublicaString) {
      formData.append('cert_clave_publica', this.certPublicaString);
    }
    // Los logos se actualizan por PATCH /api/tiendas/<id>/logos/ desde su propio modal
    this.store.dispatch(updateTiendaAction({ newTienda: formData, id: this.tienda.id as number }));
  }

  onClose(): void {
    this.dialogCtx?.completeWith(false);
  }
}
