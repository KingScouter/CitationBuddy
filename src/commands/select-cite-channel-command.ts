import {
  APIChatInputApplicationCommandInteraction,
  ApplicationCommandType,
  InteractionResponseType,
} from 'discord-api-types/v10';
import { ApiCommand } from './models/api-command';
import {
  ChannelTypes,
  InteractionResponseFlags,
  MessageComponentTypes,
} from 'discord-interactions';
import { Response } from 'express';

class SelectCiteChannelCommand extends ApiCommand {
  constructor() {
    super(
      'select_cite_channel',
      'Select the citation channel',
      ApplicationCommandType.ChatInput
    );
  }

  async execute(
    interaction: APIChatInputApplicationCommandInteraction,
    res: Response
  ): Promise<void> {
    res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: 'Cite channel select',
        flags: InteractionResponseFlags.EPHEMERAL,
        components: [
          {
            type: MessageComponentTypes.ACTION_ROW,
            components: [
              {
                type: MessageComponentTypes.CHANNEL_SELECT,
                label: 'Select channel',
                custom_id: `channel_select_${interaction.id}`,
                channel_types: [ChannelTypes.GUILD_TEXT],
              },
            ],
          },
        ],
      },
    });
  }
}

export default new SelectCiteChannelCommand();
