import { SidenavadminComponent } from '@/app/components/sidenavadmin/sidenavadmin.component';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-adminlayout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidenavadminComponent],
  templateUrl: './adminlayout.component.html',
  styleUrl: './adminlayout.component.scss'
})
export class AdminlayoutComponent {

}
