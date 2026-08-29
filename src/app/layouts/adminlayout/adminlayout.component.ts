import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TopnavAdminComponent } from '@/app/components/topnavadmin/topnavadmin.component';

@Component({
  selector: 'app-adminlayout',
  standalone: true,
  imports: [CommonModule, RouterModule, TopnavAdminComponent],
  templateUrl: './adminlayout.component.html',
  styleUrl: './adminlayout.component.scss'
})
export class AdminlayoutComponent {


}
