import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import {
  DiscordGuild,
  MessageConfig,
  GuildConfig,
  GuildConfigResponse,
  DiscordBackendEndpoints,
} from '@cite/models';
import { APIGuild, APIMessage, APIUser } from 'discord-api-types/v10';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DiscordBackendService {
  private readonly httpClient = inject(HttpClient);
  private readonly _apiUrl: string = '';

  /**
   * The URL for the API-backend
   */
  get apiUrl(): string {
    return this._apiUrl;
  }

  constructor(@Inject('API_URL') apiUrl: string) {
    this._apiUrl = apiUrl;
  }

  /**
   * Send a request to the backend to get all messages from the configured citation-channel of a given guild.
   * @param guildId The guild to get the messages from
   * @returns { Promise<APIMessage[]> } The list of messages
   */
  async getMessages(guildId: string): Promise<APIMessage[]> {
    const response = await firstValueFrom(
      this.httpClient.get<APIMessage[]>(
        this._apiUrl + DiscordBackendEndpoints.Messages,
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
  }

  /**
   * Send a request to the backend to get all guilds of the currently authenticated user.
   * @returns { Promise<APIGuild[]> } The list of guilds of the current user
   */
  async getGuilds(): Promise<DiscordGuild[]> {
    const response = await firstValueFrom(
      this.httpClient.get<DiscordGuild[]>(
        this._apiUrl + DiscordBackendEndpoints.Guilds
      )
    );
    return response;
  }

  /**
   * Send a request to the backend to get the informations of a guild
   * @param guildId ID of the guild to retrieve
   * @returns { Promise<APIGuild> } The retrieved guild
   */
  async getGuild(guildId: string): Promise<APIGuild> {
    const response = await firstValueFrom(
      this.httpClient.get<APIGuild>(
        this._apiUrl + DiscordBackendEndpoints.Guild,
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
  }

  /**
   * Send a request to the backend to get the information for the currently authenticated user from the backend.
   * @returns { Promise<APIUser> } The received user
   */
  async getMe(): Promise<APIUser> {
    const response = await firstValueFrom(
      this.httpClient.get<APIUser>(this._apiUrl + DiscordBackendEndpoints.Me)
    );
    return response;
  }

  /**
   * Send a request to the backend to get the server-configuration for a given guild.
   * @param guildId ID of the guild to get the config for
   * @returns { Promise<GuildConfigResponse> } The guild-configuration
   */
  async getGuildConfigInfo(guildId: string): Promise<GuildConfigResponse> {
    try {
      const response = await firstValueFrom(
        this.httpClient.get<GuildConfigResponse>(
          this._apiUrl + DiscordBackendEndpoints.GuildConfig,
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

  /**
   * Send a request to the backend to update an existing guild-configuration
   * @param config The updated configuration
   */
  async updateGuildConfig(config: GuildConfig): Promise<void> {
    await firstValueFrom(
      this.httpClient.put(
        this._apiUrl + DiscordBackendEndpoints.GuildConfig,
        config
      )
    );
  }

  /**
   * Send a request to the backend to add/update a message-configuration for a given guild.
   * @param guildId The ID of the guild to set the message-config for
   * @param message The updated message-config
   */
  async updateMessageConfig(
    guildId: string,
    message: MessageConfig
  ): Promise<void> {
    await firstValueFrom(
      this.httpClient.put(
        this._apiUrl + DiscordBackendEndpoints.MessageConfig,
        {
          guildId,
          message,
        }
      )
    );
  }

  /**
   * Send a request to the backend to logout the currently authenticated user and revoke the token.
   */
  async logout(): Promise<void> {
    await firstValueFrom(
      this.httpClient.post(this._apiUrl + DiscordBackendEndpoints.Logout, {})
    );
  }
}
