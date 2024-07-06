import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuBarComponent } from './menu-bar/menu-bar.component';

@Component({
  standalone: true,
  imports: [RouterModule, MenuBarComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
