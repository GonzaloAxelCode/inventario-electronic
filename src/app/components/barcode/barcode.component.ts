import { Component, Input } from '@angular/core';
import * as JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-barcode',
  standalone: true,
  imports: [],
  templateUrl: './barcode.component.html',
  styleUrl: './barcode.component.scss'
})
export class BarcodeComponent {

  @Input() sku!: string;

  ngAfterViewInit(): void {
    this.generarBarcode(this.sku);
  }

  generarBarcode(valor: string): void {
    //@ts-ignore
    JsBarcode(`#barcode-${valor}`, valor, {
      format: 'CODE128',
      lineColor: '#000',
      width: 2,
      height: 60,
      displayValue: true,
      fontSize: 12
    });
  }
}
