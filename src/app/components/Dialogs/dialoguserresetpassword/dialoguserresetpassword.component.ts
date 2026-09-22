import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiDialogContext, TuiIcon, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';
import { TuiPassword } from '@taiga-ui/kit';
import { User } from '@/app/models/user.models';
import { UserService } from '@/app/services/user.service';

@Component({
  selector: 'app-dialoguserresetpassword',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TuiButton, TuiLoader, TuiTextfield, TuiIcon, TuiPassword],
  templateUrl: './dialoguserresetpassword.component.html',
  styleUrl: './dialoguserresetpassword.component.scss',
})
export class DialoguserresetpasswordComponent {
  protected readonly context = injectContext<TuiDialogContext<boolean, User>>();
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

  saving = false;
  form: FormGroup;

  get user(): User {
    return this.context.data;
  }

  constructor() {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
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
    this.userService.adminResetPassword(this.user.id, this.form.value.newPassword).subscribe({
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
