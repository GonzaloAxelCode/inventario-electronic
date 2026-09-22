import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiDialogContext, TuiLoader } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';
import { TuiInputModule } from '@taiga-ui/legacy';
import { User } from '@/app/models/user.models';
import { UserService } from '@/app/services/user.service';

@Component({
  selector: 'app-dialoguseredit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TuiButton, TuiLoader, TuiInputModule],
  templateUrl: './dialoguseredit.component.html',
  styleUrl: './dialoguseredit.component.scss',
})
export class DialogusereditComponent {
  protected readonly context = injectContext<TuiDialogContext<boolean, User>>();
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

  saving = false;
  form: FormGroup;

  get user(): User {
    return this.context.data;
  }

  constructor() {
    const u = this.context.data;
    this.form = this.fb.group({
      username: [u?.username || '', Validators.required],
      first_name: [u?.first_name || ''],
      last_name: [u?.last_name || ''],
    });
  }

  onCancel(): void {
    this.context.completeWith(false);
  }

  onSave(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving = true;
    this.userService.updateUserBasicData(this.user.id, this.form.value).subscribe({
      next: () => {
        this.saving = false;
        this.context.completeWith(true);
      },
      error: () => {
        this.saving = false;
        this.context.completeWith(false);
      },
    });
  }
}
