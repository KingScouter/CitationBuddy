import {
  APIChannel,
  APIMessage,
  RESTPostAPIChannelMessageJSONBody,
} from 'discord-api-types/v10';
import { DiscordRequest } from './utils';
import { HttpMethods } from './models';

export class ChannelUtils {
  static async getChannel(channelId: string): Promise<APIChannel> {
    const endpoint = `channels/${channelId}`;

    const channelResponse = await DiscordRequest(endpoint, {
      method: HttpMethods.GET,
    });
    return (await channelResponse.json()) as APIChannel;
  }

  static async createMessage(
    channelId: string,
    message: string,
  ): Promise<void> {
    const endpoint = `channels/${channelId}/messages`;

    const messageBody: RESTPostAPIChannelMessageJSONBody = {
      content: message,
    };

    await DiscordRequest(endpoint, {
      method: HttpMethods.POST,
      body: messageBody,
    });
  }

  static async deleteMessage(
    channelId: string,
    messageId: string,
  ): Promise<void> {
    const endpoint = `channels/${channelId}/messages/${messageId}`;

    await DiscordRequest(endpoint, {
      method: HttpMethods.DELETE,
    });
  }

  static async getMessages(channelId: string): Promise<APIMessage[]> {
    const endpoint = `channels/${channelId}/messages`;

    const res = await DiscordRequest(endpoint, {
      method: HttpMethods.GET,
    });

    return (await res.json()) as APIMessage[];
  }

  static async editInitialResponse(
    appId: string,
    interactionToken: string,
    message: string,
  ): Promise<void> {
    const endPoint = `webhooks/${appId}/${interactionToken}/messages/@original`;

    const messageBody: RESTPostAPIChannelMessageJSONBody = {
      content: message,
    };

    await DiscordRequest(endPoint, {
      method: HttpMethods.PATCH,
      body: messageBody,
    });
  }

  static async deleteInitialResponse(
    appId: string,
    interactionToken: string,
  ): Promise<void> {
    const endPoint = `webhooks/${appId}/${interactionToken}/messages/@original`;

    await DiscordRequest(endPoint, {
      method: HttpMethods.DELETE,
    });
  }

  static autoDeleteInitialResponse(
    appId: string,
    interactionToken: string,
    timeout = 5000,
  ): void {
    setTimeout(async () => {
      await ChannelUtils.deleteInitialResponse(appId, interactionToken);
    }, timeout);
  }
}
