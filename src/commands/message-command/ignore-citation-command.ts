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

class IgnoreCitationCommand extends BaseMessageCommand {
  constructor() {
    super('Ignore', '');
  }

  protected async executeInternal(
    interaction: APIMessageApplicationCommandInteraction,
    res: Response,
    config: ServerConfig,
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

      ChannelUtils.autoDeleteInitialResponse(
        interaction.application_id,
        interaction.token,
      );

      return;
    }

    config.excludedMessageIds.push(clickedMessageId);
    configService.saveConfigs();

    res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: 'Message ignored',
        flags: MessageFlags.Ephemeral,
      },
    } as APIInteractionResponseChannelMessageWithSource);

    ChannelUtils.autoDeleteInitialResponse(
      interaction.application_id,
      interaction.token,
    );
  }
}

export default new IgnoreCitationCommand();
