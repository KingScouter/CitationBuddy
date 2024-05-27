import {
  APIChatInputApplicationCommandInteraction,
  ApplicationCommandType,
  InteractionResponseType,
} from 'discord-api-types/v10';
import { ApiCommand } from './models/api-command';
import { Response } from 'express';
import { InteractionResponseFlags } from 'discord-interactions';
import configService from '../configuration/config.service';
import { ChannelUtils } from '../channel-utils';

class ShowCiteChannelCommand extends ApiCommand {
  constructor() {
    super(
      'show_cite_channel',
      'Show selected cite channel',
      ApplicationCommandType.ChatInput
    );
  }

  async execute(
    interaction: APIChatInputApplicationCommandInteraction,
    res: Response
  ): Promise<void> {
    const guild_id = interaction.guild_id;
    const config = configService.getConfig(guild_id);
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
