import { Tienda } from '@/app/models/tienda.models';
import { eliminarTiendaPermanently, eliminarTiendaPermanentlySuccess } from '@/app/state/actions/tienda.actions';
import { AppState } from '@/app/state/app.state';
import { selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiAlertService, TuiAppearance, TuiButton, TuiDialogContext, TuiLoader } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiConfirmData } from '@taiga-ui/kit';
import { injectContext } from '@taiga-ui/polymorpheus';
import { Subject, takeUntil } from 'rxjs';
import { TableUsersComponent } from '../../Tables/tableusers/tableusers.component';
@Component({
  selector: 'app-dialogdetailtienda',
  standalone: true,
  imports: [TableUsersComponent, CommonModule, TuiButton, TuiAppearance, TuiLoader],
  templateUrl: './dialogdetailtienda.component.html',
  styleUrl: './dialogdetailtienda.component.scss'
})
export class DialogdetailtiendaComponent implements OnInit {
  protected readonly context = injectContext<TuiDialogContext<boolean, Tienda>>();
  public tienda: Tienda = this.context.data ?? {};

  private destroy$ = new Subject<void>();
  constructor(private store: Store<AppState>, private fb: FormBuilder, private actions$: Actions, private cdRef: ChangeDetectorRef) { }
  deleteTiendaLoader: boolean = false;

  private readonly dialogs = inject(TuiResponsiveDialogService);
  private readonly alerts = inject(TuiAlertService);
  protected onDeleteTienda(id: any): void {
    const data: TuiConfirmData = {
      appearance: "negative",
      content: '¿Estás seguro de que deseas eliminar esta tienda',
      yes: 'Eliminar Permanentemente',
      no: 'Cancelar',

    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Confirmación de Eliminación',
        size: 's',
        data,
      })
      .subscribe((confirm) => {
        if (confirm) {

          this.store.dispatch(eliminarTiendaPermanently({ id }));
          this.actions$.pipe(
            ofType(eliminarTiendaPermanentlySuccess),
            takeUntil(this.destroy$)
          ).subscribe(() => {
            this.alerts.open('Eliminado exitosamente.').subscribe();
            this.context.completeWith(true);

          });



        } else {

          this.alerts.open('Eliminación cancelada.').subscribe();
        }
      });


  }

  ngOnInit() {
    this.store.select(selectTiendaState).subscribe((tiendaState) => {
      this.deleteTiendaLoader = tiendaState.loadingDeleteTienda;
      this.cdRef.markForCheck();
    })

    //aca escuchar el reducer si fue eliminado exitosamente para cerrar el dialog escucha el action 
  }
}
