import { Caja, OperacionCaja } from '@/app/models/caja.models';
import { DialogAperturaCajaService } from '@/app/services/dialogs-services/dialog-apertura-caja.service';
import { DialogCerrarCajaService } from '@/app/services/dialogs-services/dialog-cerrar-caja.service';
import { DialogRealizarPrestamoService } from '@/app/services/dialogs-services/dialog-realizar-prestamo.service';
import { DialogRegistrarGastoService } from '@/app/services/dialogs-services/dialog-registrar-gasto.service';
import { DialogRegistrarIngresoService } from '@/app/services/dialogs-services/dialog-registrar-ingreso.service';
import { DialogReinicializarCajaService } from '@/app/services/dialogs-services/dialog-reinicializar-caja.service';
import { createCaja, loadCaja } from '@/app/state/actions/caja.actions';
import { AppState } from '@/app/state/app.state';
import { selectCaja, selectCajaState } from '@/app/state/selectors/caja.selectors';
import { AsyncPipe, CommonModule, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { select, Store } from '@ngrx/store';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiDay } from '@taiga-ui/cdk';
import {
  TuiAppearance,
  TuiButton,
  TuiError,
  TuiFormatDatePipe,
  TuiFormatNumberPipe,
  TuiIcon,
  TuiNotification,
  TuiTextfield,
  TuiTitle,
} from '@taiga-ui/core';
import { TuiFieldErrorPipe, TuiInputInline, TuiInputNumber, TuiSegmented, TuiSwitch, TuiTooltip } from '@taiga-ui/kit';
import { TuiCardLarge, TuiCell, TuiForm, TuiHeader } from '@taiga-ui/layout';
import { TuiInputDateModule, TuiSelectModule, TuiTextfieldControllerModule } from '@taiga-ui/legacy';

import { selectAuth } from '@/app/state/selectors/auth.selectors';
import { selectCurrenttUser, selectUsersState } from '@/app/state/selectors/user.selectors';
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID } from '@angular/core';
import { TuiFormatDateService } from '@taiga-ui/core';
import { TuiInputModule, TuiTextareaModule, } from '@taiga-ui/legacy';
import { formatDistance } from 'date-fns';
import { map, Observable, of, timer } from 'rxjs';

@Injectable()
export class FormatService extends TuiFormatDateService {
  private readonly delay$ = isPlatformBrowser(inject(PLATFORM_ID))
    ? timer(0, 1000)
    : of(0);

  public override format(timestamp: number): Observable<string> {
    return this.delay$.pipe(map(() => formatDistance(timestamp, Date.now())));
  }
}


@Component({
  selector: 'app-caja',
  standalone: true,
  imports: [AsyncPipe, CommonModule,
    NgIf,
    ReactiveFormsModule, TuiInputInline,
    TuiAppearance,
    TuiButton,
    TuiCardLarge,
    TuiError,
    TuiFieldErrorPipe, FormsModule,
    TuiForm,
    TuiHeader,
    TuiIcon, TuiInputNumber,
    TuiNotification,
    TuiSegmented,
    TuiSwitch,
    TuiTextfield,
    TuiTitle,
    TuiTooltip, TuiFormatNumberPipe, TuiTable,
    TuiTextfieldControllerModule, TuiSelectModule,
    TuiInputModule, TuiTextareaModule,
    TuiInputDateModule, TuiCell, TuiFormatDatePipe
  ],

  templateUrl: './caja.component.html',
  providers: [TuiFormatDatePipe,
    {
      provide: TuiFormatDateService,
      useClass: FormatService,
    },
  ],
  styleUrl: './caja.component.scss'
})
export class CajaComponent implements OnInit {
  caja_is_open$!: Observable<boolean>;
  operaciones: OperacionCaja[] = []
  selectCaja$!: Observable<Caja>;
  authState$ = this.store.pipe(select(selectAuth));
  tiendaUser!: number

  userId!: number;

  protected readonly form = new FormGroup({
    saldo_inicial: new FormControl("", Validators.required),
  });

  protected readonly columns = ["id_operacion", "detalles", "tipo", "usuario", "fecha", "monto"]
  constructor(private store: Store<AppState>) {
    this.store.select(selectUsersState).pipe(
      map(userState => userState.user.tienda)
    ).subscribe(tienda => {
      this.tiendaUser = tienda || 0;
    });
    this.store.dispatch(loadCaja());
    this.caja_is_open$ = this.store.select(selectCajaState).pipe(
      map(caja => caja.caja_is_open)
    );
    this.selectCaja$ = this.store.select(selectCajaState).pipe(
      map(caja => caja.caja)
    );

  }

  ngOnInit(): void {
    this.store.select(selectCurrenttUser).subscribe((state) => {
      this.userId = state.id
    })
    this.store.select(selectCaja).subscribe((state) => {
      console.log(state)
      this.operaciones = state.operaciones
    });


  }



  protected count = '0';
  todaySales = 0
  thisWeekSales = 0
  thisMonthSales = 0
  currentDay: string = '';
  currentMonth: string = '';
  currentWeek: number = 0;

  protected readonly testForm = new FormGroup({
    testValue: new FormControl(TuiDay.currentLocal()),
  });

  protected readonly testFormMonth = new FormGroup({
    month: new FormControl(0), // Valor inicial: 0 (Enero)
  });
  getCurrentMonthName(): string {
    const currentMonth = new Date().getMonth(); // Obtiene el índice del mes actual (0 = Enero, 1 = Febrero, etc.)
    return this.months[currentMonth].name; // Devuelve el nombre del mes actual
  }
  months = [
    { number: 1, name: 'Enero' },
    { number: 2, name: 'Febrero' },
    { number: 3, name: 'Marzo' },
    { number: 4, name: 'Abril' },
    { number: 5, name: 'Mayo' },
    { number: 6, name: 'Junio' },
    { number: 7, name: 'Julio' },
    { number: 8, name: 'Agosto' },
    { number: 9, name: 'Septiembre' },
    { number: 10, name: 'Octubre' },
    { number: 11, name: 'Noviembre' },
    { number: 12, name: 'Diciembre' },
  ];
  onMonthChange(selectedMonth: string) {
  }

  private readonly dialogApertura = inject(DialogAperturaCajaService);
  private readonly dialogCierre = inject(DialogCerrarCajaService);
  private readonly dialogGasto = inject(DialogRegistrarGastoService);
  private readonly dialogIngreso = inject(DialogRegistrarIngresoService);

  private readonly dialogReinicializarCaja = inject(DialogReinicializarCajaService);
  private readonly dialogRealizarPrestamo = inject(DialogRealizarPrestamoService);

  openRealizarPrestamo() {
    this.dialogRealizarPrestamo.open().subscribe(data => {
      if (data) {
        console.log('Caja abierta');
      }
    });
  }
  openReabriCaja() {
    this.dialogReinicializarCaja.open().subscribe(data => {
      if (data) {
        console.log('Caja abierta');
      }
    });
  }
  openAperturaCaja() {
    this.dialogApertura.open().subscribe(data => {
      if (data) {
        console.log('Caja abierta');
      }
    });
  }

  openCerrarCaja() {
    this.dialogCierre.open().subscribe(data => {
      if (data) {
        console.log('Comentario al cerrar:');
      }
    });
  }

  openRegistrarGasto() {
    this.dialogGasto.open().subscribe(data => {
      if (data) {
        console.log('Gasto registrado:');
      }
    });
  }

  openRegistrarIngreso() {
    this.dialogIngreso.open().subscribe(data => {
      if (data) {
        console.log('Ingreso registrado:',);
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.store.dispatch(createCaja({


        saldoInicial: this.form.value.saldo_inicial
      }))
    }
  }
}
