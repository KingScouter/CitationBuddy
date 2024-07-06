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
import { OAuth2Scopes, OAuth2Routes } from 'discord-api-types/v10';
import { AppConfig } from '../models';

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

  private readonly oauth2Scopes: OAuth2Scopes[] = [
    OAuth2Scopes.Identify,
    OAuth2Scopes.Guilds,
  ];

  private readonly oauth2Url = `${OAuth2Routes.authorizationURL}?client_id=${
    AppConfig.CLIENT_ID
  }&response_type=code&redirect_uri=${encodeURI(
    AppConfig.BASE_REDIRECT_URI
  )}&scope=${this.oauth2Scopes.join('+')}`;

  protected get currentUser(): Signal<DiscordAuth | null> {
    return computed(() => this.authenticationService.userAuth());
  }

  protected onHomeButtonClick(): void {
    this.router.navigate(['/']);
  }

  protected onLogin(): void {
    window.open(this.oauth2Url, '_self');
  }

  protected async onLogout(): Promise<void> {
    await this.authenticationService.logout();
  }
}
