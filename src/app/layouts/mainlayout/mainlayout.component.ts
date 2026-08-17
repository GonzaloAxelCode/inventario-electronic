import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidenavComponent } from "../../components/sidenav/sidenav.component";
import { TopnavComponent } from "../../components/topnav/topnav.component";
import { LayoutService } from '@/app/services/ui/layout-service.service';

@Component({
  selector: 'app-mainlayout',
  standalone: true,
  imports: [SidenavComponent, TopnavComponent, CommonModule, RouterModule],
  templateUrl: './mainlayout.component.html',
  styleUrl: './mainlayout.component.scss'
})
export class MainlayoutComponent {
  constructor(public layoutService: LayoutService) {}
}
