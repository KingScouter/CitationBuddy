import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserInfoComponent } from './user-info/user-info.component';
import { DiscordAuth } from '../models/discord-auth';
import { AuthenticationService } from '../authentication/authentication.service';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [CommonModule, UserInfoComponent, MatIconModule],
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuBarComponent {
  private readonly authenticationService = inject(AuthenticationService);
  private readonly router = inject(Router);

  protected get currentUser(): Signal<DiscordAuth | null> {
    return computed(() => this.authenticationService.userAuth());
  }

  protected onHomeButtonClick(): void {
    this.router.navigate(['/']);
  }
}
