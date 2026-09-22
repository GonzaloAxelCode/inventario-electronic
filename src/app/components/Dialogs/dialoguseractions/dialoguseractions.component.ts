import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TuiButton, TuiDialogContext } from '@taiga-ui/core';
import { injectContext } from '@taiga-ui/polymorpheus';
import { User } from '@/app/models/user.models';

export interface UserActionData {
  user: User;
  isSuperUser: boolean;
  isSelfAdmin: boolean;
  isDeleted: boolean;
}

export type UserActionResult = 'edit' | 'password' | 'permissions' | 'delete' | undefined;

@Component({
  selector: 'app-dialoguseractions',
  standalone: true,
  imports: [CommonModule, TuiButton],
  templateUrl: './dialoguseractions.component.html',
  styleUrl: './dialoguseractions.component.scss',
})
export class DialoguseractionsComponent {
  protected readonly context = injectContext<TuiDialogContext<UserActionResult, UserActionData>>();

  get data(): UserActionData {
    return this.context.data;
  }

  choose(action: NonNullable<UserActionResult>): void {
    this.context.completeWith(action);
  }

  onCancel(): void {
    this.context.completeWith(undefined);
  }
}
