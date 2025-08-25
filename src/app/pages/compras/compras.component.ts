import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TuiAppearance } from '@taiga-ui/core';
import { TuiBlockStatus } from '@taiga-ui/layout';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [CommonModule, TuiBlockStatus, TuiAppearance],
  templateUrl: './compras.component.html',
  styleUrl: './compras.component.scss'
})
export class ComprasComponent {

}
