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

class UnignoreCitationCommand extends BaseMessageCommand {
  constructor() {
    super('Unignore', '');
  }

  protected async executeInternal(
    interaction: APIMessageApplicationCommandInteraction,
    res: Response,
    config: ServerConfig
  ): Promise<void> {
    const clickedMessageId = interaction.data.target_id;
    let messageConfig = config.messageConfigs.find(
      elem => elem.id === clickedMessageId
    );
    if (!messageConfig) {
      messageConfig = {
        id: clickedMessageId,
        additionalData: {},
        ignored: false,
      };
      config.messageConfigs.push(messageConfig);
    } else if (!messageConfig.ignored) {
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

    messageConfig.ignored = false;
    await ConfigService.getInstance().setConfig(config);

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
