import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { DiscordAuth } from '../models/discord-auth';
import { DiscordBackendService } from '../discord-backend/discord-backend.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private readonly discordBackenService = inject(DiscordBackendService);

  isAuthenticated = computed(() => {
    return this._userAuth() !== null;
  });

  get userAuth(): Signal<DiscordAuth | null> {
    return this._userAuth;
  }

  private _userAuth = signal<DiscordAuth | null>(null);

  constructor() {
    this.checkAuthentication();
  }

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
