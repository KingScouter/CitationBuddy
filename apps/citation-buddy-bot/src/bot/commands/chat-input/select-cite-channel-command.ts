import {
  APIChatInputApplicationCommandInteraction,
  APIMessageChannelSelectInteractionData,
  APIMessageComponentInteraction,
  InteractionResponseType,
  InteractionType,
} from 'discord.js';
import {
  ChannelTypes,
  InteractionResponseFlags,
  MessageComponentTypes,
} from 'discord-interactions';
import { Response } from 'express';
import { GuildConfigDbService } from '../../../db/guild-config-db/guild-config-db.service';
import { BaseChatInputCommand } from './base-chat-input-commands';
import { BotUtils } from '../../bot-utils';

class SelectCiteChannelCommand extends BaseChatInputCommand {
  constructor() {
    super('select_cite_channel', 'Select the citation channel', false);
  }

  protected async handleInteractionInternal(
    interaction: APIMessageComponentInteraction,
    res: Response
  ): Promise<boolean> {
    if (interaction.type !== InteractionType.MessageComponent) return false;

    const componentId = interaction.data.custom_id;
    if (!componentId.startsWith('channel_select_')) return false;

    const value = interaction.data as APIMessageChannelSelectInteractionData;

    const selectedChannelId = value.values[0];
    const selectedChannel = value.resolved.channels[selectedChannelId];

    const config = await GuildConfigDbService.getInstance().getConfig(
      interaction.guild_id
    );
    config.citeChannelId = selectedChannelId;

    await GuildConfigDbService.getInstance().setConfig(config);

    res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `'Cite channel selected: ', ${selectedChannel.name}`,
      },
    });

    BotUtils.deleteInteractionMessage(
      interaction.application_id,
      interaction.token,
      interaction.message.id
    );

    return true;
  }

  protected async executeInternal(
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
