import { Tienda } from '@/app/models/tienda.models';
import { TiendaService } from '@/app/services/tienda.service';
import { imageUrl } from '@/app/services/utils/endpoints';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { TuiButton, TuiDialogContext, TuiLoader } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';

@Component({
  selector: 'app-dialogupdatelogos',
  standalone: true,
  imports: [CommonModule, TuiButton, TuiLoader],
  templateUrl: './dialogupdatelogos.component.html',
  styleUrl: './dialogupdatelogos.component.scss',
})
export class DialogupdatelogosComponent {
  protected readonly context = injectContext<TuiDialogContext<Tienda | null, Tienda>>();
  private readonly tiendaService = inject(TiendaService);
  private readonly cdRef = inject(ChangeDetectorRef);

  imageUrl = imageUrl;
  saving = false;

  selectedLogo: File | null = null;
  logoPreview: string | null = null;
  selectedLogoDark: File | null = null;
  logoDarkPreview: string | null = null;
  selectedBanner: File | null = null;
  bannerPreview: string | null = null;

  get tienda(): Tienda {
    return this.context.data;
  }

  onLogoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedLogo = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result as string;
        this.cdRef.markForCheck();
      };
      reader.readAsDataURL(this.selectedLogo);
    }
  }

  onLogoDarkSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedLogoDark = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.logoDarkPreview = reader.result as string;
        this.cdRef.markForCheck();
      };
      reader.readAsDataURL(this.selectedLogoDark);
    }
  }

  onBannerSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedBanner = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.bannerPreview = reader.result as string;
        this.cdRef.markForCheck();
      };
      reader.readAsDataURL(this.selectedBanner);
    }
  }

  get hasChanges(): boolean {
    return !!(this.selectedLogo || this.selectedLogoDark || this.selectedBanner);
  }

  onCancel(): void {
    this.context.completeWith(null);
  }

  onSave(): void {
    if (!this.hasChanges || this.saving) return;
    const formData = new FormData();
    if (this.selectedLogo) formData.append('logo_img', this.selectedLogo);
    if (this.selectedLogoDark) formData.append('logo_img_dark', this.selectedLogoDark);
    if (this.selectedBanner) formData.append('banner_img', this.selectedBanner);
    this.saving = true;
    this.cdRef.markForCheck();
    this.tiendaService.updateTiendaLogos(this.tienda.id, formData).subscribe({
      next: (actualizada) => {
        this.saving = false;
        this.context.completeWith(actualizada);
      },
      error: () => {
        this.saving = false;
        this.cdRef.markForCheck();
      },
    });
  }
}
