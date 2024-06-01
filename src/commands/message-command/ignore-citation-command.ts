import {
  APIApplicationCommandInteraction,
  APIContextMenuInteraction,
  APIMessageApplicationCommandInteractionDataResolved,
  ApplicationCommandType,
  InteractionResponseType,
} from 'discord-api-types/v10';
import { ApiCommand } from '../models/api-command';
import { Response } from 'express';
import { ServerConfig } from 'src/models';

class IgnoreCitationCommand extends ApiCommand<APIContextMenuInteraction> {
  constructor() {
    super('Ignore', '', ApplicationCommandType.Message);
  }

  protected async executeInternal(
    interaction: APIContextMenuInteraction,
    res: Response,
    config: ServerConfig,
  ): Promise<void> {
    console.log('Message interaction: ', interaction);
    const messageData = interaction.data
      .resolved as APIMessageApplicationCommandInteractionDataResolved;
    const clickedMessageId = interaction.data.target_id;
    const clickedMessage = messageData.messages[clickedMessageId];
    console.log('Clicked message: ', clickedMessage.content);
    res.send({
      type: InteractionResponseType.DeferredChannelMessageWithSource,
      data: null,
    });
  }
}

export default new IgnoreCitationCommand();
