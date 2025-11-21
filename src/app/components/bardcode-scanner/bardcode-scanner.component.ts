// barcode-scanner.component.ts
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
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
      (input)="onInput($event)"
      (keydown)="onKeyDown($event)"
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
export class BarcodeScannerComponent implements AfterViewInit, OnDestroy {
  @ViewChild('barcodeInput') barcodeInput!: ElementRef<HTMLInputElement>;

  @Input() autoFocus = true;
  @Output() barcodeScanned = new EventEmitter<string>();

  barcodeValue = '';
  private scanTimeout: any;
  private buffer = '';
  private lastKeyTime = 0;

  ngAfterViewInit(): void {
    if (this.autoFocus) {
      setTimeout(() => this.focusInput(), 100);
    }
  }

  ngOnDestroy(): void {
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
    }
  }

  focusInput(): void {
    if (this.barcodeInput) {
      this.barcodeInput.nativeElement.focus();
    }
  }

  onInput(event: any): void {
    // Detectar escritura rápida del scanner
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - this.lastKeyTime;

    if (timeDiff < 50 && this.barcodeValue.length > 0) {
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

  onKeyDown(event: KeyboardEvent): void {
    // Solo bloquear Enter
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.processBarcode();
    }
  }

  private processBarcode(): void {
    const code = this.barcodeValue.trim();

    if (code && code.length > 0) {
      this.barcodeScanned.emit(code);
      this.barcodeValue = '';
      this.buffer = '';
    }

    setTimeout(() => this.focusInput(), 50);
  }

  clear(): void {
    this.barcodeValue = '';
    this.buffer = '';
  }
}