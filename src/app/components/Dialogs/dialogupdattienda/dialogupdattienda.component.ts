import { Tienda } from '@/app/models/tienda.models';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { updateTiendaAction, updateTiendaSuccess } from '@/app/state/actions/tienda.actions';
import { AppState } from '@/app/state/app.state';
import { selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiAlertService, TuiAppearance, TuiButton, TuiDialogContext, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiSelectModule } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dialogupdattienda',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TuiInputModule, TuiSelectModule, TuiButton, TuiAppearance, TuiLoader, TuiTextfield],
  templateUrl: './dialogupdattienda.component.html',
  styleUrl: './dialogupdattienda.component.scss'
})
export class DialogupdattiendaComponent implements OnInit, OnDestroy {
  protected readonly context = injectContext<TuiDialogContext<boolean, Partial<Tienda>>>();
  public tienda: Partial<Tienda> = this.context.data ?? {};
  tiendaForm!: FormGroup;
  URL_BASE = URL_BASE;
  readonly seriesOptions = ['001','002','003','004','005','006','007','008','009','010'];
  selectedLogo: File | null = null;
  logoPreview: string | null = null;
  selectedLogoDark: File | null = null;
  logoDarkPreview: string | null = null;
  selectedBanner: File | null = null;
  bannerPreview: string | null = null;
  selectedCert: File | null = null;
  certFileName: string | null = null;
  loadingUpdateTienda = false;
  isSuperUser = false;
  isAdminTienda = false;
  private destroy$ = new Subject<void>();

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private actions$: Actions,
    private cdRef: ChangeDetectorRef
  ) {
    this.logoPreview = this.tienda.logo_img ? URL_BASE + this.tienda.logo_img : null;
    this.tiendaForm = this.fb.group({
      nombre: [this.tienda.nombre || '', Validators.required],
      razon_social: [this.tienda.razon_social || '', Validators.required],
      ruc: [this.tienda.ruc || '', Validators.required],
      direccion: [this.tienda.direccion || '', Validators.required],
      telefono: [this.tienda.telefono || ''],
      email: [this.tienda.email || ''],
      representante: [this.tienda.representante || ''],
      serie: [this.tienda.serie || '', Validators.required],
      correlativo_inicial_boleta: [this.tienda.correlativo_inicial_boleta || 1],
      correlativo_inicial_factura: [this.tienda.correlativo_inicial_factura || 1],
      correlativo_inicial_nota_credito: [this.tienda.correlativo_inicial_nota_credito || 1],
      sol_user: [(this.tienda as any).sol_user || ''],
      sol_password: [(this.tienda as any).sol_password || '']
    });
  }

  ngOnInit(): void {
    this.store.select(selectTiendaState).pipe(takeUntil(this.destroy$)).subscribe(state => {
      this.loadingUpdateTienda = state.loadingUpdateTienda;
      this.cdRef.markForCheck();
    });

    this.store.select(selectCurrenttUser).pipe(takeUntil(this.destroy$)).subscribe(user => {
      const u: any = user as any;
      this.isSuperUser = !!u?.is_superuser;
      this.isAdminTienda = !this.isSuperUser && u?.es_propietario === true;
      if (this.isAdminTienda) {
        this.tiendaForm.get('ruc')?.disable({ emitEvent: false });
      } else {
        this.tiendaForm.get('ruc')?.enable({ emitEvent: false });
      }
      this.cdRef.markForCheck();
    });

    this.actions$.pipe(ofType(updateTiendaSuccess), takeUntil(this.destroy$)).subscribe(() => {
      this.context.completeWith(true);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedLogo = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.logoPreview = reader.result as string;
      reader.readAsDataURL(this.selectedLogo);
    } else {
      this.selectedLogo = null;
      this.logoPreview = this.tienda.logo_img ? URL_BASE + this.tienda.logo_img : null;
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

  onBannerSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedBanner = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.bannerPreview = reader.result as string;
      reader.readAsDataURL(this.selectedBanner);
    } else {
      this.selectedBanner = null;
      this.bannerPreview = null;
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
    this.cdRef.markForCheck();
  }

  onSubmit(): void {
    if (this.tiendaForm.invalid) {
      this.tiendaForm.markAllAsTouched();
      return;
    }
    const formData = new FormData();
    const raw = (this.tiendaForm as any).getRawValue ? this.tiendaForm.getRawValue() : this.tiendaForm.value;
    Object.entries(raw).forEach(([key, value]) => {
      formData.append(key, value as any);
    });
    if (this.selectedLogo) {
      formData.append('logo_img', this.selectedLogo);
      formData.append('logo', this.selectedLogo);
    }
    if (this.selectedLogoDark) {
      formData.append('logo_dark', this.selectedLogoDark);
      formData.append('logo_dark_img', this.selectedLogoDark);
    }
    if (this.selectedBanner) {
      formData.append('banner', this.selectedBanner);
      formData.append('banner_img', this.selectedBanner);
    }
    if (this.selectedCert) {
      formData.append('certificado', this.selectedCert);
      formData.append('clave', this.selectedCert);
      formData.append('archivo_sunat', this.selectedCert);
      formData.append('sunat_cert', this.selectedCert);
    }
    this.store.dispatch(updateTiendaAction({ newTienda: formData, id: this.tienda.id as number }));
  }

  onClose(): void {
    this.context.completeWith(false);
  }
}
