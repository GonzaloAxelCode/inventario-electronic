import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TuiBlockStatus } from '@taiga-ui/layout';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, TuiBlockStatus],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss'
})
export class ReportesComponent {

}
