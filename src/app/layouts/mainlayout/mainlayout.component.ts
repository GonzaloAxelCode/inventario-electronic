import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidenavComponent } from "../../components/sidenav/sidenav.component";




@Component({
  selector: 'app-mainlayout',
  standalone: true,
  imports: [SidenavComponent, CommonModule, RouterModule,],
  templateUrl: './mainlayout.component.html',
  styleUrl: './mainlayout.component.scss'
})
export class MainlayoutComponent {

}
