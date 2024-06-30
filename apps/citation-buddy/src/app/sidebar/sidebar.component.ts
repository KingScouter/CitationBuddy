import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OAuth2Routes, OAuth2Scopes } from 'discord-api-types/v10';
import { AppConfig } from '../models';
import { DiscordAuth } from '../models/discord-auth';
import { AuthenticationService } from '../authentication/authentication.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  private readonly authenticationService = inject(AuthenticationService);

  private readonly oauth2Scopes = `${OAuth2Scopes.Identify}+${OAuth2Scopes.Guilds}`;
  private readonly oauth2Url = `${OAuth2Routes.authorizationURL}?client_id=${
    AppConfig.CLIENT_ID
  }&response_type=code&redirect_uri=${encodeURI(
    AppConfig.BASE_REDIRECT_URI
  )}&scope=${this.oauth2Scopes}`;

  protected get currentUser(): Signal<DiscordAuth | null> {
    return computed(() => this.authenticationService.userAuth());
  }

  protected onLoginButtonClick(): void {
    window.open(this.oauth2Url, '_self');
  }

  protected onLogoutButtonClick(): void {
    console.log('Should revoke token');
  }
}
