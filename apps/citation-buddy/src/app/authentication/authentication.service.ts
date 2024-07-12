import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { DiscordAuth } from '../models/discord-auth';
import { DiscordBackendService } from '../discord-backend/discord-backend.service';
import { OAuth2Scopes, OAuth2Routes } from 'discord-api-types/v10';
import { AppConfig } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly discordBackenService = inject(DiscordBackendService);

  private readonly oauth2Scopes: OAuth2Scopes[] = [
    OAuth2Scopes.Identify,
    OAuth2Scopes.Guilds,
  ];

  private readonly _oauth2Url = `${OAuth2Routes.authorizationURL}?client_id=${
    AppConfig.CLIENT_ID
  }&response_type=code&redirect_uri=${encodeURI(
    AppConfig.BASE_REDIRECT_URI
  )}&scope=${this.oauth2Scopes.join('+')}`;

  private readonly _userAuth = signal<DiscordAuth | null>(null);

  isAuthenticated = computed(() => {
    return this._userAuth() !== null;
  });

  get userAuth(): Signal<DiscordAuth | null> {
    return this._userAuth;
  }

  get oauth2Url(): string {
    return this._oauth2Url;
  }

  constructor() {
    this.checkAuthentication();
  }

  /**
   * Check if the authentication stored in the browser is valid by requsting the user-data from the backend.
   * @returns { Promise<DiscordAuth | null> } The user-data if the authentication is valid, otherwise null
   */
  async checkAuthentication(): Promise<DiscordAuth | null> {
    try {
      const user = await this.discordBackenService.getMe();
      const discordAuth: DiscordAuth = {
        id: user.id,
        username: user.username,
        name: user.global_name ?? '',
        avatar: user.avatar ?? '',
      };
      this._userAuth.set(discordAuth);
      return discordAuth;
    } catch (ex) {
      console.log('User not authenticated: ', ex);
      this._userAuth.set(null);
      return null;
    }
  }

  /**
   * Reset the user and send the logout-request to the backend.
   */
  async logout(): Promise<void> {
    this._userAuth.set(null);
    await this.discordBackenService.logout();
  }

  // private checkAuthExpiration(auth: DiscordAuth): boolean {
  //   console.log(
  //     'ExpirationDate: ',
  //     auth.expirationDate,
  //     new Date(auth.expirationDate).toDateString(),
  //     ', current date: ',
  //     new Date().toDateString(),
  //     Date.now()
  //   );
  //   return new Date(auth.expirationDate).getTime() > Date.now();
  // }
}
