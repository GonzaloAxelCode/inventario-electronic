import { SidebarService } from '@/app/services/ui/sidebar-service.service';
import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiAppearance, TuiButton, TuiTextfield, TuiTitle } from '@taiga-ui/core';

import { TuiAvatar } from '@taiga-ui/kit';
import { TuiCell, TuiNavigation, TuiSearch } from '@taiga-ui/layout';



@Component({
  selector: 'app-header',
  standalone: true,
  imports: [AsyncPipe,
    ReactiveFormsModule,
    TuiAvatar,
    TuiCell,
    TuiAppearance,
    TuiNavigation,
    TuiSearch, TuiButton,
    TuiTextfield,
    TuiTitle,],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(public sidebarService: SidebarService) { }
  open = this.sidebarService.open
  openSidebar() {

    this.open.set(true);
  }
}
