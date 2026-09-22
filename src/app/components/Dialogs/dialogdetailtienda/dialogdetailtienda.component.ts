import { Tienda } from '@/app/models/tienda.models';
import { URL_BASE, imageUrl } from '@/app/services/utils/endpoints';
import { eliminarTiendaPermanently, eliminarTiendaPermanentlySuccess, updateTiendaAction } from '@/app/state/actions/tienda.actions';
import { AppState } from '@/app/state/app.state';
import { selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiAlertService, TuiAppearance, TuiButton, TuiDialogContext, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiButtonLoading, TuiConfirmData, TuiTab, TuiTabs, TuiTabsWithMore } from '@taiga-ui/kit';
import { TuiInputModule } from '@taiga-ui/legacy';
import { injectContext } from '@taiga-ui/polymorpheus';
import { Subject, takeUntil } from 'rxjs';
import { TableUsersComponent } from '../../Tables/tableusers/tableusers.component';
@Component({
  selector: 'app-dialogdetailtienda',
  standalone: true,
  imports: [TableUsersComponent, CommonModule, TuiButton, TuiAppearance, TuiLoader,
    TuiInputModule, TuiTabsWithMore,
    FormsModule, TuiTextfield, ReactiveFormsModule, TuiButtonLoading, TuiTabs, TuiTab
  ],
  templateUrl: './dialogdetailtienda.component.html',
  styleUrl: './dialogdetailtienda.component.scss'
})
export class DialogdetailtiendaComponent implements OnInit {
  protected readonly context = injectContext<TuiDialogContext<boolean, Tienda>>();
  public tienda: Tienda = this.context.data ?? {};
  tiendaForm!: FormGroup;
  URL_BASE = URL_BASE;
  imageUrl = imageUrl;

  /** Username del propietario (objeto nuevo o legacy). */
  get propietarioUsername(): string {
    const p: any = (this.tienda as any)?.propietario;
    if (p != null && typeof p === 'object') return p.username || p.full_name || '';
    const pd: any = (this.tienda as any)?.propietario_data;
    return pd?.username || '';
  }
  private destroy$ = new Subject<void>();
  selectedLogo: File | null = null;
  logoPreview: string | null = imageUrl(this.tienda.logo_img);
  loadingUpdateTienda: boolean = false
  selectedCertPrivada: File | null = null;
  certPrivadaFileName: string | null = null;
  certPrivadaString: string | null = null;
  selectedCertPublica: File | null = null;
  certPublicaFileName: string | null = null;
  certPublicaString: string | null = null;
  activeTab:
    | 'update'
    | 'config'
    | 'personal'
    = 'personal';

  setTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
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


  constructor(private store: Store<AppState>, private fb: FormBuilder, private actions$: Actions, private cdRef: ChangeDetectorRef) {

    this.tiendaForm = this.fb.group({
      nombre: [this.tienda.nombre || '', Validators.required],
      razon_social: [this.tienda.razon_social || '', Validators.required],        // opcional
      ruc: [this.tienda.ruc || '', Validators.required],       // valor por defecto
      direccion: [this.tienda.direccion || '', Validators.required],           // opcional
      telefono: [this.tienda.telefono || ''],   // valor por defecto
      email: [this.tienda.email || ''],               // opcional
      sol_user: [this.tienda.sol_user || ''],            // opcional
      sol_password: [this.tienda.sol_password || ''],        // opcional
      serie: [this.tienda.serie || '', Validators.required],
      correlativo_inicial_boleta: [this.tienda.correlativo_inicial_boleta || 1],
      correlativo_inicial_factura: [this.tienda.correlativo_inicial_factura || 1],
      correlativo_inicial_nota_credito: [this.tienda.correlativo_inicial_nota_credito || 1]
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedLogo = input.files[0];

      // Creamos preview
      const reader = new FileReader();
      reader.onload = e => this.logoPreview = reader.result as string;
      reader.readAsDataURL(this.selectedLogo);
    } else {
      this.selectedLogo = null;
      this.logoPreview = null;
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
  onSubmit() {
    if (this.tiendaForm.valid) {
      // Creamos FormData
      const formData = new FormData();

      // Agregamos todos los campos del formulario (menos la clave SOL vacía si ya hay una guardada)
      Object.entries(this.tiendaForm.value).forEach(([key, value]) => {
        if ((key === 'sol_user' || key === 'sol_password') && (value === '' || value == null) && this.tieneSolGuardada) return;
        formData.append(key, value as any); // Angular guarda todo como string por defecto
      });

      // Agregamos el logo si existe
      if (this.selectedLogo) {
        formData.append('logo_img', this.selectedLogo);
      }

      // Convertimos los archivos de cert_clave_privada y cert_clave_publica a string y los enviamos en el payload
      if (this.certPrivadaString) {
        formData.append('cert_clave_privada', this.certPrivadaString);
      }
      if (this.certPublicaString) {
        formData.append('cert_clave_publica', this.certPublicaString);
      }

      // Despachamos la acción con FormData
      this.store.dispatch(updateTiendaAction({ newTienda: formData, id: this.tienda.id }));


    }
  }
  deleteTiendaLoader: boolean = false;

  private readonly dialogs = inject(TuiResponsiveDialogService);
  private readonly alerts = inject(TuiAlertService);
  protected onDeleteTienda(id: any): void {
    const data: TuiConfirmData = {
      appearance: "negative",
      content: '¿Estás seguro de que deseas eliminar esta tienda',
      yes: 'Eliminar Permanentemente',
      no: 'Cancelar',

    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Confirmación de Eliminación',
        size: 's',
        data,
      })
      .subscribe((confirm) => {
        if (confirm) {

          this.store.dispatch(eliminarTiendaPermanently({ id }));
          this.actions$.pipe(
            ofType(eliminarTiendaPermanentlySuccess),
            takeUntil(this.destroy$)
          ).subscribe(() => {

            this.context.completeWith(true);

          });



        } else {

          this.alerts.open('Eliminación cancelada.').subscribe();
        }
      });


  }

  ngOnInit() {
    this.store.select(selectTiendaState).subscribe((tiendaState) => {
      this.deleteTiendaLoader = tiendaState.loadingDeleteTienda;
      this.loadingUpdateTienda = tiendaState.loadingUpdateTienda;
      this.cdRef.markForCheck();
    })

    //aca escuchar el reducer si fue eliminado exitosamente para cerrar el dialog escucha el action 
  }




}
