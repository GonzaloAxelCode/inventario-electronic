import { clearTokensAction } from '@/app/state/actions/auth.actions';
import { forceSyncClientes } from '@/app/state/actions/cliente.actions';
import { forceSyncInventarios } from '@/app/state/actions/inventario.actions';
import { clearUserAction } from '@/app/state/actions/user.actions';
import { AppState } from '@/app/state/app.state';
import { selectCliente } from '@/app/state/selectors/cliente.selectors';
import { selectInventario } from '@/app/state/selectors/inventario.selectors';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { TuiAppearance, TuiButton } from '@taiga-ui/core';
import { ButtonupdateComponent } from "../../buttonupdate/buttonupdate.component";

@Component({
  selector: 'app-ventassettings',
  standalone: true,
  imports: [ButtonupdateComponent, RouterModule, CommonModule, TuiButton, TuiAppearance],
  templateUrl: './ventassettings.component.html',
  styleUrl: './ventassettings.component.scss'
})
export class VentassettingsComponent {

  loadingInventariosRefresh = false
  loadingClientesRefresh = false
  constructor(private store: Store<AppState>, public router: Router) {

  }
  ngOnInit(): void {
    this.store.select(selectInventario).subscribe((state) => {
      this.loadingInventariosRefresh = state.loadingProductosInventario || false
    })
    this.store.select(selectCliente).subscribe((state) => {
      this.loadingClientesRefresh = state.loadingClientes || false
    })

  }
  syncInventarios() {
    this.store.dispatch(forceSyncInventarios());

  }
  syncClientes() {
    this.store.dispatch(forceSyncClientes());
  }

  loadingLogout = false;

  logout2() {
    this.loadingLogout = true;

    setTimeout(() => {
      this.store.dispatch(clearTokensAction());
      this.store.dispatch(clearUserAction());
      this.loadingLogout = false;
      this.router.navigate(['/login']);
    }, 3000);
  }



}
