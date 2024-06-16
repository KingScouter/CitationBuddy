import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import { APIChannel, APIMessage } from 'discord.js';
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
}
