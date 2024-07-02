import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import { DiscordGuild } from '@cite/models';
import { APIMessage, APIUser } from 'discord-api-types/v10';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DiscordBackendService {
  private httpClient = inject(HttpClient);
  private apiUrl = '';

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

  async getGuilds(): Promise<DiscordGuild[]> {
    const response = await firstValueFrom(
      this.httpClient.get<DiscordGuild[]>(this.apiUrl + '/guilds')
    );
    return response;
  }

  async getMe(): Promise<APIUser> {
    const response = await firstValueFrom(
      this.httpClient.get<APIUser>(this.apiUrl + '/me')
    );
    return response;
  }
}
