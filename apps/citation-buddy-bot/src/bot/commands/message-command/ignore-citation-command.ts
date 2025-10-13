import {
  APIMessageApplicationCommandInteraction,
  APIInteractionResponseChannelMessageWithSource,
  InteractionResponseType,
  MessageFlags,
} from 'discord.js';
import { Response } from 'express';
import { FullGuildConfig } from '@cite/models';
import { BaseMessageCommand } from './base-message-commands';
import { MessageConfigDbService } from '../../../db/message-config-db/message-config-db.service';

class IgnoreCitationCommand extends BaseMessageCommand {
  constructor() {
    super('Ignore message');
    this.name_localizations = {
      de: 'Nachricht ignorieren',
      'en-US': 'Ignore message',
    };
  }

  protected async executeInternal(
    interaction: APIMessageApplicationCommandInteraction,
    res: Response,
    config: FullGuildConfig
  ): Promise<void> {
    const clickedMessageId = interaction.data.target_id;
    let messageConfig = config.messageConfig.configs.find(
      elem => elem.id === clickedMessageId
    );
    if (!messageConfig) {
      messageConfig = {
        id: clickedMessageId,
        additionalData: {},
        ignored: false,
      };
      config.messageConfig.configs.push(messageConfig);
    }
    if (messageConfig.ignored) {
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

    messageConfig.ignored = true;
    await MessageConfigDbService.getInstance().setConfig(config.messageConfig);

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
