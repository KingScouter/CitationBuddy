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

@Component({
  selector: 'app-menu-bar',
  standalone: true,
  imports: [CommonModule, UserInfoComponent],
  templateUrl: './menu-bar.component.html',
  styleUrl: './menu-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuBarComponent {
  private readonly authenticationService = inject(AuthenticationService);

  protected get currentUser(): Signal<DiscordAuth | null> {
    return computed(() => this.authenticationService.userAuth());
  }
}
