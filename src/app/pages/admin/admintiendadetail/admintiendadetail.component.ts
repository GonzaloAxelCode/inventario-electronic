import { Tienda } from '@/app/models/tienda.models';
import { TiendaService } from '@/app/services/tienda.service';
import { imageUrl, URL_BASE } from '@/app/services/utils/endpoints';
import { eliminarTiendaPermanently, eliminarTiendaPermanentlySuccess, loadTiendasAction, updateTiendaAction } from '@/app/state/actions/tienda.actions';
import { AppState } from '@/app/state/app.state';
import { selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiAlertService, TuiAppearance, TuiButton, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiButtonLoading, TuiConfirmData, TuiTab, TuiTabs } from '@taiga-ui/kit';
import { TuiInputModule, TuiSelectModule } from '@taiga-ui/legacy';
import { Subject, takeUntil } from 'rxjs';
import { TableUsersComponent } from '../../../components/Tables/tableusers/tableusers.component';
import { DialogUpdateTiendaService } from '@/app/services/dialogs-services/dialog-updatetienda.service';

@Component({
  selector: 'app-admintiendadetail',
  standalone: true,
  imports: [
    CommonModule, TuiButton, TuiAppearance, TuiLoader,
    TuiInputModule, TuiSelectModule, FormsModule, TuiTextfield, ReactiveFormsModule,
    TuiButtonLoading, TuiTabs, TuiTab, TableUsersComponent
  ],
  templateUrl: './admintiendadetail.component.html',
  styleUrl: './admintiendadetail.component.scss'
})
export class AdmintiendadetailComponent implements OnInit {
  tienda: Tienda = {} as Tienda;
  tiendaForm!: FormGroup;
  URL_BASE = URL_BASE;
  imageUrl = imageUrl;
  private destroy$ = new Subject<void>();
  selectedLogo: File | null = null;
  logoPreview: string | null = null;
  loadingUpdateTienda = false;
  deleteTiendaLoader = false;
  loading = true;

  activeTab: 'update' | 'config' | 'personal' | 'diseno' = 'update';
  readonly seriesOptions = ['001','002','003','004','005','006','007','008','009','010'];
  isSuperUser = false;
  selectedTicket: 't80_1' | 't80_2' | 't80_3' | 't80_4' | 't80_5' | 't80_6' = 't80_1';
  readonly ticketTemplates: Array<{ key: 't80_1' | 't80_2' | 't80_3' | 't80_4' | 't80_5' | 't80_6'; label: string; desc: string; file: string }> = [
    { key: 't80_1', label: 'Clásico',    desc: '80mm · Clásico · Doble línea',   file: 'ticket_v1_clasico.html.twig' },
    { key: 't80_2', label: 'Minimal',    desc: '80mm · Minimal · Centrado',       file: 'ticket_v2_minimal.html.twig' },
    { key: 't80_3', label: 'Bold',       desc: '80mm · Bold · Resaltado',         file: 'ticket_v3_bold.html.twig' },
    { key: 't80_4', label: 'Punteado',   desc: '80mm · Punteado · Bordes dashed', file: 'ticket_v4_punteado.html.twig' },
    { key: 't80_5', label: 'Condensado', desc: '80mm · Condensado · Compacto',    file: 'ticket_v5_condensado.html.twig' },
    { key: 't80_6', label: 'Enmarcado',  desc: '80mm · Enmarcado · Con marco',    file: 'ticket_v6_enmarcado.html.twig' }
  ];
  selectedInvoice: 'pdf_1' | 'pdf_2' | 'pdf_3' | 'pdf_4' | 'pdf_5' | 'pdf_6' = 'pdf_1';
  readonly invoiceTemplates: Array<{ key: 'pdf_1' | 'pdf_2' | 'pdf_3' | 'pdf_4' | 'pdf_5' | 'pdf_6'; label: string; desc: string; file: string }> = [
    { key: 'pdf_1', label: 'Corporate',  desc: 'PDF · Corporate · Cabecera azul',   file: 'factura_v1_corporate.html.twig' },
    { key: 'pdf_2', label: 'Minimal',    desc: 'PDF · Minimal · Rejilla simple',    file: 'factura_v2_minimal.html.twig' },
    { key: 'pdf_3', label: 'Executive',  desc: 'PDF · Executive · Header oscuro',   file: 'factura_v3_executive.html.twig' },
    { key: 'pdf_4', label: 'Modern',     desc: 'PDF · Modern · Acentos y línea',    file: 'factura_v4_modern.html.twig' },
    { key: 'pdf_5', label: 'Ledger',     desc: 'PDF · Ledger · Estilo contable',    file: 'factura_v5_ledger.html.twig' },
    { key: 'pdf_6', label: 'Bold',       desc: 'PDF · Bold · Tipografía fuerte',    file: 'factura_v6_bold.html.twig' }
  ];
  selectedBoleta: 'boleta_v1' | 'boleta_v2' | 'boleta_v3' | 'boleta_v4' | 'boleta_v5' | 'boleta_v6' = 'boleta_v1';
  readonly boletaTemplates: Array<{ key: 'boleta_v1' | 'boleta_v2' | 'boleta_v3' | 'boleta_v4' | 'boleta_v5' | 'boleta_v6'; label: string; desc: string; file: string }> = [
    { key: 'boleta_v1', label: 'Corporate',  desc: 'PDF · Boleta · Corporate · Cabecera azul', file: 'boleta_v1_corporate.html.twig' },
    { key: 'boleta_v2', label: 'Minimal',    desc: 'PDF · Boleta · Minimal · Rejilla simple',  file: 'boleta_v2_minimal.html.twig' },
    { key: 'boleta_v3', label: 'Executive',  desc: 'PDF · Boleta · Executive · Header oscuro', file: 'boleta_v3_executive.html.twig' },
    { key: 'boleta_v4', label: 'Modern',     desc: 'PDF · Boleta · Modern · Acentos y línea',  file: 'boleta_v4_modern.html.twig' },
    { key: 'boleta_v5', label: 'Ledger',     desc: 'PDF · Boleta · Ledger · Estilo contable',  file: 'boleta_v5_ledger.html.twig' },
    { key: 'boleta_v6', label: 'Bold',       desc: 'PDF · Boleta · Bold · Tipografía fuerte',  file: 'boleta_v6_bold.html.twig' }
  ];

  private readonly dialogs = inject(TuiResponsiveDialogService);
  private readonly alerts = inject(TuiAlertService);

  constructor(
    private store: Store<AppState>,
    private fb: FormBuilder,
    private actions$: Actions,
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private dialogUpdateTienda: DialogUpdateTiendaService,
    private tiendaService: TiendaService
  ) {}

  private static stripTemplateExt(file: string): string {
    return file.replace(/\.html\.twig$/, '');
  }

  private get ticketStyleMap(): Record<'t80_1' | 't80_2' | 't80_3' | 't80_4' | 't80_5' | 't80_6', string> {
    return Object.fromEntries(
      this.ticketTemplates.map(t => [t.key, AdmintiendadetailComponent.stripTemplateExt(t.file)])
    ) as Record<'t80_1' | 't80_2' | 't80_3' | 't80_4' | 't80_5' | 't80_6', string>;
  }

  private get invoiceStyleMap(): Record<'pdf_1' | 'pdf_2' | 'pdf_3' | 'pdf_4' | 'pdf_5' | 'pdf_6', string> {
    return Object.fromEntries(
      this.invoiceTemplates.map(t => [t.key, AdmintiendadetailComponent.stripTemplateExt(t.file)])
    ) as Record<'pdf_1' | 'pdf_2' | 'pdf_3' | 'pdf_4' | 'pdf_5' | 'pdf_6', string>;
  }

  private get ticketStyleReverseMap(): Record<string, 't80_1' | 't80_2' | 't80_3' | 't80_4' | 't80_5' | 't80_6'> {
    const map: Record<string, 't80_1' | 't80_2' | 't80_3' | 't80_4' | 't80_5' | 't80_6'> = {};
    for (const t of this.ticketTemplates) {
      map[AdmintiendadetailComponent.stripTemplateExt(t.file)] = t.key;
    }
    return map;
  }

  private get invoiceStyleReverseMap(): Record<string, 'pdf_1' | 'pdf_2' | 'pdf_3' | 'pdf_4' | 'pdf_5' | 'pdf_6'> {
    const map: Record<string, 'pdf_1' | 'pdf_2' | 'pdf_3' | 'pdf_4' | 'pdf_5' | 'pdf_6'> = {};
    for (const t of this.invoiceTemplates) {
      map[AdmintiendadetailComponent.stripTemplateExt(t.file)] = t.key;
    }
    return map;
  }

  private get boletaStyleMap(): Record<'boleta_v1' | 'boleta_v2' | 'boleta_v3' | 'boleta_v4' | 'boleta_v5' | 'boleta_v6', string> {
    return Object.fromEntries(
      this.boletaTemplates.map(t => [t.key, AdmintiendadetailComponent.stripTemplateExt(t.file)])
    ) as Record<'boleta_v1' | 'boleta_v2' | 'boleta_v3' | 'boleta_v4' | 'boleta_v5' | 'boleta_v6', string>;
  }

  private get boletaStyleReverseMap(): Record<string, 'boleta_v1' | 'boleta_v2' | 'boleta_v3' | 'boleta_v4' | 'boleta_v5' | 'boleta_v6'> {
    const map: Record<string, 'boleta_v1' | 'boleta_v2' | 'boleta_v3' | 'boleta_v4' | 'boleta_v5' | 'boleta_v6'> = {};
    for (const t of this.boletaTemplates) {
      map[AdmintiendadetailComponent.stripTemplateExt(t.file)] = t.key;
    }
    return map;
  }

  selectTicket(key: 't80_1' | 't80_2' | 't80_3' | 't80_4' | 't80_5' | 't80_6'): void {
    if (this.selectedTicket === key) return;
    this.selectedTicket = key;
    this.persistStyles();
  }

  selectInvoice(key: 'pdf_1' | 'pdf_2' | 'pdf_3' | 'pdf_4' | 'pdf_5' | 'pdf_6'): void {
    if (this.selectedInvoice === key) return;
    this.selectedInvoice = key;
    this.persistStyles();
  }

  selectBoleta(key: 'boleta_v1' | 'boleta_v2' | 'boleta_v3' | 'boleta_v4' | 'boleta_v5' | 'boleta_v6'): void {
    if (this.selectedBoleta === key) return;
    this.selectedBoleta = key;
    this.persistStyles();
  }

  private applyStylesFromTienda(): void {
    const ticketName = (this.tienda as any).tipo_style_boleta_ticket;
    const invoiceName = (this.tienda as any).tipo_style_factura_pdf;
    const boletaName = (this.tienda as any).tipo_style_boleta_pdf;

    if (ticketName && this.ticketStyleReverseMap[ticketName]) {
      this.selectedTicket = this.ticketStyleReverseMap[ticketName];
    }
    if (invoiceName && this.invoiceStyleReverseMap[invoiceName]) {
      this.selectedInvoice = this.invoiceStyleReverseMap[invoiceName];
    }
    if (boletaName && this.boletaStyleReverseMap[boletaName]) {
      this.selectedBoleta = this.boletaStyleReverseMap[boletaName];
    }
  }

  private persistStyles(): void {
    const id = this.tienda?.id;
    if (!id) return;

    const body = {
      tipo_style_boleta_ticket: this.ticketStyleMap[this.selectedTicket],
      tipo_style_factura_pdf: this.invoiceStyleMap[this.selectedInvoice],
      tipo_style_boleta_pdf: this.boletaStyleMap[this.selectedBoleta]
    };

    this.tiendaService.updateTiendaStyles(id, body).subscribe({
      next: () => {
        this.alerts.open(`Diseño actualizado · Ticket: ${body.tipo_style_boleta_ticket} · Boleta: ${body.tipo_style_boleta_pdf} · Factura: ${body.tipo_style_factura_pdf}`).subscribe();
        this.cdRef.markForCheck();
      },
      error: (err) => {
        this.alerts.open('No se pudo actualizar el diseño. Inténtalo de nuevo.').subscribe();
        this.cdRef.markForCheck();
        console.error('updateTiendaStyles error', err);
      }
    });
  }

  setTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
  }

  goBack() {
    this.router.navigate(['/admin/store']);
  }

  ngOnInit() {
    // Inicializa form vacío síncrono para evitar NG01052 (formGroup expects FormGroup)
    this.tiendaForm = this.fb.group({
      nombre: ['', Validators.required],
      razon_social: ['', Validators.required],
      ruc: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: [''],
      email: [''],
      representante: [''],
      serie: ['', Validators.required],
      correlativo_inicial_boleta: [1],
      correlativo_inicial_factura: [1],
      correlativo_inicial_nota_credito: [1]
    });

    const id = Number(this.route.snapshot.paramMap.get('id'));
    let hasDispatchedLoad = false;

    this.store.select(selectTiendaState).subscribe((state) => {
      const found = state.tiendas?.find(t => t.id === id) || (state.miTienda?.id === id ? state.miTienda : null);
      if (found) {
        this.tienda = found as Tienda;
        this.logoPreview = imageUrl((found as Tienda).logo_img);
        this.applyStylesFromTienda();
        this.initForm();
        this.loading = false;
      } else if (state.loadingTiendas || state.loadingMiTienda) {
        this.loading = true;
      } else if (state.tiendas.length === 0 && !hasDispatchedLoad) {
        hasDispatchedLoad = true;
        this.store.dispatch(loadTiendasAction());
        this.loading = true;
      } else if (state.tiendas.length > 0 && !found) {
        // Tienda no encontrada tras cargar
        this.loading = false;
      } else if (state.tiendas.length === 0 && hasDispatchedLoad) {
        // Ya se intentó cargar y sigue vacío
        this.loading = false;
      }
      this.deleteTiendaLoader = state.loadingDeleteTienda;
      this.loadingUpdateTienda = state.loadingUpdateTienda;
      this.cdRef.markForCheck();
    });

    this.store.select(selectCurrenttUser).pipe(takeUntil(this.destroy$)).subscribe(user => {
      const u: any = user as any;
      this.isSuperUser = !!u?.is_superuser;
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

  openEditModal(): void {
    this.dialogUpdateTienda.open(this.tienda as any).subscribe(result => {
      if (result) {
        // El store se actualiza vía updateTiendaSuccess; refresca la vista
        this.cdRef.markForCheck();
      }
    });
  }

  getPropietarioNombre(tienda: Tienda): string {
    const owner = tienda.propietario_data;
    if (owner) {
      const full = `${owner.first_name || ''} ${owner.last_name || ''}`.trim();
      return full || owner.username || `Propietario #${tienda.propietario ?? '—'}`;
    }
    const ownerUser = tienda.users_tienda?.find(u => u.id === tienda.propietario);
    if (ownerUser) {
      const full = `${ownerUser.first_name || ''} ${ownerUser.last_name || ''}`.trim();
      return full || ownerUser.username || `Propietario #${tienda.propietario ?? '—'}`;
    }
    return `Propietario #${tienda.propietario ?? '—'}`;
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
