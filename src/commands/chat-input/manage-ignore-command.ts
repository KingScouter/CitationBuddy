import {
  APIChatInputApplicationCommandInteraction,
  APIInteractionResponseChannelMessageWithSource,
  InteractionResponseType,
  MessageFlags,
} from 'discord.js';
import { Response } from 'express';
import { ServerConfig } from 'src/models';
import { BaseChatInputCommand } from './base-chat-input-commands';
import { ChannelUtils } from '../../channel-utils';
import { InteractionResponseFlags } from 'discord-interactions';

class ManageIgnoreCommand extends BaseChatInputCommand {
  constructor() {
    super('manage_ignore', 'Manage ignored messages');
  }

  protected async executeInternal(
    interaction: APIChatInputApplicationCommandInteraction,
    res: Response,
    config: ServerConfig,
  ): Promise<void> {
    if (interaction.channel.id !== config.citeChannelId) {
      const channel = await ChannelUtils.getChannel(config.citeChannelId);

      res.send({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: `Please execute the command within the configured citation channel: ${channel.name}`,
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });

      this.autoDeleteInitialResponse(interaction);
      return;
    }

    const filteredMessages = config.excludedMessageIds.map(
      (elem) =>
        `https://discord.com/channels/${config.guildId}/${config.citeChannelId}/${elem}`,
    );

    res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: `Messages:\n${filteredMessages.join('\n')}`,
        flags: MessageFlags.Ephemeral,
      },
    } as APIInteractionResponseChannelMessageWithSource);
  }
}

export default new ManageIgnoreCommand();
