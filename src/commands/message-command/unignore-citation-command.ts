import {
  APIMessageApplicationCommandInteraction,
  APIInteractionResponseChannelMessageWithSource,
  InteractionResponseType,
  MessageFlags,
} from 'discord.js';
import { Response } from 'express';
import { ServerConfig } from '../../models';
import { BaseMessageCommand } from './base-message-commands';
import configService from '../../configuration/config.service';

class UnignoreCitationCommand extends BaseMessageCommand {
  constructor() {
    super('Unignore', '');
  }

  protected async executeInternal(
    interaction: APIMessageApplicationCommandInteraction,
    res: Response,
    config: ServerConfig,
  ): Promise<void> {
    const clickedMessageId = interaction.data.target_id;
    const messageIdx = config.excludedMessageIds.indexOf(clickedMessageId);
    if (messageIdx < 0) {
      res.send({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: 'Message not ignored',
          flags: MessageFlags.Ephemeral,
        },
      } as APIInteractionResponseChannelMessageWithSource);

      this.autoDeleteInitialResponse(interaction);

      return;
    }

    config.excludedMessageIds.splice(messageIdx, 1);
    configService.saveConfigs();

    res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: 'Message unignored',
        flags: MessageFlags.Ephemeral,
      },
    } as APIInteractionResponseChannelMessageWithSource);

    this.autoDeleteInitialResponse(interaction);
  }
}

export default new UnignoreCitationCommand();
