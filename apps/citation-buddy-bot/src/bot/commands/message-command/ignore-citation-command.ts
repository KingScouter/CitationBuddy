import {
  APIMessageApplicationCommandInteraction,
  APIInteractionResponseChannelMessageWithSource,
  InteractionResponseType,
  MessageFlags,
} from 'discord.js';
import { Response } from 'express';
import { ServerConfig } from '@cite/models';
import { BaseMessageCommand } from './base-message-commands';
import { ConfigService } from '../../../configuration/config.service';

class IgnoreCitationCommand extends BaseMessageCommand {
  constructor() {
    super('Ignore', '');
  }

  protected async executeInternal(
    interaction: APIMessageApplicationCommandInteraction,
    res: Response,
    config: ServerConfig
  ): Promise<void> {
    const clickedMessageId = interaction.data.target_id;
    if (config.excludedMessageIds.indexOf(clickedMessageId) >= 0) {
      res.send({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: 'Message already ignored',
          flags: MessageFlags.Ephemeral,
        },
      } as APIInteractionResponseChannelMessageWithSource);

      this.autoDeleteInitialResponse(interaction);

      return;
    }

    config.excludedMessageIds.push(clickedMessageId);
    await ConfigService.getInstance().setConfig(config);

    res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: 'Message ignored',
        flags: MessageFlags.Ephemeral,
      },
    } as APIInteractionResponseChannelMessageWithSource);

    this.autoDeleteInitialResponse(interaction);
  }
}

export default new IgnoreCitationCommand();
