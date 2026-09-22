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
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { map } from 'rxjs';
import { loginInAction } from '../../state/actions/auth.actions';
import { selectAuth } from '../../state/selectors/auth.selectors';

/** Bloquea vacíos y cadenas con solo espacios (Validators.required solo bloquea '' ). */
export function noBlankValidator(control: AbstractControl): ValidationErrors | null {
	const value = control.value ?? '';
	return String(value).trim().length === 0 ? { blank: true } : null;
}

/**
 * Limpia el username: quita espacios raros del portapapeles
 * (NBSP, espacios unicode, zero-width, tabs, saltos de línea) y recorta inicio/fin.
 * Preserva mayúsculas/minúsculas y espacios internos normales.
 */
export function sanitizeUsername(value: string | null | undefined): string {
	return (value ?? '')
		.normalize('NFKC')
		.replace(/[\u200B-\u200D\uFEFF]/g, '')
		.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, ' ')
		.replace(/[\r\n\t]+/g, '')
		.trim();
}



@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	standalone: true,
	imports: [ReactiveFormsModule, CommonModule, MatButtonModule, MatIconModule],
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

	readonly passwordFormControl = new FormControl('', [Validators.required, noBlankValidator]);
	readonly usernameFormControl = new FormControl('', [
		Validators.required,
		noBlankValidator,
	]);

	loginForm = new FormGroup({
		username: this.usernameFormControl,
		password: this.passwordFormControl,
	});

	showPassword = false;

  /** Aviso de Bloq Mayús en el campo contraseña. */
  capsLockOn = false;

  checkCapsLock(event: KeyboardEvent): void {
    const on =
      typeof event.getModifierState === 'function' && event.getModifierState('CapsLock');
    if (on !== this.capsLockOn) {
      this.capsLockOn = on;
    }
  }

  hideCapsLockHint(): void {
    this.capsLockOn = false;
  }

  showForgotModal = false;

	@ViewChild('usernameInput') usernameInputRef?: ElementRef<HTMLInputElement>;

	// Anillo de puntos decorativo alrededor del logo (estilo Apple ID)
	readonly ringDots = Array.from({ length: 32 }).map((_, i) => ({
		angle: i * (360 / 32),
		radius: i % 2 === 0 ? 66 : 74,
		size: i % 3 === 0 ? 9 : 6,
		hue: Math.round((i * 360) / 32),
	}));

	ngOnInit(): void {
		setTimeout(() => this.usernameInputRef?.nativeElement.focus(), 60);
	}

	/** Quita espacios de inicio/fin del username (trim) al salir del campo. */
	trimUsernameOnBlur(): void {
		const cleaned = sanitizeUsername(this.usernameFormControl.value);
		if (cleaned !== (this.usernameFormControl.value ?? '')) {
			this.usernameFormControl.setValue(cleaned);
		}
	}

	/**
	 * Pegar con Ctrl+V en username: inserta el texto limpio (sin NBSP,
	 * zero-width, tabs ni saltos) respetando la posición del cursor.
	 */
	onUsernamePaste(event: ClipboardEvent): void {
		event.preventDefault();
		const pasted = sanitizeUsername(event.clipboardData?.getData('text') ?? '');
		const input = event.target as HTMLInputElement | null;
		const current: string = this.usernameFormControl.value ?? '';
		const start = input?.selectionStart ?? current.length;
		const end = input?.selectionEnd ?? start;
		const next = sanitizeUsername(current.slice(0, start) + pasted + current.slice(end));
		this.usernameFormControl.setValue(next);
		requestAnimationFrame(() => {
			try {
				const pos = Math.min(start + pasted.length, next.length);
				input?.setSelectionRange(pos, pos);
			} catch { /* inputs sin selección: ignorar */ }
		});
	}

	togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

	/**
	 * Pegar con Ctrl+V en contraseña: inserta el texto TAL CUAL, sin recortar
	 * ni limpiar espacios (los espacios forman parte de la contraseña).
	 */
	onPasswordPaste(event: ClipboardEvent): void {
		event.preventDefault();
		const pasted = event.clipboardData?.getData('text') ?? '';
		const input = event.target as HTMLInputElement | null;
		const current: string = this.passwordFormControl.value ?? '';
		const start = input?.selectionStart ?? current.length;
		const end = input?.selectionEnd ?? start;
		const next = current.slice(0, start) + pasted + current.slice(end);
		this.passwordFormControl.setValue(next);
		requestAnimationFrame(() => {
			try {
				const pos = start + pasted.length;
				input?.setSelectionRange(pos, pos);
			} catch { /* inputs sin selección: ignorar */ }
		});
	}

  openForgotModal(): void {
    this.showForgotModal = true;
  }

  closeForgotModal(): void {
    this.showForgotModal = false;
  }

  showPrivacyModal = false;
  showTermsModal = false;

  openPrivacyModal(): void {
    this.showPrivacyModal = true;
  }

  closePrivacyModal(): void {
    this.showPrivacyModal = false;
  }

  openTermsModal(): void {
    this.showTermsModal = true;
  }

  closeTermsModal(): void {
    this.showTermsModal = false;
  }

	onSubmit(): void {
		// Bloquea envío con vacíos o solo espacios (aunque el botón ya está disabled).
		if (this.loginForm.invalid) {
			this.loginForm.markAllAsTouched();
			return;
		}

		const rawUsername: string = this.usernameFormControl.value ?? '';
		const rawPassword: string = this.passwordFormControl.value ?? '';
		// Login sensible a mayúsculas/minúsculas: NO usar toLowerCase()/toUpperCase().
		// Solo se recortan espacios de inicio/fin del usuario (más raros del portapapeles);
		// la contraseña se envía intacta.
		const username = sanitizeUsername(rawUsername);
		// Sincroniza el campo visible ya recortado.
		if (username !== rawUsername) {
			this.usernameFormControl.setValue(username);
		}

		if (!username || !rawPassword || !rawPassword.trim()) {
			this.loginForm.markAllAsTouched();
			return;
		}

		const formData: any = { username, password: rawPassword };

		this.store.dispatch(loginInAction(formData));

		this.authState$.subscribe((authState) => {
			if (authState.isAuthenticated) {
				window.location.replace('/');
			}
		});
	}

	isFormValid(): boolean {
		return this.loginForm.valid;
	}
}