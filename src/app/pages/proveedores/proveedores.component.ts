import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [CommonModule],
  template: '',
})
export class ProveedoresComponent implements OnInit {
  private router = inject(Router);

  ngOnInit() {
    this.router.navigate(['/app/compras'], { fragment: 'proveedores', replaceUrl: true });
  }
}
