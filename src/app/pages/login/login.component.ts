import { CommonModule } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	EventEmitter,
	inject,
	OnInit,
	Output,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

	readonly passwordFormControl = new FormControl('', Validators.required);
	readonly usernameFormControl = new FormControl('', [
		Validators.required,

	]);

	loginForm = new FormGroup({
		username: this.usernameFormControl,
		password: this.passwordFormControl,
	});

	ngOnInit(): void {

	}

	onSubmit(): void {

		if (this.loginForm.valid) {

			const formData: any = this.loginForm.value;

			this.store.dispatch(loginInAction(formData));

			this.authState$.subscribe((authState) => {
				if (authState.isAuthenticated) {

					this.router.navigate(['/']);
				}

			});
		}
	}

	isFormValid(): boolean {
		return this.loginForm.valid;
	}
}