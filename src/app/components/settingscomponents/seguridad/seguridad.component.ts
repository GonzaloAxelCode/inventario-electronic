import { clearTokensAction } from '@/app/state/actions/auth.actions';
import { clearInventariosFromCache } from '@/app/state/actions/inventario.actions';
import { clearUserAction } from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
import { initialStateUser, UserState } from '@/app/state/reducers/user.reducer';
import { selectUsersState } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TuiAppearance, TuiButton, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiButtonLoading, TuiFieldErrorPipe, TuiPassword } from '@taiga-ui/kit';
import { Observable } from 'rxjs';
import { User } from '@/app/models/user.models';

@Component({
  selector: 'app-seguridad',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TuiButton,
    TuiButtonLoading,
    TuiAppearance,
    TuiTextfield,
    TuiTitle,
    TuiPassword,
    TuiFieldErrorPipe,
  ],
  templateUrl: './seguridad.component.html',
  styleUrl: './seguridad.component.scss',
})
export class SeguridadComponent implements OnInit {
  userState$!: Observable<UserState>;
  user: User = initialStateUser.user;

  passwordForm: FormGroup;
  messageForm: FormGroup;
  loadingPassword = false;
  loadingLogout = false;
  loadingMessage = false;
  messageSent = false;

  recentSessions = [
    { device: 'Chrome - Windows', ip: '192.168.1.105', date: '08/07/2026 14:30', active: true },
    { device: 'App Mobile - Android', ip: '192.168.1.112', date: '08/07/2026 10:15', active: false },
    { device: 'Firefox - Windows', ip: '192.168.1.105', date: '07/07/2026 18:45', active: false },
  ];

  constructor(
    private store: Store<AppState>,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.userState$ = this.store.select(selectUsersState);

    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required, Validators.minLength(6)]],
      new_password: ['', [Validators.required, Validators.minLength(6)]],
      confirm_password: ['', [Validators.required]],
    });

    this.messageForm = this.fb.group({
      subject: ['', [Validators.required]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit() {
    this.userState$.subscribe(userState => {
      this.user = userState.user;
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;
    this.loadingPassword = true;
    setTimeout(() => {
      this.loadingPassword = false;
      this.passwordForm.reset();
    }, 2000);
  }

  sendMessage() {
    if (this.messageForm.invalid) return;
    this.loadingMessage = true;
    setTimeout(() => {
      this.loadingMessage = false;
      this.messageSent = true;
      this.messageForm.reset();
      setTimeout(() => this.messageSent = false, 3000);
    }, 2000);
  }

  logout() {
    this.loadingLogout = true;
    setTimeout(() => {
      this.store.dispatch(clearTokensAction());
      this.store.dispatch(clearUserAction());
      this.store.dispatch(clearInventariosFromCache());
      this.loadingLogout = false;
      this.router.navigate(['/login']);
    }, 3000);
  }
}
