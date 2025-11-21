// barcode-scanner.component.ts
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
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
  template: `
    <input
      #barcodeInput
      type="text"
      class="barcode-input"
      [(ngModel)]="barcodeValue"
      (keypress)="onKeyPress($event)"
      placeholder="Escanee el código de barras..."
      autocomplete="off"
    />
   
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .barcode-input {
      position: absolute;
      opacity: 0;
      pointer-events: none;
      width: 1px;
      height: 1px;
    }

   
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarcodeScannerComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('barcodeInput') barcodeInput!: ElementRef<HTMLInputElement>;

  // Recibe la referencia del contenedor desde el padre
  @Input() container?: ElementRef<HTMLDivElement>;
  @Input() showStatus = true;
  @Input() autoFocus = true;

  @Output() barcodeScanned = new EventEmitter<string>();

  barcodeValue = '';
  isScanning = false;
  private scanTimeout: any;
  private buffer = '';
  private lastKeyTime = 0;

  ngAfterViewInit(): void {
    // Auto-focus al cargar el componente
    if (this.autoFocus) {
      this.focusInput();
    }

    // Si se proporciona un contenedor, agregamos el listener de click
    this.setupContainerListener();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si el contenedor cambia, configurar el listener
    if (changes['container'] && !changes['container'].firstChange) {
      this.setupContainerListener();
    }
  }

  ngOnDestroy(): void {
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
    }
    // Limpiar listener del contenedor
    this.removeContainerListener();
  }

  // Configurar el listener en el contenedor externo
  private setupContainerListener(): void {
    if (this.container?.nativeElement) {
      // Hacer el contenedor enfocable
      this.container.nativeElement.setAttribute('tabindex', '0');

      // Agregar estilos de focus al contenedor
      this.container.nativeElement.style.outline = 'none';
      this.container.nativeElement.style.cursor = 'pointer';

      // Listener para hacer click en el contenedor
      this.container.nativeElement.addEventListener('click', this.handleContainerClick);

      // Listener para el focus del contenedor
      this.container.nativeElement.addEventListener('focus', this.handleContainerFocus);
    }
  }

  // Limpiar listeners
  private removeContainerListener(): void {
    if (this.container?.nativeElement) {
      this.container.nativeElement.removeEventListener('click', this.handleContainerClick);
      this.container.nativeElement.removeEventListener('focus', this.handleContainerFocus);
    }
  }

  // Handler para click en el contenedor
  private handleContainerClick = (): void => {
    this.focusInput();
  };

  // Handler para focus en el contenedor
  private handleContainerFocus = (): void => {
    this.focusInput();
  };

  // Focus al input
  focusInput(): void {
    if (this.barcodeInput) {
      this.barcodeInput.nativeElement.focus();
    }
  }

  // Detectar cuando el usuario hace clic en el contenedor o teclas rápidas
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Solo procesar si el contenedor o input tienen el foco
    const activeElement = document.activeElement;
    const isInputFocused = activeElement === this.barcodeInput?.nativeElement;
    const isContainerFocused = this.container?.nativeElement &&
      activeElement === this.container.nativeElement;

    if (!isInputFocused && !isContainerFocused) {
      return;
    }

    // BLOQUEAR ENTER completamente
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.processBarcode();
      return;
    }

    // Si el contenedor tiene el foco, redirigir al input
    if (isContainerFocused) {
      this.focusInput();
    }

    const currentTime = new Date().getTime();
    const timeDiff = currentTime - this.lastKeyTime;

    // Los lectores de código de barras escriben muy rápido (< 50ms entre teclas)
    if (timeDiff < 50) {
      this.isScanning = true;
      this.buffer += event.key;

      // Limpiar timeout anterior
      if (this.scanTimeout) {
        clearTimeout(this.scanTimeout);
      }

      // Esperar a que termine el escaneo
      this.scanTimeout = setTimeout(() => {
        this.processBarcode();
      }, 100);
    }

    this.lastKeyTime = currentTime;
  }

  // Bloquear Enter también en keypress
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.processBarcode();
    }
  }

  // Bloquear Enter en keyup por si acaso
  @HostListener('document:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent): void {
    const activeElement = document.activeElement;
    const isInputFocused = activeElement === this.barcodeInput?.nativeElement;
    const isContainerFocused = this.container?.nativeElement &&
      activeElement === this.container.nativeElement;

    if ((isInputFocused || isContainerFocused) && event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  // Procesar el código escaneado
  private processBarcode(): void {
    const code = this.buffer.trim() || this.barcodeValue.trim();

    if (code && code.length > 0) {
      this.barcodeScanned.emit(code);
      this.barcodeValue = '';
      this.buffer = '';
    }

    this.isScanning = false;

    // Re-enfocar el input para el próximo escaneo
    setTimeout(() => {
      this.focusInput();
    }, 100);
  }

  // Método público para limpiar manualmente
  clear(): void {
    this.barcodeValue = '';
    this.buffer = '';
    this.isScanning = false;
  }
}