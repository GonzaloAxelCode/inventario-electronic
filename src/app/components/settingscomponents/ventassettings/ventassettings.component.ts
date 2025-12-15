import { forceSyncInventarios } from '@/app/state/actions/inventario.actions';
import { AppState } from '@/app/state/app.state';
import { selectInventario } from '@/app/state/selectors/inventario.selectors';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { ButtonupdateComponent } from "../../buttonupdate/buttonupdate.component";

@Component({
  selector: 'app-ventassettings',
  standalone: true,
  imports: [ButtonupdateComponent, CommonModule],
  templateUrl: './ventassettings.component.html',
  styleUrl: './ventassettings.component.scss'
})
export class VentassettingsComponent {

  loadingInventariosRefresh = false
  constructor(private store: Store<AppState>) {

  }
  ngOnInit(): void {
    this.store.select(selectInventario).subscribe((state) => {
      this.loadingInventariosRefresh = state.loadingProductosInventario || false
    })


  }
  syncInventarios() {
    this.store.dispatch(forceSyncInventarios());

  }

}
