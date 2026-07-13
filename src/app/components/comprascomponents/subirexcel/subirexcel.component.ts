import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { TuiAlertService, TuiButton } from '@taiga-ui/core';

interface CsvFile {
  id: number;
  file: File;
  name: string;
  size: string;
  rows: number;
  preview: string[][];
}

@Component({
  selector: 'app-subirexcel',
  standalone: true,
  imports: [CommonModule, TuiButton],
  templateUrl: './subirexcel.component.html',
  styleUrl: './subirexcel.component.scss'
})
export class SubirexcelComponent {

  private alerts = inject(TuiAlertService);
  private cdr = inject(ChangeDetectorRef);

  csvFiles: CsvFile[] = [];
  private nextId = 0;

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const filesToProcess = Array.from(input.files);
    input.value = '';

    filesToProcess.forEach(file => {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        this.alerts.open('Archivo invalido', {
          label: `${file.name} no es un archivo .csv`,
          appearance: 'warning'
        }).subscribe();
        return;
      }

      const exists = this.csvFiles.some(f => f.name === file.name && f.size === this.formatSize(file.size));
      if (exists) {
        this.alerts.open('Archivo duplicado', {
          label: `${file.name} ya fue agregado`,
          appearance: 'warning'
        }).subscribe();
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        const lines = text.split('\n').filter(l => l.trim());
        const preview = lines.slice(0, 5).map(line => line.split(',').map(c => c.trim()));

        this.csvFiles = [...this.csvFiles, {
          id: this.nextId++,
          file,
          name: file.name,
          size: this.formatSize(file.size),
          rows: lines.length > 0 ? lines.length - 1 : 0,
          preview,
        }];
        this.cdr.detectChanges();
      };
      reader.readAsText(file);
    });
  }

  removeFile(id: number) {
    this.csvFiles = this.csvFiles.filter(f => f.id !== id);
    this.cdr.detectChanges();
  }

  trackById(index: number, item: CsvFile): number {
    return item.id;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
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
