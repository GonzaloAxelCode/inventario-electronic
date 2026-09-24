import { PlanSuscripcion, SuscripcionTiendaResponse, Tienda, UsoMensualTienda } from '@/app/models/tienda.models';
import { TiendaService } from '@/app/services/tienda.service';
import { imageUrl, URL_BASE } from '@/app/services/utils/endpoints';
import { loadTiendasAction, updateTiendaAction } from '@/app/state/actions/tienda.actions';
import { AppState } from '@/app/state/app.state';
import { selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiAlertService, TuiAppearance, TuiButton, TuiDataList, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiButtonLoading, TuiConfirmData, TuiSwitch, TuiTab, TuiTabs } from '@taiga-ui/kit';
import { TuiInputModule, TuiSelectModule } from '@taiga-ui/legacy';
import { Subject, combineLatest, takeUntil } from 'rxjs';
import { TableUsersComponent } from '../../../components/Tables/tableusers/tableusers.component';
import { DialogupdattiendaComponent } from '../../../components/Dialogs/dialogupdattienda/dialogupdattienda.component';
import { DialogUpdateTiendaService } from '@/app/services/dialogs-services/dialog-updatetienda.service';
import { DialogUpdateLogosService } from '@/app/services/dialogs-services/dialog-update-logos.service';

@Component({
  selector: 'app-admintiendadetail',
  standalone: true,
  imports: [
    CommonModule, TuiButton, TuiAppearance, TuiLoader,
    TuiInputModule, TuiSelectModule, FormsModule, TuiTextfield, ReactiveFormsModule,
    TuiButtonLoading, TuiTabs, TuiTab, TuiSwitch, TuiDataList, TableUsersComponent, DialogupdattiendaComponent
  ],
  templateUrl: './admintiendadetail.component.html',
  styleUrl: './admintiendadetail.component.scss'
})
export class AdmintiendadetailComponent implements OnInit {
  tienda: Tienda = {} as Tienda;
  tiendasEstado: Tienda[] = [];
  private currentTiendaId: number | null = null;
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
  logoPreview: string | null = null;
  loadingUpdateTienda = false;
  deleteTiendaLoader = false;
  loading = true;

  // Seguridad (solo superusuario): toggle activación + eliminación temporal + restaurar
  togglingActivacion = false;
  deletingTemporal = false;
  restoringTienda = false;

  /** true si la tienda está eliminada temporalmente (is_deleted=true). */
  get isTiendaEliminada(): boolean {
    return !!((this.tienda as any)?.is_deleted);
  }

  // Suscripción / Plan (GET /api/tiendas/<id>/planes/)
  suscripcion: SuscripcionTiendaResponse | null = null;
  loadingSuscripcion = false;
  errorSuscripcion: string | null = null;
  private suscripcionLoadedForTiendaId: number | null = null;

  // Planes: listar / cambiar (crear vive en /admin/planes)
  planes: PlanSuscripcion[] = [];
  loadingPlanes = false;
  errorPlanes: string | null = null;
  selectedPlanId: number | null = null;
  changingPlan = false;

  activeTab: 'update' | 'config' | 'personal'
  | 'diseno' | 'suscripcion' | 'sunat' | 'sucursales' = 'update';
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
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private dialogUpdateTienda: DialogUpdateTiendaService,
    private dialogUpdateLogos: DialogUpdateLogosService,
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

  loadSuscripcion(force = false): void {
    const id = this.tienda?.id;
    if (!id) return;
    if (!force && this.suscripcionLoadedForTiendaId === id && this.suscripcion) return;
    // El servicio cachea por tienda: solo hay HTTP la primera vez (hasta F5).
    // Si viene de caché el observable resuelve síncrono y el spinner apenas parpadea.
    this.loadingSuscripcion = true;
    this.errorSuscripcion = null;
    this.cdRef.markForCheck();
    this.tiendaService.getPlanYSuscripcion(id, force).subscribe({
      next: (data) => {
        this.suscripcion = data;
        this.suscripcionLoadedForTiendaId = id;
        if (data?.plan_actual?.id) {
          this.selectedPlanId = data.plan_actual.id;
        }
        this.loadingSuscripcion = false;
        this.cdRef.markForCheck();
      },
      error: (err) => {
        this.loadingSuscripcion = false;
        this.errorSuscripcion = err?.status === 403
          ? 'Sin permisos para ver la suscripción de esta tienda (403).'
          : (err?.error?.error || 'No se pudo cargar la suscripción. Inténtalo de nuevo.');
        console.error('getPlanYSuscripcion error', err);
        this.cdRef.markForCheck();
      }
    });
  }

  loadPlanes(force = false): void {
    if (!force && this.planes.length > 0) return;
    // El servicio cachea globalmente: sin HTTP desde la 2da visita (hasta F5).
    // Si ya hay caché, no mostrar skeleton.
    if (!force && this.tiendaService.hasPlanesCache()) {
      this.tiendaService.listPlanes().pipe(takeUntil(this.destroy$)).subscribe({
        next: (data) => {
          this.planes = Array.isArray(data) ? data : [];
          this.loadingPlanes = false;
          if (!this.selectedPlanId && this.suscripcion?.plan_actual?.id) {
            this.selectedPlanId = this.suscripcion.plan_actual.id;
          }
          this.cdRef.markForCheck();
        },
      });
      return;
    }
    this.loadingPlanes = true;
    this.errorPlanes = null;
    this.cdRef.markForCheck();
    this.tiendaService.listPlanes(force).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.planes = Array.isArray(data) ? data : [];
        this.loadingPlanes = false;
        // Si hay plan actual y no hay selección, preseleccionar
        if (!this.selectedPlanId && this.suscripcion?.plan_actual?.id) {
          this.selectedPlanId = this.suscripcion.plan_actual.id;
        }
        this.cdRef.markForCheck();
      },
      error: (err) => {
        this.loadingPlanes = false;
        this.errorPlanes = 'No se pudieron cargar los planes.';
        console.error('listPlanes error', err);
        this.cdRef.markForCheck();
      }
    });
  }

  onCambiarPlan(): void {
    const tiendaId = this.tienda?.id;
    if (!tiendaId || !this.selectedPlanId || this.changingPlan) return;
    if (this.suscripcion?.plan_actual?.id === this.selectedPlanId) {
      this.alerts.open('La tienda ya tiene ese plan asignado.').subscribe();
      return;
    }
    const plan = this.planes.find(p => p.id === Number(this.selectedPlanId));
    const data: TuiConfirmData = {
      content: `¿Cambiar el plan de <b>${this.tienda.nombre}</b> a <b>${plan?.nombre_plan ?? '#' + this.selectedPlanId}</b>?`,
      yes: 'Cambiar plan',
      no: 'Cancelar',
    };
    this.dialogs.open<boolean>(TUI_CONFIRM, {
      label: 'Cambiar plan',
      size: 's',
      data,
    }).subscribe((confirm) => {
      if (!confirm) return;
      this.changingPlan = true;
      this.cdRef.markForCheck();
      this.tiendaService.cambiarPlanTienda(tiendaId, Number(this.selectedPlanId)).subscribe({
        next: (tiendaActualizada) => {
          this.changingPlan = false;
          // Actualiza tienda local (incluye campo plan) y recarga suscripción
          this.tienda = { ...this.tienda, ...(tiendaActualizada as any) };
          this.suscripcionLoadedForTiendaId = null;
          this.loadSuscripcion(true);
          this.alerts.open(`Plan cambiado a ${plan?.nombre_plan ?? this.selectedPlanId}.`).subscribe();
          this.cdRef.markForCheck();
        },
        error: (err) => {
          this.changingPlan = false;
          const msg = err?.error?.error
            || (err?.status === 403 ? 'No tienes permisos para cambiar el plan de esta tienda.'
            : err?.status === 404 ? 'El plan especificado no existe.'
            : 'No se pudo cambiar el plan. Inténtalo de nuevo.');
          this.alerts.open(msg).subscribe();
          console.error('cambiarPlanTienda error', err);
          this.cdRef.markForCheck();
        }
      });
    });
  }

  // Puente para el tui-select (Taiga muestra el nombre; el id es la fuente de verdad)
  get selectedPlanNombre(): string | null {
    return this.planes.find(p => p.id === Number(this.selectedPlanId))?.nombre_plan ?? null;
  }

  onPlanNombreChange(nombre: string | null): void {
    const found = this.planes.find(p => p.nombre_plan === nombre);
    this.selectedPlanId = found ? found.id : null;
    this.cdRef.markForCheck();
  }

  planEtiqueta(p: PlanSuscripcion): string {
    return `${p.nombre_plan} · ${p.precio_mensual} ${p.moneda} · B${this.isIlimitado(p.limite_boletas) ? '∞' : p.limite_boletas}/F${this.isIlimitado(p.limite_facturas) ? '∞' : p.limite_facturas}${p.activo ? '' : ' (inactivo)'}`;
  }

  // Normaliza uso_mensual (soporta forma nueva y legacy)
  getBoletasEmitidas(uso: UsoMensualTienda | null | undefined): number {
    if (!uso) return 0;
    return Number(uso.boletas_emitidas ?? (uso as any).total_boletas ?? 0);
  }

  getFacturasEmitidas(uso: UsoMensualTienda | null | undefined): number {
    if (!uso) return 0;
    return Number(uso.facturas_emitidas ?? (uso as any).total_facturas ?? 0);
  }

  getNumPersonal(): number {
    return this.tienda?.users_tienda?.length ?? this.tienda?.tienda_stats?.num_personal ?? 0;
  }

  getNumProductos(): number {
    return Number(this.tienda?.tienda_stats?.num_productos ?? 0);
  }  getUsoMesLabel(uso: UsoMensualTienda | null | undefined): string {
    if (!uso) return '';
    if (typeof uso.mes === 'string') return uso.mes.slice(0, 7); // "2026-09-01" -> "2026-09"
    if (typeof uso.mes === 'number' && uso.anio) return `${uso.mes}/${uso.anio}`;
    if (typeof uso.mes === 'number') return `${uso.mes}`;
    return '';
  }

  getUsoPorcentaje(usado: number | null | undefined, limite: number | null | undefined): number {
    const u = Number(usado ?? 0);
    const l = Number(limite ?? 0);
    if (!l || l <= 0) return 0;
    return Math.min(100, Math.round((u / l) * 100));
  }

  // Inicio del periodo del plan: plan_desde del backend, si no fecha_inicio/uso.mes/fecha_creacion
  getPlanInicio(uso: UsoMensualTienda | null | undefined, plan: PlanSuscripcion | null | undefined): Date | null {
    const s: any = this.suscripcion as any;
    const t: any = this.tienda as any;
    const u: any = uso as any;
    const raw = s?.plan_desde || t?.plan_desde || u?.fecha_inicio || (typeof uso?.mes === 'string' ? uso.mes : null) || (plan as any)?.fecha_creacion;
    if (!raw) return null;
    const d = new Date(raw);
    return isNaN(d.getTime()) ? null : d;
  }

  // Vencimiento: plan_hasta del backend, si no fecha_fin/fecha_vencimiento, si no inicio + periodo
  getPlanVencimiento(uso: UsoMensualTienda | null | undefined, plan: PlanSuscripcion | null | undefined): Date | null {
    const s: any = this.suscripcion as any;
    const t: any = this.tienda as any;
    const u: any = uso as any;
    const rawFin = s?.plan_hasta || t?.plan_hasta || u?.fecha_fin || u?.fecha_vencimiento;
    if (rawFin) {
      const d = new Date(rawFin);
      if (!isNaN(d.getTime())) return d;
    }
    const inicio = this.getPlanInicio(uso, plan);
    if (!inicio) return null;
    const fin = new Date(inicio);
    if ((plan?.periodo_facturacion || '').toLowerCase() === 'anual') {
      fin.setFullYear(fin.getFullYear() + 1);
    } else {
      fin.setMonth(fin.getMonth() + 1);
    }
    return fin;
  }

  // Días restantes del plan (vienen del backend)
  getPlanDiasRestantes(): number | null {
    const s: any = this.suscripcion as any;
    const t: any = this.tienda as any;
    const v = s?.plan_dias_restantes ?? t?.plan_dias_restantes;
    return v == null ? null : Number(v);
  }

  isIlimitado(limite: number | null | undefined): boolean {
    return Number(limite ?? 0) >= 999999;
  }

  /** La tienda es sucursal: SUNAT se hereda del padre (sin tab propio). */
  get esSucursal(): boolean {
    return !!((this.tienda as any)?.tienda_padre);
  }

  /** Sucursales vigentes de esta tienda padre: anidadas del GET o derivadas de la lista plana. */
  get sucursalesDeTienda(): Tienda[] {
    const nested = ((this.tienda as any)?.sucursales ?? []).filter((s: any) => !s?.is_deleted);
    if (nested?.length) return nested;
    const id = this.tienda?.id;
    if (id == null) return [];
    return (this.tiendasEstado ?? []).filter(t => !(t as any)?.is_deleted && t?.id !== id && t?.tienda_padre === id);
  }

  goToSucursal(id: number): void {
    this.router.navigate(['/admin/store', id]);
  }

  setTab(tab: typeof this.activeTab) {
    this.activeTab = tab;
    if (tab === 'suscripcion') {
      this.loadSuscripcion();
      this.loadPlanes();
    }
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

    // Reactivo a cambios de ruta (padre <-> sucursal) y del estado
    combineLatest([this.route.paramMap, this.store.select(selectTiendaState)])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([params, state]) => {
      const routeId = Number(params.get('id')) || id;
      if (routeId !== this.currentTiendaId) {
        // Cambió de tienda (p. ej. entró a una sucursal): vista fresca desde Información
        this.currentTiendaId = routeId;
        hasDispatchedLoad = false;
        this.activeTab = 'update';
        try { window.scrollTo({ top: 0 }); } catch { /* SSR/seguro */ }
      }
      this.tiendasEstado = state.tiendas ?? [];
      const found = state.tiendas?.find(t => t.id === routeId) || (state.miTienda?.id === routeId ? state.miTienda : null);
      if (found) {
        this.tienda = found as Tienda;
        this.logoPreview = imageUrl((found as Tienda).logo_img);
        this.applyStylesFromTienda();
        this.initForm();
        this.loading = false;
      } else if (state.loadingTiendas || state.loadingMiTienda) {
        this.loading = true;
      } else if (!state.tiendasLoaded && !hasDispatchedLoad) {
        hasDispatchedLoad = true;
        this.store.dispatch(loadTiendasAction());
        this.loading = true;
      } else if (state.tiendasLoaded && !found) {
        // Tienda no encontrada tras cargar
        this.loading = false;
      } else if (!state.tiendasLoaded && hasDispatchedLoad && !state.loadingTiendas) {
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

  openLogosModal(): void {
    if (!this.tienda?.id) return;
    this.dialogUpdateLogos.open(this.tienda as Tienda).subscribe(actualizada => {
      if (actualizada) {
        this.tienda = { ...this.tienda, ...(actualizada as any) };
        this.alerts.open('Logos actualizados.').subscribe();
        this.cdRef.markForCheck();
      }
    });
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

  /** Seguridad: activa/desactiva la tienda (POST|PATCH /api/tiendas/desactivate/toggle/<id>/). */
  onToggleActivacion(nuevoValor: boolean): void {
    const id = this.tienda?.id;
    // [(ngModel)] ya aplicó el nuevo valor en la vista; si no se puede operar, se revierte al instante.
    // (El switch exige NgControl: sin ngModel Taiga lo fuerza a disabled y no responde.)
    if (!id || this.togglingActivacion || this.deletingTemporal || this.restoringTienda || this.isTiendaEliminada) {
      this.tienda = { ...this.tienda, activo: !nuevoValor };
      this.cdRef.markForCheck();
      return;
    }
    const activate = nuevoValor;
    const previo = !nuevoValor;
    this.togglingActivacion = true;
    this.cdRef.markForCheck();
    this.tiendaService.toggleActivacionTienda(id, activate).subscribe({
      next: (res) => {
        this.togglingActivacion = false;
        this.tienda = { ...this.tienda, activo: res?.activo ?? activate };
        // Refresca el listado (las listas ocultan inactivas/eliminadas según filtro)
        this.store.dispatch(loadTiendasAction());
        this.alerts.open(activate ? `Tienda "${this.tienda.nombre}" activada.` : `Tienda "${this.tienda.nombre}" desactivada. Sus usuarios quedaron desactivados.`).subscribe();
        this.cdRef.markForCheck();
      },
      error: (err) => {
        this.togglingActivacion = false;
        // Revierte el optimista si falló
        this.tienda = { ...this.tienda, activo: previo };
        const msg = err?.error?.error
          || (err?.status === 400 ? 'Solicitud inválida para cambiar el estado.'
          : err?.status === 404 ? 'Tienda no encontrada o eliminada.'
          : 'No se pudo cambiar el estado. Inténtalo de nuevo.');
        this.alerts.open(msg).subscribe();
        console.error('toggleActivacionTienda error', err);
        this.cdRef.markForCheck();
      }
    });
  }

  /** Seguridad: eliminación temporal con modal de confirmación (PATCH /api/tiendas/delete/temporal/<id>/). */
  onEliminarTemporal(): void {
    const id = this.tienda?.id;
    if (!id || this.deletingTemporal) return;
    const data: TuiConfirmData = {
      appearance: 'negative',
      content: `¿Eliminar la tienda <b>${this.tienda.nombre}</b>? Se moverá a la papelera (eliminación temporal): quedará inactiva y sus usuarios desactivados. Podrás restaurarla después.`,
      yes: 'Eliminar tienda',
      no: 'Cancelar',
    };
    this.dialogs.open<boolean>(TUI_CONFIRM, {
      label: 'Eliminar tienda',
      size: 's',
      data,
    }).subscribe((confirm) => {
      if (!confirm) {
        this.alerts.open('Eliminación cancelada.').subscribe();
        return;
      }
      this.deletingTemporal = true;
      this.cdRef.markForCheck();
      this.tiendaService.eliminarTemporalTienda(id).subscribe({
        next: () => {
          this.deletingTemporal = false;
          this.alerts.open(`Tienda "${this.tienda.nombre}" eliminada (temporal).`).subscribe();
          // La tienda ya no aparece en los listados: refresca y vuelve
          this.store.dispatch(loadTiendasAction());
          this.router.navigate(['/admin/store']);
        },
        error: (err) => {
          this.deletingTemporal = false;
          const msg = err?.error?.error
            || (err?.status === 404 ? 'Tienda no encontrada o ya eliminada.'
            : 'No se pudo eliminar la tienda. Inténtalo de nuevo.');
          this.alerts.open(msg).subscribe();
          console.error('eliminarTemporalTienda error', err);
          this.cdRef.markForCheck();
        }
      });
    });
  }

  /** Seguridad: restaura una tienda eliminada temporalmente (PATCH /api/tiendas/delete/restore/<id>/). */
  onRestaurarTienda(): void {
    const id = this.tienda?.id;
    if (!id || this.restoringTienda) return;
    this.restoringTienda = true;
    this.cdRef.markForCheck();
    this.tiendaService.restaurarTienda(id).subscribe({
      next: (res) => {
        this.restoringTienda = false;
        this.tienda = { ...this.tienda, ...(res as any), is_deleted: false } as Tienda;
        this.store.dispatch(loadTiendasAction());
        this.alerts.open(`Tienda "${this.tienda.nombre}" restaurada y activada. Los usuarios siguen desactivados.`).subscribe();
        this.cdRef.markForCheck();
      },
      error: (err) => {
        this.restoringTienda = false;
        const msg = err?.error?.error
          || (err?.status === 400 ? 'La tienda no está eliminada.'
          : 'No se pudo restaurar la tienda. Inténtalo de nuevo.');
        this.alerts.open(msg).subscribe();
        console.error('restaurarTienda error', err);
        this.cdRef.markForCheck();
      }
    });
  }
}
