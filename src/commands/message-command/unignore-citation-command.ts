import {
  APIMessageApplicationCommandInteraction,
  APIInteractionResponseChannelMessageWithSource,
  InteractionResponseType,
  MessageFlags,
} from 'discord-api-types/v10';
import { Response } from 'express';
import { ServerConfig } from '../../models';
import { BaseMessageCommand } from './base-message-commands';
import configService from '../../configuration/config.service';
import { ChannelUtils } from '../../channel-utils';

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

      ChannelUtils.autoDeleteInitialResponse(
        interaction.application_id,
        interaction.token,
      );

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

    ChannelUtils.autoDeleteInitialResponse(
      interaction.application_id,
      interaction.token,
    );
  }
}

export default new UnignoreCitationCommand();
