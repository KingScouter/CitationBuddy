import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuBarComponent } from '../menu-bar/menu-bar.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [MenuBarComponent, RouterModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainComponent {}
