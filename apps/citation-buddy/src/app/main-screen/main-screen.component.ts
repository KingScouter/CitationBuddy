import {
  ChangeDetectionStrategy,
  Component,
  Signal,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../authentication/authentication.service';
import { AppConfig } from '../models';
import { DiscordBackendService } from '../discord-backend/discord-backend.service';
import { OAuth2Routes, OAuth2Scopes } from 'discord-api-types/v10';
import { DiscordAuth } from '../models/discord-auth';

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

  private readonly oauth2Scopes = `${OAuth2Scopes.Identify}+${OAuth2Scopes.Guilds}`;
  private readonly oauth2Url = `${OAuth2Routes.authorizationURL}?client_id=${
    AppConfig.CLIENT_ID
  }&response_type=code&redirect_uri=${encodeURI(
    AppConfig.BASE_REDIRECT_URI
  )}&scope=${this.oauth2Scopes}`;

  protected backendData = signal<string[]>([]);

  protected get currentUser(): Signal<DiscordAuth | null> {
    return computed(() => this.authenticationService.userAuth());
  }

  protected onLoginButtonClick(): void {
    window.open(this.oauth2Url, '_self');
  }

  protected onLogoutButtonClick(): void {
    console.log('Should revoke token');
  }

  protected async onGetChannels(): Promise<void> {
    const channels = await this.discordBackendService.getGuilds();
    this.backendData.set(channels.map((elem) => JSON.stringify(elem)));
  }
}
