import { Tienda } from '@/app/models/tienda.models';
import { URL_BASE } from '@/app/services/utils/endpoints';
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
  URL_BASE = URL_BASE
  private destroy$ = new Subject<void>();
  selectedLogo: File | null = null;
  logoPreview: string | null = URL_BASE + this.tienda.logo_img;
  loadingUpdateTienda: boolean = false
  activeTab:
    | 'update'
    | 'config'
    | 'personal'
    = 'personal';

  setTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
  }


  constructor(private store: Store<AppState>, private fb: FormBuilder, private actions$: Actions, private cdRef: ChangeDetectorRef) {

    this.tiendaForm = this.fb.group({
      nombre: [this.tienda.nombre || '', Validators.required],
      razon_social: [this.tienda.razon_social || ''],        // opcional
      ruc: [this.tienda.ruc || '',],       // valor por defecto
      direccion: [this.tienda.direccion || ''],           // opcional
      telefono: [this.tienda.telefono || ''],   // valor por defecto
      email: [this.tienda.email || ''],               // opcional
      sol_user: [this.tienda.sol_user || ''],            // opcional
      sol_password: [this.tienda.sol_password || ''],        // opcional

    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedLogo = input.files[0];
      console.log('Archivo seleccionado:', this.selectedLogo.name);

      // Creamos preview
      const reader = new FileReader();
      reader.onload = e => this.logoPreview = reader.result as string;
      reader.readAsDataURL(this.selectedLogo);
    } else {
      this.selectedLogo = null;
      this.logoPreview = null;
    }
  }
  onSubmit() {
    if (this.tiendaForm.valid) {
      // Creamos FormData
      const formData = new FormData();

      // Agregamos todos los campos del formulario
      Object.entries(this.tiendaForm.value).forEach(([key, value]) => {
        formData.append(key, value as any); // Angular guarda todo como string por defecto
      });

      // Agregamos el logo si existe
      if (this.selectedLogo) {
        formData.append('logo_img', this.selectedLogo);
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
