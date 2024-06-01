import {
  APIBaseInteraction,
  APIChatInputApplicationCommandInteraction,
  APIMessageChannelSelectInteractionData,
  ApplicationCommandType,
  InteractionResponseType,
  InteractionType,
} from 'discord-api-types/v10';
import { ApiCommand } from './models/api-command';
import {
  ChannelTypes,
  InteractionResponseFlags,
  MessageComponentTypes,
} from 'discord-interactions';
import { Response } from 'express';
import { DiscordRequest } from '../utils';
import globalConfig from '../configuration/config.service';
import { HttpMethods } from '../models';

class SelectCiteChannelCommand extends ApiCommand {
  constructor() {
    super(
      'select_cite_channel',
      'Select the citation channel',
      ApplicationCommandType.ChatInput,
      false,
    );
  }

  async handleInteraction(
    interaction: APIBaseInteraction<InteractionType, any>,
    res: Response,
  ): Promise<boolean> {
    if (interaction.type !== InteractionType.MessageComponent) return false;

    const componentId = interaction.data.custom_id;
    if (!componentId.startsWith('channel_select_')) return false;

    const value = interaction.data as APIMessageChannelSelectInteractionData;

    const selectedChannelId = value.values[0];
    const selectedChannel = value.resolved.channels[selectedChannelId];

    globalConfig.setConfig({
      citeChannelId: selectedChannelId,
      guildId: interaction.guild_id,
      excludedMessageIds: [],
    });

    await res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `'Cite channel selected: ', ${selectedChannel.name}`,
      },
    });

    const endpoint = `webhooks/${process.env.APP_ID}/${interaction.token}/messages/${interaction.message.id}`;
    // Delete previous message
    await DiscordRequest(endpoint, { method: HttpMethods.DELETE });

    return true;
  }

  protected async executeInternal(
    interaction: APIChatInputApplicationCommandInteraction,
    res: Response,
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
