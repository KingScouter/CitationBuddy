import {
  additionalContextToString,
  FullGuildConfig,
  GuildConfig,
  stringToAdditionalContext,
} from '@cite/models';
import {
  APIChatInputApplicationCommandInteraction,
  APIModalInteractionResponse,
  APIModalSubmitInteraction,
  ComponentType,
  InteractionResponseType,
  InteractionType,
  SelectMenuDefaultValueType,
  TextInputStyle,
} from 'discord.js';
import { Response } from 'express';
import { BaseChatInputCommand } from './base-chat-input-commands';
import { ApiCommand } from '../models/api-command';
import { GuildConfigDbService } from '../../../db/guild-config-db/guild-config-db.service';
import { InteractionResponseFlags } from 'discord-interactions';

class ConfigureServerCommand extends BaseChatInputCommand {
  private static readonly modelComponentId = 'cfg_server_modal_';
  private static readonly channelSelectComponentId =
    'cfg_server_channel_select_';
  private static readonly additionalInfoComponentId = 'cfg_server_add_info_';

  constructor() {
    super('configure_server', 'Configure the server');
  }

  protected override async executeInternal(
    interaction: APIChatInputApplicationCommandInteraction,
    res: Response,
    config: FullGuildConfig
  ): Promise<void> {
    res.send({
      type: InteractionResponseType.Modal,
      data: {
        title: 'Configure Server',
        custom_id: `${ConfigureServerCommand.modelComponentId}${interaction.id}`,
        components: [
          {
            type: ComponentType.Label,
            label: 'Citation channel',
            component: {
              type: ComponentType.ChannelSelect,
              custom_id: `${ConfigureServerCommand.channelSelectComponentId}${interaction.id}`,
              required: true,
              default_values: [
                {
                  id: config.generalConfig.citeChannelId,
                  type: SelectMenuDefaultValueType.Channel,
                },
              ],
            },
          },
          {
            type: ComponentType.Label,
            label: 'Additional infos',
            description:
              'Combine "key:label". Separate using commas or newlines',
            component: {
              type: ComponentType.TextInput,
              style: TextInputStyle.Paragraph,
              custom_id: `${ConfigureServerCommand.additionalInfoComponentId}${interaction.id}`,
              value: config.generalConfig.additionalContexts
                .map(additionalContextToString)
                .join('\n'),
            },
          },
        ],
      },
    } satisfies APIModalInteractionResponse);
  }

  protected override async handleInteractionInternal(
    interaction: APIModalSubmitInteraction,
    res: Response
  ): Promise<boolean> {
    const componentId = interaction.data.custom_id;
    if (
      interaction.type !== InteractionType.ModalSubmit ||
      !componentId.startsWith(ConfigureServerCommand.modelComponentId)
    )
      return false;

    const config = await ApiCommand.getConfig(interaction.guild_id, res);
    if (!config) {
      return false;
    }

    return this.handleModalResult(interaction, res, config.generalConfig);
  }

  private async handleModalResult(
    interaction: APIModalSubmitInteraction,
    res: Response,
    config: GuildConfig
  ): Promise<boolean> {
    for (const comp of interaction.data.components) {
      if (comp.type !== ComponentType.Label) {
        continue;
      }
      const labelComp = comp.component;
      if (
        labelComp.custom_id.startsWith(
          ConfigureServerCommand.channelSelectComponentId
        ) &&
        labelComp.type === ComponentType.ChannelSelect &&
        labelComp.values.length === 1
      ) {
        const citationChannel = labelComp.values[0];
        config.citeChannelId = citationChannel;
      } else if (
        labelComp.custom_id.startsWith(
          ConfigureServerCommand.additionalInfoComponentId
        ) &&
        labelComp.type === ComponentType.TextInput
      ) {
        const value = labelComp.value;
        const additionalInfos = value
          .split('\n')
          .flatMap(elem => elem.split(','))
          .map(elem => stringToAdditionalContext(elem.trim()))
          .filter(elem => !!elem);
        config.additionalContexts = additionalInfos;
      }
    }

    await GuildConfigDbService.getInstance().setConfig(config);

    res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: 'Configuration saved',
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });

    return true;
  }
}

export default new ConfigureServerCommand();
