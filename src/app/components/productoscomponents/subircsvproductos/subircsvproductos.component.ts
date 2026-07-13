import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';

interface CsvPreview {
  headers: string[];
  rows: string[][];
  totalRows: number;
  fileName: string;
  fileSize: string;
}

@Component({
  selector: 'app-subircsvproductos',
  standalone: true,
  imports: [CommonModule, TuiButton],
  templateUrl: './subircsvproductos.component.html',
  styleUrl: './subircsvproductos.component.scss'
})
export class SubircsvproductosComponent {

  private alerts = inject(TuiAlertService);
  private cdr = inject(ChangeDetectorRef);

  csvData: CsvPreview | null = null;
  isDragging = false;

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    input.value = '';

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.alerts.open('Archivo inválido', {
        label: `${file.name} no es un archivo .csv`,
        appearance: 'warning'
      }).subscribe();
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const lines = text.split('\n').filter(l => l.trim());

      if (lines.length === 0) {
        this.alerts.open('Archivo vacío', {
          label: `El archivo ${file.name} no contiene datos`,
          appearance: 'warning'
        }).subscribe();
        return;
      }

      const headers = lines[0].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
      const dataRows = lines.slice(1, 11).map(line =>
        line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
      );

      this.csvData = {
        headers,
        rows: dataRows,
        totalRows: lines.length - 1,
        fileName: file.name,
        fileSize: this.formatSize(file.size),
      };
      this.cdr.detectChanges();
    };
    reader.readAsText(file);
  }

  removeFile() {
    this.csvData = null;
    this.cdr.detectChanges();
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
    if (event.dataTransfer?.files) {
      const fakeEvent = { target: { files: event.dataTransfer.files } } as unknown as Event;
      this.onFilesSelected(fakeEvent);
    }
  }

  private formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
}
