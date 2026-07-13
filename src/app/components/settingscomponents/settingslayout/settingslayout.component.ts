import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { TuiRepeatTimes } from '@taiga-ui/cdk';
import {
  TuiAppearance, TuiButton, TuiGroup,
  TuiIcon,
  TuiLink,
  TuiTextfield,
  TuiTitle
} from '@taiga-ui/core';
import { TuiBadge, TuiBlock, TuiBreadcrumbs, TuiFade, TuiTabs, TuiTabsWithMore } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader, TuiNavigation } from '@taiga-ui/layout';

@Component({
  selector: 'app-settingslayout',
  standalone: true,
  imports: [CommonModule, RouterModule, TuiTabsWithMore, TuiButton,
    TuiAppearance,
    TuiBadge,
    TuiBlock,
    TuiBreadcrumbs,
    TuiCardLarge,
    TuiFade,
    TuiGroup,
    TuiHeader,
    TuiIcon,
    TuiLink,
    TuiNavigation,
    TuiRepeatTimes,
    TuiTabs,
    TuiTextfield,
    TuiTitle],
  templateUrl: './settingslayout.component.html',
  styleUrl: './settingslayout.component.scss'
})
export class SettingslayoutComponent {

  constructor(private store: Store) {}

}
