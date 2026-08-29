import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	EventEmitter,
	inject,
	OnInit,
	Output,
	ViewChild
} from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { map } from 'rxjs';
import { loginInAction } from '../../state/actions/auth.actions';
import { selectAuth } from '../../state/selectors/auth.selectors';



@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	standalone: true,
	imports: [ReactiveFormsModule, FormsModule, CommonModule, MatButtonModule, MatIconModule],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
	@Output() eventClickChangeTab = new EventEmitter<number>();
	onClickRedirectLogin(): void {
		this.eventClickChangeTab.emit(1);
	}
	private store = inject(Store<any>);
	private router = inject(Router);


	authState$ = this.store.pipe(select(selectAuth));

	isAuthSuccess: boolean = false;
	errors: any;

	isLoading$ = this.authState$.pipe(map(authState => authState.isLoadingLogin));

	readonly passwordFormControl = new FormControl('', Validators.required);
	readonly usernameFormControl = new FormControl('', [
		Validators.required,

	]);

	loginForm = new FormGroup({
		username: this.usernameFormControl,
		password: this.passwordFormControl,
	});

	// --- Vista actual: landing (portada) o login (formulario) ---
	view: 'landing' | 'login' = 'landing';

showPassword = false;

  showForgotModal = false;

  // "Recordarme" es solo UI: se mantiene fuera del loginForm a propósito
  // para no alterar el payload que recibe loginInAction (username/password).
  rememberMe = true;

	@ViewChild('usernameInput') usernameInputRef?: ElementRef<HTMLInputElement>;

	// Anillo de puntos decorativo alrededor del logo (estilo Apple ID)
	readonly ringDots = Array.from({ length: 32 }).map((_, i) => ({
		angle: i * (360 / 32),
		radius: i % 2 === 0 ? 66 : 74,
		size: i % 3 === 0 ? 9 : 6,
		hue: Math.round((i * 360) / 32),
	}));

	ngOnInit(): void {

	}

	onStartLogin(): void {
		this.view = 'login';
		setTimeout(() => this.usernameInputRef?.nativeElement.focus(), 60);
	}

	onBackToLanding(): void {
		this.view = 'landing';
		this.showPassword = false;
	}

togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  openForgotModal(): void {
    this.showForgotModal = true;
  }

  closeForgotModal(): void {
    this.showForgotModal = false;
  }

	onSubmit(): void {

		if (this.loginForm.valid) {

			const formData: any = this.loginForm.value;

			this.store.dispatch(loginInAction(formData));

			this.authState$.subscribe((authState) => {
				if (authState.isAuthenticated) {
					window.location.replace('/');

				}

			});
		}
	}

	isFormValid(): boolean {
		return this.loginForm.valid;
	}
}