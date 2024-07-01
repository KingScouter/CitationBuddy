import {
  APIChatInputApplicationCommandInteraction,
  InteractionResponseType,
} from 'discord.js';
import { Response } from 'express';
import { InteractionResponseFlags } from 'discord-interactions';
import { BotUtils } from '../../bot-utils';
import { ServerConfig } from '@cite/models';
import { BaseChatInputCommand } from './base-chat-input-commands';

class ShowCiteChannelCommand extends BaseChatInputCommand {
  constructor() {
    super('show_cite_channel', 'Show selected cite channel');
  }

  protected async executeInternal(
    interaction: APIChatInputApplicationCommandInteraction,
    res: Response,
    config: ServerConfig
  ): Promise<void> {
    let responseMsg = 'No cite channel found for this server!';
    if (config) {
      const channel = await BotUtils.getChannel(config.citeChannelId);
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
