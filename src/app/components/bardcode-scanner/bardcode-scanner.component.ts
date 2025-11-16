// barcode-scanner.component.ts
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiTextfield } from '@taiga-ui/core';

@Component({
  selector: 'app-barcode-scanner',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TuiTextfield
  ],
  templateUrl: './bardcode-scanner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarcodeScannerComponent implements OnInit, OnDestroy {
  @ViewChild('barcodeInput') barcodeInput!: ElementRef<HTMLInputElement>;
  @Output() barcodeScanned = new EventEmitter<string>();

  barcodeBuffer = '';
  lastScannedCode = '';
  lastScannedTime: Date | null = null;
  status = '✓ Listo para escanear';
  scannedCodes: Array<{ code: string; time: Date }> = [];

  private focusInterval: any;
  private boundHandleDocumentClick: (event: MouseEvent) => void;

  constructor() {
    this.boundHandleDocumentClick = this.handleDocumentClick.bind(this);
  }

  ngOnInit() {
    // Mantener el foco SOLO si no hay otro input activo
    this.focusInterval = setInterval(() => {
      this.ensureFocus();
    }, 100);

    // Escuchar clicks en cualquier parte del documento
    document.addEventListener('click', this.boundHandleDocumentClick);
  }

  ngAfterViewInit() {
    // Enfocar inmediatamente después de que la vista se inicialice SIN SCROLL
    setTimeout(() => this.ensureFocus(), 100);
  }

  ngOnDestroy() {
    if (this.focusInterval) {
      clearInterval(this.focusInterval);
    }
    document.removeEventListener('click', this.boundHandleDocumentClick);
  }

  handleDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    // No robar el foco si el usuario está interactuando con otros inputs
    if (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT' ||
      target.isContentEditable) {
      return;
    }

    // Recuperar el foco después de un click, pero sin hacer scroll
    setTimeout(() => this.ensureFocus(), 50);
  }

  ensureFocus() {
    const activeElement = document.activeElement as HTMLElement;

    // NO enfocar si hay un input, textarea, select o elemento editable activo
    if (activeElement && (
      activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.tagName === 'SELECT' ||
      activeElement.isContentEditable
    )) {
      return;
    }

    // Solo enfocar si no hay ningún input activo - AGREGAMOS preventScroll: true
    if (this.barcodeInput && document.activeElement !== this.barcodeInput.nativeElement) {
      this.barcodeInput.nativeElement.focus({ preventScroll: true });
    }
  }

  onBarcodeScanned() {
    const scannedCode = this.barcodeBuffer.trim();

    if (scannedCode) {
      this.lastScannedCode = scannedCode;
      this.lastScannedTime = new Date();

      // Agregar al historial
      this.scannedCodes.unshift({
        code: scannedCode,
        time: this.lastScannedTime
      });

      // Limitar historial a 10 elementos
      if (this.scannedCodes.length > 10) {
        this.scannedCodes.pop();
      }

      this.status = '✓ Código escaneado correctamente';

      // Emitir el evento para que el componente padre lo maneje
      this.barcodeScanned.emit(scannedCode);

      // Limpiar el buffer
      this.barcodeBuffer = '';

      // Feedback visual temporal
      setTimeout(() => {
        this.status = '✓ Listo para escanear';
      }, 2000);
    }
  }
}