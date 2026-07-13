import { Tienda } from '@/app/models/tienda.models';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { eliminarTiendaPermanently, eliminarTiendaPermanentlySuccess, updateTiendaAction } from '@/app/state/actions/tienda.actions';
import { AppState } from '@/app/state/app.state';
import { selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiAlertService, TuiAppearance, TuiButton, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiButtonLoading, TuiConfirmData, TuiTab, TuiTabs } from '@taiga-ui/kit';
import { TuiInputModule } from '@taiga-ui/legacy';
import { Subject, takeUntil } from 'rxjs';
import { TableUsersComponent } from '../../../components/Tables/tableusers/tableusers.component';

@Component({
  selector: 'app-admintiendadetail',
  standalone: true,
  imports: [
    CommonModule, TuiButton, TuiAppearance, TuiLoader,
    TuiInputModule, FormsModule, TuiTextfield, ReactiveFormsModule,
    TuiButtonLoading, TuiTabs, TuiTab, TableUsersComponent
  ],
  templateUrl: './admintiendadetail.component.html',
  styleUrl: './admintiendadetail.component.scss'
})
export class AdmintiendadetailComponent implements OnInit {
  tienda: Tienda = {} as Tienda;
  tiendaForm!: FormGroup;
  URL_BASE = URL_BASE;
  private destroy$ = new Subject<void>();
  selectedLogo: File | null = null;
  logoPreview: string | null = null;
  loadingUpdateTienda = false;
  deleteTiendaLoader = false;
  loading = true;

  activeTab: 'update' | 'config' | 'personal' = 'update';

  private readonly dialogs = inject(TuiResponsiveDialogService);
  private readonly alerts = inject(TuiAlertService);

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private actions$: Actions,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  setTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
  }

  goBack() {
    this.router.navigate(['/admin/store']);
  }

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.store.select(selectTiendaState).subscribe((state) => {
      const found = state.tiendas?.find(t => t.id === id);
      if (found) {
        this.tienda = found;
        this.logoPreview = found.logo_img ? URL_BASE + found.logo_img : null;
        this.initForm();
        this.loading = false;
      }
      this.deleteTiendaLoader = state.loadingDeleteTienda;
      this.loadingUpdateTienda = state.loadingUpdateTienda;
      this.cdRef.markForCheck();
    });
  }

  initForm() {
    this.tiendaForm = this.fb.group({
      nombre: [this.tienda.nombre || '', Validators.required],
      razon_social: [this.tienda.razon_social || '', Validators.required],
      ruc: [this.tienda.ruc || '', Validators.required],
      direccion: [this.tienda.direccion || '', Validators.required],
      telefono: [this.tienda.telefono || ''],
      email: [this.tienda.email || ''],
      sol_user: [this.tienda.sol_user || ''],
      sol_password: [this.tienda.sol_password || ''],
      representante: [this.tienda.representante || ''],
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
      const formData = new FormData();
      Object.entries(this.tiendaForm.value).forEach(([key, value]) => {
        formData.append(key, value as any);
      });
      if (this.selectedLogo) {
        formData.append('logo_img', this.selectedLogo);
      }
      this.store.dispatch(updateTiendaAction({ newTienda: formData, id: this.tienda.id }));
    }
  }

  onDeleteTienda(id: number) {
    const data: TuiConfirmData = {
      appearance: 'negative',
      content: '¿Estás seguro de que deseas eliminar esta tienda?',
      yes: 'Eliminar Permanentemente',
      no: 'Cancelar',
    };

    this.dialogs.open<boolean>(TUI_CONFIRM, {
      label: 'Confirmación de Eliminación',
      size: 's',
      data,
    }).subscribe((confirm) => {
      if (confirm) {
        this.store.dispatch(eliminarTiendaPermanently({ id }));
        this.actions$.pipe(
          ofType(eliminarTiendaPermanentlySuccess),
          takeUntil(this.destroy$)
        ).subscribe(() => {
          this.router.navigate(['/admin/store']);
        });
      } else {
        this.alerts.open('Eliminación cancelada.').subscribe();
      }
    });
  }
}
