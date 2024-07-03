import {
  APIChannel,
  APIGuild,
  APIMessage,
  RESTPostAPIChannelMessageJSONBody,
  Routes,
} from 'discord.js';
import { restClient } from './utils';

export class BotUtils {
  static async getChannel(channelId: string): Promise<APIChannel> {
    const channelResponse = (await restClient.get(
      Routes.channel(channelId)
    )) as APIChannel;

    return channelResponse;
  }

  static async getChannels(guildId: string): Promise<APIChannel[]> {
    const channelResponse = (await restClient.get(
      Routes.guildChannels(guildId)
    )) as APIChannel[];

    return channelResponse;
  }

  static async createMessage(
    channelId: string,
    message: string
  ): Promise<void> {
    const messageBody: RESTPostAPIChannelMessageJSONBody = {
      content: message,
    };
    await restClient.post(Routes.channelMessages(channelId), {
      body: messageBody,
    });
  }

  static async deleteMessage(
    channelId: string,
    messageId: string
  ): Promise<void> {
    await restClient.delete(Routes.channelMessage(channelId, messageId));
  }

  static async getMessages(channelId: string): Promise<APIMessage[]> {
    const response = (await restClient.get(
      Routes.channelMessages(channelId)
    )) as APIMessage[];
    return response;
  }

  static async deleteOwnReaction(
    channelId: string,
    messageId: string,
    emoji: string
  ): Promise<void> {
    await restClient.delete(
      Routes.channelMessageOwnReaction(channelId, messageId, emoji)
    );
  }

  static async createReaction(
    channelId: string,
    messageId: string,
    emoji: string
  ): Promise<void> {
    await restClient.put(
      Routes.channelMessageOwnReaction(channelId, messageId, emoji)
    );
  }

  static async editInitialResponse(
    appId: string,
    interactionToken: string,
    message: string
  ): Promise<void> {
    const messageBody: RESTPostAPIChannelMessageJSONBody = {
      content: message,
    };

    await restClient.patch(Routes.webhookMessage(appId, interactionToken), {
      body: messageBody,
    });
  }

  static async deleteInitialResponse(
    appId: string,
    interactionToken: string
  ): Promise<void> {
    await restClient.delete(Routes.webhookMessage(appId, interactionToken));
  }

  static autoDeleteInitialResponse(
    appId: string,
    interactionToken: string,
    timeout = 5000
  ): void {
    setTimeout(async () => {
      await BotUtils.deleteInitialResponse(appId, interactionToken);
    }, timeout);
  }

  static async deleteInteractionMessage(
    appId: string,
    interactionToken: string,
    messageId: string
  ): Promise<void> {
    await restClient.delete(
      Routes.webhookMessage(appId, interactionToken, messageId)
    );
  }

  static async getGuilds(): Promise<APIGuild[]> {
    const guildResponse = (await restClient.get(
      Routes.userGuilds()
    )) as APIGuild[];

    return guildResponse;
  }
}
