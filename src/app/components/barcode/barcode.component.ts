import { AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-barcode',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barcode.component.html',
  styleUrl: './barcode.component.scss'
})
export class BarcodeComponent implements AfterViewInit, OnChanges {

  @Input() sku!: string;
  @ViewChild('barcodeSvg') svg?: ElementRef<SVGSVGElement>;

  error = false;

  ngAfterViewInit(): void {
    this.render();
  }

  ngOnChanges(): void {
    this.render();
  }

  private render(): void {
    if (!this.svg || !this.sku) return;
    try {
      const anyImport: any = JsBarcode as any;
      const JsBarcodeFn: any = anyImport.default || anyImport;
      JsBarcodeFn(this.svg.nativeElement, String(this.sku), {
        format: 'CODE128',
        lineColor: '#000',
        width: 1.5,
        height: 44,
        displayValue: true,
        fontSize: 11,
        margin: 4
      });
      this.error = false;
    } catch {
      this.error = true;
    }
  }
}
