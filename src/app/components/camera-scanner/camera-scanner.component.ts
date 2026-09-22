import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const FORMATOS_SOPORTADOS = [
  Html5QrcodeSupportedFormats.EAN_13,
  Html5QrcodeSupportedFormats.EAN_8,
  Html5QrcodeSupportedFormats.UPC_A,
  Html5QrcodeSupportedFormats.UPC_E,
  Html5QrcodeSupportedFormats.CODE_128,
  Html5QrcodeSupportedFormats.CODE_39,
  Html5QrcodeSupportedFormats.ITF,
  Html5QrcodeSupportedFormats.CODABAR,
  Html5QrcodeSupportedFormats.QR_CODE,
];

@Component({
  selector: 'app-camera-scanner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="scanner-overlay" (click)="solicitarCerrar()">
      <div class="scanner-card" (click)="$event.stopPropagation()">
        <div class="scanner-header">
          <div>
            <p class="scanner-title">Escanear código</p>
            <p class="scanner-subtitle">Apunta la cámara al código de barras</p>
          </div>
          <button type="button" class="scanner-x" (click)="solicitarCerrar()" aria-label="Cerrar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div id="camera-reader" class="scanner-reader"></div>

        <p *ngIf="iniciando" class="scanner-hint">Abriendo cámara…</p>
        <p *ngIf="error" class="scanner-error">{{ error }}</p>

        <button type="button" class="scanner-cancel" (click)="solicitarCerrar()">
          Cancelar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .scanner-overlay {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: rgba(0, 0, 0, 0.65);
      backdrop-filter: blur(4px);
    }
    .scanner-card {
      width: 100%;
      max-width: 22rem;
      background: #fff;
      border-radius: 1.25rem;
      padding: 1rem;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.35);
    }
    :host-context(.dark) .scanner-card {
      background: #262626;
    }
    .scanner-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .scanner-title {
      font-size: 1rem;
      font-weight: 700;
      color: #171717;
      line-height: 1.25;
      margin: 0;
    }
    :host-context(.dark) .scanner-title {
      color: #fff;
    }
    .scanner-subtitle {
      font-size: 0.75rem;
      color: #737373;
      margin: 0.15rem 0 0;
    }
    .scanner-x {
      width: 2rem;
      height: 2rem;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 9999px;
      border: none;
      background: transparent;
      color: #a3a3a3;
      cursor: pointer;
    }
    .scanner-x svg {
      width: 1.25rem;
      height: 1.25rem;
    }
    .scanner-reader {
      width: 100%;
      min-height: 220px;
      border-radius: 0.9rem;
      overflow: hidden;
      background: #0a0a0a;
    }
    .scanner-reader video {
      border-radius: 0.9rem;
    }
    .scanner-hint {
      font-size: 0.75rem;
      text-align: center;
      color: #737373;
      margin: 0.6rem 0 0;
    }
    .scanner-error {
      font-size: 0.75rem;
      text-align: center;
      color: #dc2626;
      background: #fef2f2;
      border-radius: 0.6rem;
      padding: 0.5rem 0.75rem;
      margin: 0.6rem 0 0;
    }
    .scanner-cancel {
      width: 100%;
      margin-top: 0.75rem;
      height: 2.75rem;
      border-radius: 0.9rem;
      border: none;
      background: #171717;
      color: #fff;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
    }
    :host-context(.dark) .scanner-cancel {
      background: #fff;
      color: #171717;
    }
  `],
})
export class CameraScannerComponent implements AfterViewInit, OnDestroy {
  @Output() codigoEscaneado = new EventEmitter<string>();
  @Output() cerrar = new EventEmitter<void>();

  error = '';
  iniciando = true;

  private scanner?: Html5Qrcode;
  private escaneado = false;
  private detenido = false;

  ngAfterViewInit(): void {
    setTimeout(() => this.iniciar(), 50);
  }

  ngOnDestroy(): void {
    void this.detener();
  }

  solicitarCerrar(): void {
    void this.detener().finally(() => this.cerrar.emit());
  }

  private async iniciar(): Promise<void> {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('no-camara');
      }
      this.scanner = new Html5Qrcode('camera-reader', {
        verbose: false,
        formatsToSupport: FORMATOS_SOPORTADOS,
      });
      await this.scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 150 }, aspectRatio: 1.4 },
        (texto) => void this.onDetectado(texto),
        () => undefined,
      );
      this.iniciando = false;
    } catch {
      this.iniciando = false;
      this.error = 'No se pudo abrir la cámara. Revisa los permisos del navegador.';
    }
  }

  private async onDetectado(codigo: string): Promise<void> {
    if (this.escaneado) return;
    this.escaneado = true;
    await this.detener();
    this.codigoEscaneado.emit((codigo || '').trim());
  }

  private async detener(): Promise<void> {
    if (this.detenido || !this.scanner) return;
    this.detenido = true;
    try {
      if (this.scanner.isScanning) {
        await this.scanner.stop();
      }
    } catch {
      // cámara ya detenida
    }
    try {
      this.scanner.clear();
    } catch {
      // lector ya limpiado
    }
  }
}
