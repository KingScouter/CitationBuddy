import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../authentication/authentication.service';
import { AppConfig } from '../models';
import { DiscordBackendService } from '../discord-backend/discord-backend.service';
import { APIUser, OAuth2Routes, OAuth2Scopes } from 'discord-api-types/v10';

@Component({
  selector: 'app-main-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-screen.component.html',
  styleUrl: './main-screen.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainScreenComponent {
  private readonly authenticationService = inject(AuthenticationService);
  private readonly discordBackendService = inject(DiscordBackendService);

  protected backendData = signal<string[]>([]);
  protected user = signal<APIUser | null>(null);

  protected get isLoggedIn(): Signal<boolean> {
    return this.authenticationService.isAuthenticated;
  }

  protected onLoginButtonClick(): void {
    const scopes = `${OAuth2Scopes.Identify}+${OAuth2Scopes.Guilds}`;

    console.log('Redirect to login');

    const redirectUrlDirect = `${OAuth2Routes.authorizationURL}?client_id=${
      AppConfig.CLIENT_ID
    }&response_type=code&redirect_uri=${encodeURI(
      AppConfig.BASE_REDIRECT_URI
    )}&scope=${scopes}`;
    window.open(redirectUrlDirect, '_self');
  }

  protected onLogoutButtonClick(): void {
    this.authenticationService.resetAuth();
  }

  protected async onGetUser(): Promise<void> {
    const channels = await this.discordBackendService.getUserInfoDiscord();
    this.backendData.set([JSON.stringify(channels)]);
  }

  protected async onGetChannels(): Promise<void> {
    const channels = await this.discordBackendService.getChannelsDiscord();
    this.backendData.set(channels.map((elem) => JSON.stringify(elem)));
  }

  protected async onTestButton(): Promise<void> {
    const user = await this.discordBackendService.getMe();
    if (user) {
      this.user.set(user);
    }
  }
}
