import {
  APIChatInputApplicationCommandInteraction,
  InteractionResponseType,
} from 'discord-api-types/v10';
import { Response } from 'express';
import { InteractionResponseFlags } from 'discord-interactions';
import { ChannelUtils } from '../../channel-utils';
import { ServerConfig } from '../../models';
import { BaseChatInputCommand } from './base-chat-input-commands';

class ShowCiteChannelCommand extends BaseChatInputCommand {
  constructor() {
    super('show_cite_channel', 'Show selected cite channel');
  }

  protected async executeInternal(
    interaction: APIChatInputApplicationCommandInteraction,
    res: Response,
    config: ServerConfig,
  ): Promise<void> {
    let responseMsg = 'No cite channel found for this server!';
    if (config) {
      const channel = await ChannelUtils.getChannel(config.citeChannelId);
      responseMsg = `Cite channel: ${channel.name}`;
    }

    res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: responseMsg,
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }
}

export default new ShowCiteChannelCommand();
