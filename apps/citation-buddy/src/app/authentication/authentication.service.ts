import { Injectable, Signal, computed, signal } from '@angular/core';
import { DiscordAuth } from '../models/discord-auth';
import { AppConfig } from '../models';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  isAuthenticated = computed(() => {
    return this._userAuth() !== null;
  });

  get userAuth(): Signal<DiscordAuth | null> {
    return this._userAuth;
  }

  private _userAuth = signal<DiscordAuth | null>(null);

  constructor() {
    this.getAuthFromCookie();
  }

  setAuthByUrlFragments(url: string): void {
    const parsedHash = new URLSearchParams(url);
    console.log('Parsed: ', parsedHash);
    const expiresIn = parsedHash.get('expires_in') ?? '';
    const discordAuth: DiscordAuth = {
      tokenType: parsedHash.get('token_type') ?? '',
      accessToken: parsedHash.get('access_token') ?? '',
      expirationDate: 0,
      state: parsedHash.get('state') ?? '',
    };
    if (
      !discordAuth.tokenType ||
      !discordAuth.accessToken ||
      !expiresIn ||
      !discordAuth.state
    ) {
      return;
    }

    discordAuth.expirationDate = Date.now() + Number.parseInt(expiresIn) * 1000;

    console.log(
      'SetAuth - ExpiresIn: ',
      expiresIn,
      ', expiration-date: ',
      discordAuth.expirationDate,
      new Date(discordAuth.expirationDate).toDateString()
    );

    this.setAuth(discordAuth);
  }

  setAuth(auth: DiscordAuth): void {
    this._userAuth.set(auth);
    localStorage.setItem(AppConfig.COOKIE_KEY, JSON.stringify(auth));
  }

  resetAuth(): void {
    // ToDo: Revoke token
    this._userAuth.set(null);
    localStorage.removeItem(AppConfig.COOKIE_KEY);
  }

  private getAuthFromCookie(): void {
    const auth = localStorage.getItem(AppConfig.COOKIE_KEY);
    if (!auth) {
      console.log('No authentication found in cookies');
      return;
    }

    const parsedAuth = JSON.parse(auth) as DiscordAuth;
    if (this.checkAuthExpiration(parsedAuth)) {
      console.log('Valid authentication found in cookies');
      this._userAuth.set(parsedAuth);
    } else {
      console.log('Authentication in cookie expired');
      this.resetAuth();
    }

    // ToDo: Validate that the token is valid (request to Discord?)
  }

  private checkAuthExpiration(auth: DiscordAuth): boolean {
    console.log(
      'ExpirationDate: ',
      auth.expirationDate,
      new Date(auth.expirationDate).toDateString(),
      ', current date: ',
      new Date().toDateString(),
      Date.now()
    );
    return new Date(auth.expirationDate).getTime() > Date.now();
  }
}
