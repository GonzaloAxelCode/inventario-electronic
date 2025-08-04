import { CustomToastService } from '@/app/services/ui/custom-alert.service';
import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { TuiAlertContext, TuiIcon } from '@taiga-ui/core';

import { PolymorpheusOutlet, PolymorpheusTemplate } from '@taiga-ui/polymorpheus';

@Component({
  selector: 'app-custom-toast',
  standalone: true,
  imports: [CommonModule, PolymorpheusOutlet,
    PolymorpheusTemplate, TuiIcon],
  templateUrl: './custom-toast.component.html',
  styleUrls: ['./custom-toast.component.scss'],
})
export class CustomToastComponent {
  @ViewChild('customAlertTemplate', { static: true })
  customAlertTemplate!: TemplateRef<TuiAlertContext>;

  constructor(private readonly customToastService: CustomToastService) { }

  showToast(appearance: 'positive' | 'negative' | 'warning' | 'info' | 'neutral', label: string, message: string): void {
    this.customToastService.showToast(this.customAlertTemplate, {
      label,
      appearance,
      data: { message }, // Puedes pasar cualquier dato adicional aquí
      autoClose: 3000,
    });
  }
}
