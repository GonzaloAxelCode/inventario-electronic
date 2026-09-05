import { createTiendaAction, loadTiendasAction } from '@/app/state/actions/tienda.actions';
import { AppState } from '@/app/state/app.state';
import { selectTienda, selectTiendaState } from '@/app/state/selectors/tienda.selectors';
import { selectCurrenttUser } from '@/app/state/selectors/user.selectors';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TuiAppearance, TuiButton, TuiDataList, TuiLoader, TuiTextfield } from '@taiga-ui/core';
import { TuiInputModule, TuiSelectModule } from '@taiga-ui/legacy';
import { TuiDataListWrapper } from '@taiga-ui/kit';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-formaddstore',
  standalone: true,
  imports: [TuiLoader, CommonModule, ReactiveFormsModule, TuiTextfield, TuiInputModule, TuiSelectModule, TuiDataList, TuiDataListWrapper, TuiAppearance, TuiButton],
  templateUrl: './formaddstore.component.html',
  styleUrl: './formaddstore.component.scss'
})
export class FormaddstoreComponent implements OnInit {
  tiendaForm: FormGroup;
  protected loadingCreateTienda$!: Observable<any>
  selectedLogo: File | null = null;
  logoPreview: string | null = null;
  selectedLogoDark: File | null = null;
  logoDarkPreview: string | null = null;
  readonly seriesOptions = ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010'];

  isAdminTienda = false;
  parentTiendaId: number | null = null;
  parentTiendaNombre: string | null = null;
  parentTiendaRazonSocial: string | null = null;
  parentTiendaRuc: string | null = null;
  isSuperUser = false;
  selectedCert: File | null = null;
  certFileName: string | null = null;
  selectedCertPrivada: File | null = null;
  certPrivadaFileName: string | null = null;
  certPrivadaString: string | null = null;
  selectedCertPublica: File | null = null;
  certPublicaFileName: string | null = null;
  certPublicaString: string | null = null;
  tiendasList: any[] = [];
  esSucursal = false;

  constructor(private store: Store<AppState>, private fb: FormBuilder) {


    this.tiendaForm = this.fb.group({
      nombre: ['', Validators.required],
      razon_social: ['', Validators.required],
      ruc: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: [''],
      email: [''],
      activo: [true],
      representante: [''],
      serie: ["", Validators.required],
      sol_user: [''],
      sol_password: [''],
      tienda_padre_select: ['']
    });


    this.loadingCreateTienda$ = this.store.select(selectTienda);

  }

  ngOnInit(): void {
    this.store.select(selectCurrenttUser).pipe(map(u => u as any)).subscribe((user: any) => {
      if (!user) return;
      this.isSuperUser = !!user.is_superuser;
      const isAdmin = user.es_propietario === true;
      this.isAdminTienda = !this.isSuperUser && isAdmin;
      if (this.isAdminTienda) {
        const rawId: any = user.tienda;
        this.parentTiendaId = typeof rawId === 'number' ? rawId : rawId?.id ?? user.tienda_data?.id ?? null;
        this.parentTiendaNombre = user.tienda_data?.nombre ?? user.tienda_nombre ?? (this.parentTiendaId ? `Tienda #${this.parentTiendaId}` : null);
        this.parentTiendaRazonSocial = user.tienda_data?.razon_social ?? null;
        this.parentTiendaRuc = user.tienda_data?.ruc ?? null;

        // Auto-fill razon_social and ruc from parent store
        this.tiendaForm.patchValue({
          razon_social: this.parentTiendaRazonSocial || '',
          ruc: this.parentTiendaRuc || ''
        });
      } else {
        this.parentTiendaId = null;
        this.parentTiendaNombre = null;
        this.parentTiendaRazonSocial = null;
        this.parentTiendaRuc = null;
      }
      // Obligatorio solo para superusuario al final: elegir si es padre o sucursal
      const ctrl = this.tiendaForm.get('tienda_padre_select');
      if (this.isSuperUser) {
        ctrl?.setValidators([Validators.required]);
      } else {
        ctrl?.clearValidators();
        ctrl?.setValue('');
      }
      ctrl?.updateValueAndValidity({ emitEvent: false });
    });

    this.store.select(selectTiendaState).pipe(map(s => s.tiendas ?? [])).subscribe(tiendas => {
      this.tiendasList = tiendas;
    });
    // Cargar lista para superusuario si está vacía
    this.store.select(selectTienda).pipe(map(s => s as any)).subscribe((state: any) => {
      if (this.isSuperUser && (!state.tiendas || state.tiendas.length === 0) && !state.loadingTiendas) {
        this.store.dispatch(loadTiendasAction());
      }
    });

    // Detectar cambio en Jerarquía: si se selecciona una tienda (sucursal), heredar datos del padre
    this.tiendaForm.get('tienda_padre_select')?.valueChanges.subscribe(value => {
      this.esSucursal = !!value && value !== 'padre';
      if (this.esSucursal) {
        const selectedTienda = this.tiendasList?.find((t: any) => t.id === value);
        if (selectedTienda) {
          this.tiendaForm.patchValue({
            razon_social: selectedTienda.razon_social || '',
            ruc: selectedTienda.ruc || '',
            sol_user: '',
            sol_password: ''
          });
        }
      }
    });
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedLogo = input.files[0];
      const reader = new FileReader();
      reader.onload = e => this.logoPreview = reader.result as string;
      reader.readAsDataURL(this.selectedLogo);
    } else {
      this.selectedLogo = null;
      this.logoPreview = null;
    }
  }

  onLogoDarkSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedLogoDark = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.logoDarkPreview = reader.result as string;
      reader.readAsDataURL(this.selectedLogoDark);
    } else {
      this.selectedLogoDark = null;
      this.logoDarkPreview = null;
    }
  }

  onCertSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedCert = input.files[0];
      this.certFileName = this.selectedCert.name;
    } else {
      this.selectedCert = null;
      this.certFileName = null;
    }
  }

  onCertPrivadaSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedCertPrivada = input.files[0];
      this.certPrivadaFileName = this.selectedCertPrivada.name;
      const reader = new FileReader();
      reader.onload = () => this.certPrivadaString = reader.result as string;
      reader.readAsText(this.selectedCertPrivada);
    } else {
      this.selectedCertPrivada = null;
      this.certPrivadaFileName = null;
      this.certPrivadaString = null;
    }
  }

  onCertPublicaSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedCertPublica = input.files[0];
      this.certPublicaFileName = this.selectedCertPublica.name;
      const reader = new FileReader();
      reader.onload = () => this.certPublicaString = reader.result as string;
      reader.readAsText(this.selectedCertPublica);
    } else {
      this.selectedCertPublica = null;
      this.certPublicaFileName = null;
      this.certPublicaString = null;
    }
  }


  getJerarquiaLabel(value: string | number | null): string {
    if (!value) return 'Selecciona una opción';
    if (value === 'padre') return 'Registrar como tienda Padre';
    const tienda = this.tiendasList?.find((t: any) => t.id === value);
    if (tienda) {
      return `${tienda.nombre} — RUC ${tienda.ruc || '—'} · ID ${tienda.id}`;
    }
    return '';
  }

  onSubmit() {
    if (this.tiendaForm.valid) {
      // Creamos FormData
      const formData = new FormData();

      // Agregamos todos los campos del formulario excepto el select de padre (se maneja aparte)
      Object.entries(this.tiendaForm.value).forEach(([key, value]) => {
        if (key === 'tienda_padre_select') return;
        formData.append(key, value as any);
      });

      // Superusuario: obligatorio elegir si es padre o sucursal (última parte del form)
      if (this.isSuperUser) {
        const sel = this.tiendaForm.get('tienda_padre_select')?.value;
        if (sel && sel !== 'padre' && sel !== 'Registrar como tienda Padre') {
          const pid = String(sel);
          formData.append('tienda_padre', pid);
          formData.append('parent', pid);
          formData.append('parent_id', pid);
          formData.append('tienda_padre_id', pid);
          formData.append('es_sucursal', 'true');
          formData.append('es_padre', 'false');
        } else {
          formData.append('es_padre', 'true');
          formData.append('es_sucursal', 'false');
          formData.append('tienda_padre', '');
        }
      } else if (this.isAdminTienda && this.parentTiendaId) {
        // Admin tienda: solo bajo su tienda padre
        formData.append('tienda_padre', String(this.parentTiendaId));
        formData.append('parent', String(this.parentTiendaId));
        formData.append('parent_id', String(this.parentTiendaId));
        formData.append('tienda_padre_id', String(this.parentTiendaId));
      }

      // Agregamos logos si existen
      if (this.selectedLogo) {
        formData.append('logo_img', this.selectedLogo);
        formData.append('logo', this.selectedLogo);
      }
      if (this.selectedLogoDark) {
        formData.append('logo_dark', this.selectedLogoDark);
        formData.append('logo_dark_img', this.selectedLogoDark);
        formData.append('logo_oscuro', this.selectedLogoDark);
      }
      if (this.selectedCert && this.isSuperUser) {
        formData.append('certificado', this.selectedCert);
        formData.append('clave', this.selectedCert);
        formData.append('archivo_sunat', this.selectedCert);
        formData.append('sunat_cert', this.selectedCert);
      }

      // Convertimos los archivos de cert_clave_privada y cert_clave_publica a texto string y los enviamos en el payload
      if (this.certPrivadaString) {
        formData.append('cert_clave_privada', this.certPrivadaString);
      }
      if (this.certPublicaString) {
        formData.append('cert_clave_publica', this.certPublicaString);
      }

      // Despachamos la acción con FormData
      this.store.dispatch(createTiendaAction({ tienda: formData }));
      
      // Limpiamos el formulario
      this.tiendaForm.reset({
        nombre: [''],
        razon_social: [''],
        ruc: [''],
        direccion: [''],
        telefono: [''],
        email: [''],
        activo: [true],
        representante: [''],
        serie: [''],
        sol_user: [''],
        sol_password: [''],
        tienda_padre_select: [''],
      });
      this.selectedLogo = null;
      this.selectedLogoDark = null;
      this.logoDarkPreview = null;
      this.selectedCert = null;
      this.certFileName = null;
      this.selectedCertPrivada = null;
      this.certPrivadaFileName = null;
      this.certPrivadaString = null;
      this.selectedCertPublica = null;
      this.certPublicaFileName = null;
      this.certPublicaString = null;
    }
  }

}
