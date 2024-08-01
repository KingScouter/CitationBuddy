import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import {
  DiscordGuild,
  MessageConfig,
  GuildConfig,
  GuildConfigResponse,
  DiscordBackendEndpoints,
  FullGuildConfig,
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
        this.buildUrl(DiscordBackendEndpoints.Messages, guildId)
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
        this.buildUrl(DiscordBackendEndpoints.Guilds)
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
        this.buildUrl(DiscordBackendEndpoints.Guilds, guildId)
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
      this.httpClient.get<APIUser>(this.buildUrl(DiscordBackendEndpoints.Me))
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
          this.buildUrl(DiscordBackendEndpoints.GuildConfig, guildId)
        )
      );

      return response;
    } catch (ex) {
      console.error('Error occured: ', ex);
      throw ex;
    }
  }

  /**
   * Send a request to the backend to get the server-configuration for a given guild.
   * @param guildId ID of the guild to get the config for
   * @returns { Promise<GuildConfigResponse> } The guild-configuration
   */
  async getFullGuildConfig(guildId: string): Promise<FullGuildConfig> {
    try {
      const response = await firstValueFrom(
        this.httpClient.get<FullGuildConfig>(
          this.buildUrl(DiscordBackendEndpoints.FullGuildConfig, guildId)
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
        this.buildUrl(DiscordBackendEndpoints.GuildConfig),
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
        this.buildUrl(DiscordBackendEndpoints.MessageConfig),
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
      this.httpClient.post(this.buildUrl(DiscordBackendEndpoints.Logout), {})
    );
  }

  /**
   * Build a url out of multiple path-segments
   * @param urlParts List of path segments
   * @returns {string} Complete URL
   */
  private buildUrl(...urlParts: string[]): string {
    return [this.apiUrl, ...urlParts]
      .join('/')
      .replace(/[\/]+/g, '/') // Replace multiple slashes with a single slash.
      .replace(/^(.+):\//, '$1://') // Add a colon after the scheme if missing.
      .replace(/^file:/, 'file:/') // Add a colon after 'file' if missing.
      .replace(/\/(\?|&|#[^!])/g, '$1') // Remove slashes before query parameters or fragments.
      .replace(/\?/g, '&') // Replace the first occurrence of '?' with '&'.
      .replace('&', '?'); // If there are multiple query parameters, replace the first '&' with '?'.
  }
}
