import { Categoria } from '@/app/models/categoria.models';
import { DialogUpdateCategoriaService } from '@/app/services/dialogs-services/dialog-updatecategoria.service';
import { URL_BASE } from '@/app/services/utils/endpoints';
import { clearSearchClientes, forceSyncClientes, searchClientes } from '@/app/state/actions/cliente.actions';
import { AppState } from '@/app/state/app.state';
import { ClienteState } from '@/app/state/reducers/cliente.reducer';
import { selectCliente } from '@/app/state/selectors/cliente.selectors';
import { selectPermissions } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiResponsiveDialogService } from '@taiga-ui/addon-mobile';
import { TuiTable } from '@taiga-ui/addon-table';
import { tuiCountFilledControls } from '@taiga-ui/cdk';
import { TuiAppearance, TuiButton, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TUI_CONFIRM, TuiAvatar, TuiBadge, TuiChip, TuiConfirmData, TuiRadio, TuiSkeleton } from '@taiga-ui/kit';
import { TuiBlockStatus, TuiSearch } from '@taiga-ui/layout';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { map, Observable, Subject, takeUntil } from 'rxjs';
import { ButtonupdateComponent } from '../../buttonupdate/buttonupdate.component';
@Component({
  selector: 'app-tableclientes',
  standalone: true,

  imports: [CommonModule, TuiChip, ReactiveFormsModule, TuiTable, CommonModule,
    TuiAvatar, TuiLoader, TuiTextfield, TuiSearch,
    TuiRadio, ButtonupdateComponent,
    FormsModule, TuiSkeleton, InfiniteScrollModule,
    TuiTable, TuiButton, TuiAppearance, TuiBadge, TuiBlockStatus
  ],
  templateUrl: './tableclientes.component.html',
  styleUrl: './tableclientes.component.scss'
})
export class TableClientesComponent implements OnInit {
  selectClientes$?: Observable<ClienteState>
  userPermissions$ = this.store.select(selectPermissions);

  clientes: any[] = [];

  constructor(private fb: FormBuilder, private store: Store<AppState>) { }

  refreshClientes() {
    this.store.dispatch(forceSyncClientes());
  }
  private readonly dialogs = inject(TuiResponsiveDialogService);

  ngOnInit() {
    this.selectClientes$ = this.store.select(selectCliente);
    // Suscribirse al estado del inventario
    this.store.select(selectCliente)
      .pipe(takeUntil(this.destroy$))
      .subscribe((state) => {

        this.allClientes = state.clientes || [];
        this.clientes = state.clientes || [];
        this.allClientesSearch = state.clientes_search || [];
        this.clientes = state.clientes || [];

        // Si es la primera carga y no hay búsqueda activa, mostrar primeros items
        if (this.clientesToShow.length === 0 && this.allClientes.length > 0 && !this.isTheSearchWasDone) {
          this.loadInitialBatch();
        }

        // Si hay búsqueda activa y cambió el resultado, recargar
        if (this.isTheSearchWasDone && state.clientes_search) {
          this.loadInitialSearchBatch();
        }
      });

    this.form.valueChanges.subscribe(values => {
      this.onSubmitSearch()
      console.log(values)
    });
  }


  protected onDeleteCliente(id: any): void {
    const data: TuiConfirmData = {
      content: '¿Estás seguro de que deseas eliminarlo?',
      yes: 'Eliminar',
      no: 'Cancelar',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Confirmación de Eliminación',
        size: 's',
        data,
      })
      .subscribe((confirm) => {

      });
  }
  private readonly dialogService = inject(DialogUpdateCategoriaService);
  protected showDialogUpdate(categoria: Categoria): void {
    this.dialogService.open(categoria).subscribe((result: any) => {

    });
  }
  @ViewChild('scrollContainer', { read: ElementRef }) scrollContainer?: ElementRef;
  URL_BASE = URL_BASE
  protected open = false;
  protected index = 0;
  protected length = 1;
  isTheSearchWasDone: boolean = false
  // Listas que se muestran en la vista (scroll infinito)
  clientesToShow: any[] = [];
  clientesSearchToShow: any[] = [];

  allClientes: any[] = [];
  allClientesSearch: any[] = [];

  loading = false;
  hasMore = true;

  private readonly itemsPerBatch = 10; // Items por cada scroll
  private currentIndex = 0;
  private destroy$ = new Subject<void>();


  protected readonly form = new FormGroup({
    text: new FormControl(),


  });


  protected readonly count = toSignal(
    this.form.valueChanges.pipe(map(() => tuiCountFilledControls(this.form))),
    { initialValue: 0 },
  );

  // Getter para obtener la lista actual según el estado de búsqueda
  get currentClientes(): any[] {
    return this.isTheSearchWasDone ? this.clientesSearchToShow : this.clientesToShow;
  }

  clearSearch() {
    this.store.dispatch(clearSearchClientes());
    this.isTheSearchWasDone = false;
    // Resetear el scroll infinito a la lista normal
    this.currentIndex = 0;
    this.clientesSearchToShow = [];
    this.loadInitialBatch();
  }


  onSubmitSearch() {


    const searchQuery = {
      text: (this.form.value.text || "").trim(),

    }


    this.store.dispatch(searchClientes({ clientes: this.clientes, query: searchQuery }))
    this.isTheSearchWasDone = true;
    // Resetear y cargar búsqueda
    this.onSearchPerformed();
  }

  onSearchPerformed() {
    this.currentIndex = 0;
    this.clientesSearchToShow = [];
    this.loadInitialSearchBatch();
  }

  trackByFn(index: number, item: any) {
    return item.id;
  }

  onScroll() {
    if (this.loading || !this.hasMore) {
      return;
    }
    this.loadMore();
  }

  loadInitialBatch() {
    this.clientesToShow = this.allClientes.slice(0, this.itemsPerBatch);
    this.currentIndex = this.itemsPerBatch;
    this.hasMore = this.currentIndex < this.allClientes.length;
  }

  loadInitialSearchBatch() {
    this.clientesSearchToShow = this.allClientesSearch.slice(0, this.itemsPerBatch);
    this.currentIndex = this.itemsPerBatch;
    this.hasMore = this.currentIndex < this.allClientesSearch.length;
  }

  loadMore() {
    this.loading = true;

    setTimeout(() => {
      if (this.isTheSearchWasDone) {
        // Cargar más de búsqueda
        const nextBatch = this.allClientesSearch.slice(
          this.currentIndex,
          this.currentIndex + this.itemsPerBatch
        );

        this.clientesSearchToShow = [...this.clientesSearchToShow, ...nextBatch];
        this.currentIndex += this.itemsPerBatch;
        this.hasMore = this.currentIndex < this.allClientesSearch.length;
      } else {
        // Cargar más de clientes normales
        const nextBatch = this.allClientes.slice(
          this.currentIndex,
          this.currentIndex + this.itemsPerBatch
        );

        this.clientesToShow = [...this.clientesToShow, ...nextBatch];
        this.currentIndex += this.itemsPerBatch;
        this.hasMore = this.currentIndex < this.allClientes.length;
      }

      this.loading = false;
    }, 300);
  }

  stringify = (item: { id: number; nombre: string } | null) => item ? item.nombre : '';
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
