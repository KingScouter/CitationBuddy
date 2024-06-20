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

  protected get isLoggedIn(): Signal<boolean> {
    return this.authenticationService.isAuthenticated;
  }

  protected onLoginButtonClick(): void {
    const stateSecret = 'thisismytest';

    console.log('Redirect to login');
    const redirectUrlDirect = `https://discord.com/oauth2/authorize?response_type=token&client_id=${
      AppConfig.CLIENT_ID
    }&state=${stateSecret}&redirect_uri=${encodeURI(
      AppConfig.BASE_REDIRECT_URI
    )}%2Foauth&scope=identify+guilds`;
    window.open(redirectUrlDirect, '_self');
  }

  protected onLogoutButtonClick(): void {
    this.authenticationService.resetAuth();
  }

  protected onExchangeToken(): void {
    // this.discordBackendService.exchangeToken();
  }

  protected async onGetUser(): Promise<void> {
    const channels = await this.discordBackendService.getUserInfoDiscord();
    this.backendData.set([JSON.stringify(channels)]);
  }

  protected async onGetChannels(): Promise<void> {
    const channels = await this.discordBackendService.getChannelsDiscord();
    this.backendData.set(channels.map((elem) => JSON.stringify(elem)));
  }
}
