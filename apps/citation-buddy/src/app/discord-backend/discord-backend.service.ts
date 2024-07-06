import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
  HttpStatusCode,
} from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import { DiscordGuild, ServerConfig, ServerConfigResponse } from '@cite/models';
import { APIGuild, APIMessage, APIUser } from 'discord-api-types/v10';
import { catchError, firstValueFrom, of } from 'rxjs';

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

  async getGuild(guildId: string): Promise<APIGuild> {
    const response = await firstValueFrom(
      this.httpClient.get<APIGuild>(this.apiUrl + '/guild', {
        params: new HttpParams({
          fromObject: {
            guildId,
          },
        }),
      })
    );

    return response;
  }

  async getMe(): Promise<APIUser> {
    const response = await firstValueFrom(
      this.httpClient.get<APIUser>(this.apiUrl + '/me')
    );
    return response;
  }

  async getServerConfigInfo(guildId: string): Promise<ServerConfigResponse> {
    try {
      const response = await firstValueFrom(
        this.httpClient.get<ServerConfigResponse>(
          this.apiUrl + '/server-config',
          {
            params: new HttpParams({
              fromObject: {
                guildId,
              },
            }),
          }
        )
      );

      return response;
    } catch (ex) {
      console.error('Error occured: ', ex);
      throw ex;
    }
  }

  async updateServerConfig(config: ServerConfig): Promise<void> {
    await firstValueFrom(
      this.httpClient.post(this.apiUrl + '/server-config', config)
    );
  }
}
