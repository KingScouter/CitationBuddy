import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import { APIChannel, APIMessage, APIUser } from 'discord.js';
import { firstValueFrom } from 'rxjs';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class DiscordBackendService {
  private httpClient = inject(HttpClient);
  private apiUrl = '';
  private readonly authenticationService = inject(AuthenticationService);

  constructor(@Inject('API_URL') apiUrl: string) {
    this.apiUrl = apiUrl;
  }

  async getMessages(channelId: string): Promise<APIMessage[]> {
    const response = await firstValueFrom(
      this.httpClient.get<APIMessage[]>(this.apiUrl + '/messages', {
        params: new HttpParams({
          fromObject: {
            channelId,
          },
        }),
      })
    );
    return response;
  }

  async getChannels(guildId: string): Promise<APIChannel[]> {
    const response = await firstValueFrom(
      this.httpClient.get<APIChannel[]>(this.apiUrl + '/channels', {
        params: new HttpParams({
          fromObject: {
            guildId,
          },
        }),
      })
    );
    return response;
  }

  async getChannelsDiscord(): Promise<APIChannel[]> {
    const response = await firstValueFrom(
      this.httpClient.get<APIChannel[]>(
        'https://discord.com/api/v10/users/@me/guilds',
        {
          headers: {
            authorization: `${
              this.authenticationService.userAuth()?.tokenType
            } ${this.authenticationService.userAuth()?.accessToken}`,
          },
        }
      )
    );
    console.log('Response: ', response);
    return response;
  }

  async getUserInfoDiscord(): Promise<APIUser> {
    const response = await firstValueFrom(
      this.httpClient.get<APIUser>('https://discord.com/api/v10/users/@me', {
        headers: {
          authorization: `${this.authenticationService.userAuth()?.tokenType} ${
            this.authenticationService.userAuth()?.accessToken
          }`,
        },
      })
    );
    console.log('Response: ', response);
    return response;
  }
}
