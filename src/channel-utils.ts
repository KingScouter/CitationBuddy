import { APIChannel } from 'discord-api-types/v10';
import { DiscordRequest } from './utils';

export class ChannelUtils {
  static async getChannel(channelId: string): Promise<APIChannel> {
    const endpoint = `channels/${channelId}`;

    const channelResponse = await DiscordRequest(endpoint, { method: 'GET' });
    return (await channelResponse.json()) as APIChannel;
  }
}
