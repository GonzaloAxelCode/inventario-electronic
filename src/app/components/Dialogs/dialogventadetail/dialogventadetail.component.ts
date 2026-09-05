import { ComprobanteElectronico, Venta } from '@/app/models/venta.models';

import { URL_BASE } from '@/app/services/utils/endpoints';
import { anularVenta, anularVentaExito, generarComprobanteVenta, generarComprobanteVentaExito } from '@/app/state/actions/venta.actions';
import { AppState } from '@/app/state/app.state';
import { VentaState } from '@/app/state/reducers/venta.reducer';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { selectVenta } from '@/app/state/selectors/venta.selectors';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule, NgForOf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiAppearance, TuiButton, TuiDataList, TuiDialogContext, TuiExpand, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiBadge, TuiChip, TuiCopy, TuiDataListWrapper, TuiPreview, TuiPreviewDialogDirective, TuiPreviewTitle, TuiSegmented, TuiSegmentedDirective, TuiSkeleton, TuiStatus } from '@taiga-ui/kit';
import { TuiBlockStatus, TuiSearch } from '@taiga-ui/layout';
import { TuiInputModule, TuiInputRangeModule, TuiSelectModule, TuiTextareaModule, TuiTextfieldControllerModule } from "@taiga-ui/legacy";
import { injectContext } from '@taiga-ui/polymorpheus';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { Subject, takeUntil } from 'rxjs';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Actions, ofType } from '@ngrx/effects';
@Component({
  selector: 'app-dialogventadetail',
  standalone: true,
  imports: [CommonModule, TuiPreview,
    TuiPreviewTitle, CommonModule,
    FormsModule, TuiSegmented, TuiSegmentedDirective,
    ReactiveFormsModule,
    TuiDataListWrapper,
    TuiDataList,
    TuiSelectModule,
    TuiTextareaModule,
    TuiButton,
    TuiTextfield,
    TuiTextfieldControllerModule,
    TuiChip,
    TuiInputModule,
    TuiAppearance,
    TuiTable,
    TuiBadge,
    InfiniteScrollModule,
    TuiStatus,
    NgForOf,
    ScrollingModule,
    TuiInputRangeModule,
    TuiSearch, TuiTextfield,
    TuiSkeleton,
    TuiExpand,
    TuiBlockStatus,
    TuiPreview, TuiSearch,
    TuiPreviewTitle,
    TuiPreviewDialogDirective, TuiIcon, TuiPreviewDialogDirective, TuiLoader, TuiTable, TuiButton, TuiAppearance, TuiBadge, TuiChip, TuiLoader, TuiExpand, TuiCopy],
  templateUrl: './dialogventadetail.component.html',
  styleUrl: './dialogventadetail.component.scss'
})
export class DialogventadetailComponent implements OnInit {
  protected readonly context = injectContext<TuiDialogContext<boolean, Venta>>();
  public venta: Venta = this.context.data ?? {} as Venta;
  protected expanded = false;
  pdfUrl!: SafeResourceUrl;
  protected index = 0;
  protected length = 1;
  selectedState: 'original' | 'anulado' = ((this as any).context?.data?.comprobante_nota_credito ? 'anulado' : 'original') as 'original' | 'anulado';


  public comprobante: ComprobanteElectronico = this.venta?.comprobante ?? {} as ComprobanteElectronico;

  // Fuente válida según requerimiento: productos_json - cacheada para evitar JSON.parse en cada CD
  private _productosDetalleCache: any[] | null = null;
  get productosDetalle(): any[] {
    if (this._productosDetalleCache) return this._productosDetalleCache;
    try {
      const raw = (this.venta as any)?.productos_json;
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (Array.isArray(parsed) && parsed.length) {
          this._productosDetalleCache = parsed;
          return parsed;
        }
      }
    } catch (e) { console.warn('productos_json parse error', e); }
    const fallback = (this.venta as any)?.productos || [];
    this._productosDetalleCache = fallback;
    return fallback;
  }

  // Cliente info desde clientes_json (string) - cacheado
  private _clienteJsonCache: any | undefined = undefined;
  get clienteJsonData(): any {
    if (this._clienteJsonCache !== undefined) return this._clienteJsonCache;
    try {
      const raw = (this.venta as any)?.clientes_json ?? (this.venta as any)?.cliente_json ?? (this.venta as any)?.clienteJson ?? (this.venta as any)?.clientesJson;
      if (raw) {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        // Si es array, tomar primer elemento
        if (Array.isArray(parsed)) {
          this._clienteJsonCache = parsed[0] ?? null;
          return this._clienteJsonCache;
        }
        if (parsed && typeof parsed === 'object') {
          this._clienteJsonCache = parsed;
          return parsed;
        }
      }
    } catch (e) { console.warn('clientes_json parse error', e); }
    this._clienteJsonCache = null;
    return null;
  }
  // Helpers dict exacto del snapshot (clientes_json):
  // numero: raw["numero"]|ruc|documento_cliente|venta.numero_documento_cliente
  // email/telefono/direccion normalizados en el dict
  get clienteDireccion(): string {
    const j = this.clienteJsonData;
    // dict usa "direccion" y "direccion_cliente"
    return j?.direccion ?? j?.direccion_cliente ?? (this.venta as any)?.direccion_cliente ?? this.venta.direccion_cliente ?? '';
  }
  get clienteNumero(): string {
    const j = this.clienteJsonData;
    // dict usa "numero" (ya normalizado), fallback a ruc/documento_cliente
    return j?.numero ?? j?.numero_documento ?? j?.ruc ?? j?.documento_cliente ?? (this.venta as any)?.numero_documento_cliente ?? this.venta.numero_documento_cliente ?? '';
  }
  get clienteEmail(): string {
    const j = this.clienteJsonData;
    // dict usa "email" y "correo_cliente"
    return j?.email ?? j?.correo_cliente ?? (this.venta as any)?.email_cliente ?? (this.venta as any)?.correo_cliente ?? this.venta.email_cliente ?? this.venta.correo_cliente ?? '';
  }
  get clienteTelefono(): string {
    const j = this.clienteJsonData;
    // dict usa "telefono" y "telefono_cliente"
    return j?.telefono ?? j?.telefono_cliente ?? (this.venta as any)?.telefono_cliente ?? this.venta.telefono_cliente ?? '';
  }
  get clienteTipoDoc(): string {
    const j = this.clienteJsonData;
    // dict usa "tipo_documento" = venta.tipo_documento_cliente ("1" DNI / "6" RUC)
    const tipo = j?.tipo_documento ?? (this.venta as any)?.tipo_documento_cliente ?? this.venta.tipo_documento_cliente ?? '';
    if (tipo === '6' || String(tipo).toLowerCase() === 'ruc') return 'RUC';
    if (tipo === '1' || String(tipo).toLowerCase() === 'dni') return 'DNI';
    const num = this.clienteNumero;
    if (num && String(num).length === 11) return 'RUC';
    return 'DNI';
  }
  // Normaliza teléfono sin 51 inicial para WhatsApp
  private cleanPhone(raw: string): string {
    if (!raw) return '';
    let digits = String(raw).replace(/\D/g, '');
    // quitar 51 inicial si viene con prefijo país (ej: 51987654321 o +51987654321)
    if (digits.startsWith('51') && digits.length >= 11) digits = digits.substring(2);
    // quitar 0 inicial si quedara
    if (digits.startsWith('0')) digits = digits.replace(/^0+/, '');
    return digits;
  }
  constructor(private store: Store<AppState>, private sanitizer: DomSanitizer, private actions$: Actions
  ) {
    console.log(this.venta)

  }
  numeroTelefonico = '';
  numeroInvalido = true;

  validarNumero(valor: string): void {
    const soloNumeros = valor.replace(/\D/g, '');

    // solo validar, NO modificar el ngModel directamente
    this.numeroInvalido = soloNumeros.length !== 9;
  }


  URL_BASE = URL_BASE
  tiendaNombre = 'Mi Tienda';
  tiendaRuc = '';
  tiendaDireccion = '';
  tiendaTelefono = '';
  tiendaLogo: string | null = null;
  prevPdfTicket(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url + "#toolbar=1&navpanes=0&scrollbar=0&view=FitH");
  }
  loadingAnularVenta: boolean = false
  loadingGenerarComprobante: boolean = false
  public productos_json = (() => { try { const r = (this.venta as any)?.productos_json; return typeof r === 'string' ? JSON.parse(r ?? '[]') : (r || []); } catch { return []; } })();
  ngOnInit(): void {
    // Si la venta ya está anulada, mostrar primero el tab Anulado
    if ((this.venta as any)?.comprobante_nota_credito) {
      this.selectedState = 'anulado';
    }

    this.store.select(selectVenta).subscribe((state: VentaState) => {
      this.loadingAnularVenta = state.loadingNotaCredito;
      this.loadingGenerarComprobante = state.loadingGenerarComprobante
    });

    this.store.select(selectUsersState).subscribe(userState => {
      const user = userState.user;
      const tienda = user.tienda_data;
      this.tiendaNombre = tienda?.nombre || user.tienda_nombre || 'Mi Tienda';
      this.tiendaRuc = tienda?.ruc || '';
      this.tiendaDireccion = tienda?.direccion || '';
      this.tiendaTelefono = tienda?.telefono || '';
      if (!tienda?.logo_img) {
        this.tiendaLogo = null;
      } else {
        const rawLogo = String(tienda.logo_img).trim();
        if (rawLogo.startsWith('http://') || rawLogo.startsWith('https://')) {
          this.tiendaLogo = rawLogo;
        } else {
          this.tiendaLogo = URL_BASE + (rawLogo.startsWith('/') ? rawLogo : '/' + rawLogo);
        }
      }
    });
  }

  open = false;
  showConfirmAnular = false;
  showWhatsApp = false;
  whatsappNumero = '';
  whatsappMensaje = '';
  whatsAppPlantillaActiva = '';
  showEmail = false;
  emailDestino = '';
  emailAsunto = '';
  emailMensaje = '';
  emailPlantillaActiva = '';
  protected titles = ["Producto Sin Imagen"]
  protected content = ['https://st2.depositphotos.com/1561359/12101/v/950/depositphotos_121012076-stock-illustration-blank-photo-icon.jpg']

  onSetImageProduct(item: any) {
    const placeholder = "https://sublimac.com/wp-content/uploads/2017/11/default-placeholder.png";
    const raw = item?.imagen_producto ?? item?.img_url;
    let imagenFinal = placeholder;
    if (raw) {
      const s = String(raw).trim();
      imagenFinal = s.startsWith('http') ? s : URL_BASE + (s.startsWith('/') ? s : '/' + s);
    }
    this.titles = [item.descripcion || "Producto Sin Nombre"];
    this.content = [imagenFinal];
  }

  stripDomain(url?: string): string {
    if (!url) return '';
    try {
      // Obtener solo la parte del path
      const u = new URL(url);
      let path = u.pathname + u.search + u.hash;

      // Quitar el subdirectorio "axelmovilcomprobantes" si existe
      path = path.replace(/^\/?axelmovilcomprobantes\/?/, '/');

      return "https://pub-6b79c76579594222bdd6f486ae49157e.r2.dev" + path;
    } catch {
      // Si la URL no es válida, usar regex como respaldo
      return url
        .replace(/^https?:\/\/[^\/]+/i, '') // quitar dominio
        .replace(/^\/?axelmovilcomprobantes\/?/, '/'); // quitar subcarpeta
    }
  }
  enviarWhatsApp(
    event: MouseEvent,
    pdfUrl: string,
    telefono: string
  ) {
    event.preventDefault();   // ⛔ evita navegación
    event.stopPropagation();  // ⛔ evita clicks fantasmas

    const mensaje = `Hola te saluda Movil Axel,
Te envío tu comprobante electrónico:
${pdfUrl}   - Gracias por tu compra. ¡Esperamos verte de nuevo pronto!`;

    const clean = this.cleanPhone(telefono);
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank');
  }


  getValorVentaRedondeado(valor: number) {
    return valor ? parseFloat(valor.toFixed(2)) : 0.0;
  }

  hasDescuento(): boolean {
    return this.productosDetalle.some((p: any) => Number(p?.descuento || 0) > 0) || Number(this.comprobante?.descuento_total || 0) > 0;
  }

  getDescuento(item: any): number {
    return parseFloat(Number(item?.descuento || 0).toFixed(2));
  }

  getPrecioOriginal(item: any, index: number): number {
    // costo_original es el precio antes de descuento (con IGV)
    if (item?.costo_original != null) return parseFloat(Number(item.costo_original).toFixed(2));
    if (item?.costoOriginal != null) return parseFloat(Number(item.costoOriginal).toFixed(2));
    // fallback: precio unitario actual + descuento prorrateado
    const desc = Number(item?.descuento || 0);
    const cant = Number(item?.cantidad || 1);
    const puActual = this.getPrecioUnitarioVistaPrevia(item, index);
    if (desc > 0 && cant > 0) return parseFloat((puActual + desc / cant).toFixed(2));
    return puActual;
  }

  getSubtotalSinIgv(): number {
    // subtotal = suma de totales de productos CON IGV (precioUnitario * cantidad) desde productos_json
    const productos = this.productosDetalle;
    if (!productos.length) return Number(this.venta?.subtotal || 0);
    let sum = 0;
    for (let i = 0; i < productos.length; i++) {
      const p: any = productos[i];
      sum += this.getTotalSinIgvVistaPrevia(p, i);
    }
    return parseFloat(sum.toFixed(2));
  }

  getCantidadTotal(): number {
    return this.productosDetalle.reduce((acc: number, p: any) => acc + Number(p?.cantidad || p?.cantidad_final || 0), 0);
  }

  getImagenProducto(item: any): string {
    const placeholder = "https://sublimac.com/wp-content/uploads/2017/11/default-placeholder.png";
    const raw = item?.img_url ?? item?.imagen_producto ?? item?.producto_imagen ?? item?.image ?? item?.imagen ?? item?.url_imagen;
    if (!raw) return placeholder;
    // Si ya es URL absoluta, devolver tal cual
    if (String(raw).startsWith('http')) return String(raw);
    // Si viene con /media/ o similar, anteponer URL_BASE
    return URL_BASE + String(raw);
  }

  isDeleted(item: any): boolean {
    const v = item?.producto_existe;
    // producto_existe: true=existe, false=no existe, null/undefined se considera existe para no romper
    if (v === false || v === 0 || v === '0' || v === 'false') return true;
    if (v === true || v === 1 || v === '1' || v === 'true') return false;
    return false;
  }

  isUpdated(item: any): boolean {
    const v = item?.is_updated ?? item?.isUpdated;
    return v === true || v === 1 || v === '1' || v === 'true';
  }

  // Vista previa y tabla: precioUnitario desde productos_json CON IGV (igv global se mantiene)
  getPrecioUnitarioVistaPrevia(item: any, index: number): number {
    // 1) Fuente válida productos_json (item ya viene de productosDetalle)
    if (item) {
      const pu = item.precio_unitario ?? item.precioUnitario ?? item.costo_venta ?? item.costoVenta ?? item.precio_venta ?? item.price;
      if (pu != null && String(pu) !== '' ) return parseFloat(Number(pu).toFixed(2));
      // valor_venta + igv / cantidad = con IGV
      if (item.valor_venta != null || item.valorVenta != null) {
        const vv = item.valor_venta ?? item.valorVenta;
        const igv = item.igv ?? item.total_impuestos ?? item.totalImpuestos ?? 0;
        const cant = item.cantidad ?? item.cantidad_final ?? 1;
        if (vv != null) return parseFloat(((Number(vv) + Number(igv)) / Number(cant)).toFixed(2));
      }
      const vu = item.valor_unitario ?? item.valorUnitario ?? item.valorUnitario;
      if (vu != null) return parseFloat((Number(vu) * 1.18).toFixed(2));
      if (item.costo_original != null) return parseFloat(Number(item.costo_original).toFixed(2));
    }
    // 2) Fallback comprobante.items
    const compItem: any = (this.comprobante as any)?.items?.[index];
    if (compItem) {
      const pu = compItem.precioUnitario ?? compItem.precio_unitario;
      if (pu != null) return parseFloat(Number(pu).toFixed(2));
      const vu = compItem.valorUnitario ?? compItem.valor_unitario;
      if (vu != null) return parseFloat((Number(vu) * 1.18).toFixed(2));
      const vv = compItem.valorVenta ?? compItem.valor_venta;
      const igv = compItem.igv ?? compItem.totalImpuestos ?? compItem.total_impuestos ?? 0;
      const cant = compItem.cantidad ?? item?.cantidad ?? 1;
      if (vv != null) return parseFloat(((Number(vv) + Number(igv)) / Number(cant)).toFixed(2));
    }
    return 0;
  }

  getTotalSinIgvVistaPrevia(item: any, index: number): number {
    // Producto_json primero (con IGV)
    if (item) {
      // si tiene precio_unitario, usarlo * cantidad
      const pu = item.precio_unitario ?? item.precioUnitario ?? item.costo_venta ?? item.costoVenta;
      const cant = item.cantidad ?? item.cantidad_final ?? 1;
      if (pu != null && String(pu) !== '') return parseFloat((Number(pu) * Number(cant)).toFixed(2));
      if (item.valor_venta != null || item.valorVenta != null) {
        const vv = item.valor_venta ?? item.valorVenta;
        const igv = item.igv ?? item.total_impuestos ?? item.totalImpuestos ?? 0;
        return parseFloat((Number(vv) + Number(igv)).toFixed(2));
      }
      if (item.total != null) return parseFloat(Number(item.total).toFixed(2));
      if (item.valor_unitario != null) return parseFloat((Number(item.valor_unitario) * 1.18 * Number(cant)).toFixed(2));
    }
    const compItem: any = (this.comprobante as any)?.items?.[index];
    if (compItem) {
      const pu = compItem.precioUnitario ?? compItem.precio_unitario;
      const cant = compItem.cantidad ?? item?.cantidad ?? 1;
      if (pu != null) return parseFloat((Number(pu) * Number(cant)).toFixed(2));
      const vu = compItem.valorUnitario ?? compItem.valor_unitario;
      if (vu != null) return parseFloat((Number(vu) * 1.18 * Number(cant)).toFixed(2));
      const vv = compItem.valorVenta ?? compItem.valor_venta;
      const igv = compItem.igv ?? compItem.totalImpuestos ?? compItem.total_impuestos ?? 0;
      if (vv != null) return parseFloat((Number(vv) + Number(igv)).toFixed(2));
    }
    const pu = this.getPrecioUnitarioVistaPrevia(item, index);
    return parseFloat((pu * Number(item?.cantidad ?? item?.cantidad_final ?? 1)).toFixed(2));
  }

  imprimirTicket(): void {
    const raw = (this.comprobante as any)?.ticket_url || this.comprobante.pdf_url;
    const url = raw ? this.stripDomain(raw) : '';
    if (url) {
      const win = window.open(url, '_blank');
      // intentar imprimir cuando cargue
      if (win) {
        // fallback: después de 500ms intentar print
        setTimeout(() => { try { win.print(); } catch {} }, 700);
      }
    } else {
      window.print();
    }
  }

  verTicket(): void {
    const raw = (this.comprobante as any)?.ticket_url || this.comprobante.pdf_url;
    const url = raw ? this.stripDomain(raw) : '';
    if (url) window.open(url, '_blank');
  }

  confirmarAnular() {
    this.showConfirmAnular = true;
  }

  cancelarAnular() {
    this.showConfirmAnular = false;
  }

  // ─── Mensajes predefinidos (con datos de la tienda) ─────────────────────────
  whatsAppPlantillas: { id: string; nombre: string }[] = [
    { id: 'comprobante', nombre: 'Comprobante electrónico' },
    { id: 'agradecimiento', nombre: 'Agradecimiento' },
    { id: 'confirmacion', nombre: 'Confirmación de compra' },
  ];

  emailPlantillas: { id: string; nombre: string }[] = [
    { id: 'comprobante', nombre: 'Comprobante electrónico' },
    { id: 'agradecimiento', nombre: 'Agradecimiento' },
    { id: 'confirmacion', nombre: 'Confirmación de compra' },
    { id: 'promocion', nombre: 'Promoción' },
  ];

  get comprobanteNumero(): string {
    const s = this.comprobante?.serie ?? '';
    const c = this.comprobante?.correlativo ?? '';
    return s && c ? `${s}-${c}` : (s || c || this.comprobante?.numero || '');
  }

  get clienteNombre(): string {
    return this.venta?.nombre_cliente || this.comprobante?.nombre_cliente || 'cliente';
  }

  get comprobanteLink(): string {
    const raw = (this.comprobante as any)?.ticket_url || this.comprobante.pdf_url;
    return this.stripDomain(raw) || '';
  }

  get comprobanteTotal(): number {
    return this.comprobante?.total ?? this.venta?.total ?? 0;
  }

  private generarMensajeWhatsApp(id: string): string {
    const t = this.tiendaNombre || 'nuestra tienda';
    const dir = this.tiendaDireccion || '';
    const tel = this.tiendaTelefono || '';
    const ruc = this.tiendaRuc || '';
    const num = this.comprobanteNumero;
    const link = this.comprobanteLink;
    const total = this.comprobanteTotal;
    const cliente = this.clienteNombre;

    const pie = [tel ? `📞 ${tel}` : '', dir ? `📍 ${dir}` : '', ruc ? `RUC: ${ruc}` : '']
      .filter(Boolean)
      .join(' · ');

    switch (id) {
      case 'agradecimiento':
        return `Hola ${cliente}! Gracias por preferir ${t}.\nTu comprobante electrónico ${num}:\n${link}\n\nCualquier consulta, estaremos encantados de atenderte.\n${pie ? pie + '\n' : ''}¡Vuelve pronto!`;
      case 'confirmacion':
        return `Estimado(a) ${cliente},\nConfirmamos tu compra en ${t}.\nComprobante: ${num}\nTotal: S/ ${total}\n\nPuedes ver tu documento aquí:\n${link}\n\n${pie ? pie + '\n' : ''}¡Gracias por tu preferencia!`;
      case 'comprobante':
      default:
        return `Hola ${cliente}! Te saluda ${t}.\nTe envío tu comprobante electrónico ${num}:\n${link}\n\nGracias por tu compra. ¡Te esperamos de nuevo pronto!\n${pie ? pie : ''}`;
    }
  }

  private generarMensajeEmail(id: string): string {
    const t = this.tiendaNombre || 'nuestra tienda';
    const dir = this.tiendaDireccion || '';
    const tel = this.tiendaTelefono || '';
    const ruc = this.tiendaRuc || '';
    const num = this.comprobanteNumero;
    const link = this.comprobanteLink;
    const total = this.comprobanteTotal;
    const cliente = this.clienteNombre;

    const datosTienda = [
      t,
      dir,
      tel ? `Teléfono: ${tel}` : '',
      ruc ? `RUC: ${ruc}` : '',
    ].filter(Boolean).join('\n');

    switch (id) {
      case 'agradecimiento':
        return `Hola ${cliente},\n\nGracias por preferir ${t}. Te enviamos tu comprobante electrónico ${num}:\n${link}\n\nCualquier consulta contáctanos.\n\nSaludos,\n${datosTienda}`;
      case 'confirmacion':
        return `Estimado(a) ${cliente},\n\nTe confirmamos tu compra en ${t}.\nComprobante: ${num}\nTotal: S/ ${total}\n\nPuedes descargar tu documento en el siguiente enlace:\n${link}\n\nGracias por tu preferencia.\n\nSaludos,\n${datosTienda}`;
      case 'promocion':
        return `Estimado(a) ${cliente},\n\nGracias por tu reciente compra en ${t}. Queremos invitarte a conocer nuestras novedades y promociones.\n\nTu comprobante ${num} lo puedes ver aquí:\n${link}\n\nPara más información contáctanos.\n\nSaludos,\n${datosTienda}`;
      case 'comprobante':
      default:
        return `Hola ${cliente},\n\nTe enviamos tu comprobante electrónico ${num} de ${t}:\n${link}\n\nGracias por tu compra. ¡Te esperamos de nuevo pronto!\n\nSaludos,\n${datosTienda}`;
    }
  }

  aplicarMensajeWhatsApp(id: string): void {
    this.whatsappMensaje = this.generarMensajeWhatsApp(id);
    this.whatsAppPlantillaActiva = id;
  }

  aplicarMensajeEmail(id: string): void {
    this.emailMensaje = this.generarMensajeEmail(id);
    this.emailPlantillaActiva = id;
  }

  abrirWhatsApp() {
    this.whatsappNumero = this.venta.telefono_cliente || this.clienteTelefono || '';
    this.whatsappMensaje = this.generarMensajeWhatsApp('comprobante');
    this.whatsAppPlantillaActiva = 'comprobante';
    this.showWhatsApp = true;
  }

  cerrarWhatsApp() {
    this.showWhatsApp = false;
  }

  enviarWhatsAppModal() {
    if (!this.whatsappNumero) return;
    const clean = this.cleanPhone(this.whatsappNumero);
    const url = `https://wa.me/${clean}?text=${encodeURIComponent(this.whatsappMensaje)}`;
    window.open(url, '_blank');
    this.showWhatsApp = false;
  }

  abrirEmail() {
    this.emailDestino = this.venta.email_cliente || this.venta.correo_cliente || this.clienteEmail || '';
    this.emailAsunto = `Comprobante ${this.comprobanteNumero} - ${this.tiendaNombre || 'Mi Tienda'}`;
    this.emailMensaje = this.generarMensajeEmail('comprobante');
    this.emailPlantillaActiva = 'comprobante';
    this.showEmail = true;
  }

  cerrarEmail() {
    this.showEmail = false;
  }

  enviarEmailModal() {
    if (!this.emailDestino) return;
    const subject = encodeURIComponent(this.emailAsunto);
    const body = encodeURIComponent(this.emailMensaje);
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${this.emailDestino}&su=${subject}&body=${body}`;
    window.open(url, '_blank');
    this.showEmail = false;
  }

  anularVenta(id: number, doc: string) {
    this.showConfirmAnular = false;
    this.store.dispatch(anularVenta({ ventaId: id, venta: this.venta, motivo: "Anulación de la operación", tipo_motivo: "01", anonima: doc == "00000000" }))

    this.actions$.pipe(
      ofType(anularVentaExito),
      takeUntil(this.destroy$)
    ).subscribe(({ ventad }: any) => {
      this.context.completeWith(true)
    });

  }
  private destroy$ = new Subject<void>();

  realizarComprobante() {

    this.store.dispatch(generarComprobanteVenta({ ventaId: this.venta.id }));
    this.actions$.pipe(
      ofType(generarComprobanteVentaExito),
      takeUntil(this.destroy$)
    ).subscribe(({ ventad }: any) => {
      this.context.completeWith(true)
    });
  }



  // Uso:

}
