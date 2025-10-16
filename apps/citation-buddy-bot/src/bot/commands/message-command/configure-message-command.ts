import {
  APILabelComponent,
  APIMessageApplicationCommandInteraction,
  APIModalInteractionResponse,
  APIModalSubmitInteraction,
  ComponentType,
  InteractionResponseType,
  InteractionType,
  TextInputStyle,
} from 'discord.js';
import { BaseMessageCommand } from './base-message-commands';
import { FullGuildConfig, MessageConfig } from '@cite/models';
import { Response } from 'express';
import { ApiCommand } from '../models/api-command';
import { MessageConfigDbService } from '../../../db/message-config-db/message-config-db.service';
import { InteractionResponseFlags } from 'discord-interactions';

class ConfigureMessageCommand extends BaseMessageCommand {
  private static readonly modelComponentId = 'modal_';
  private static readonly isIgnoredComponentId = 'is_ignored_';
  private static readonly addInfoComponentId = 'add_info_';

  constructor() {
    super('Configure Message');
    this.name_localizations = {
      de: 'Nachricht konfigurieren',
      'en-US': 'Configure message',
    };
  }

  protected override async executeInternal(
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

      await MessageConfigDbService.getInstance().setConfig(
        config.messageConfig
      );
    }

    const isIgnored = messageConfig.ignored;

    const additionalInfoComponents: APILabelComponent[] = [];
    for (const additionalContext of config.generalConfig.additionalContexts) {
      const value = messageConfig.additionalData[additionalContext.id] ?? '';
      console.log('Label: ', additionalContext, ', value: ', value);
      additionalInfoComponents.push({
        type: ComponentType.Label,
        label: additionalContext.label,
        component: {
          type: ComponentType.TextInput,
          style: TextInputStyle.Short,
          custom_id: `${additionalContext.id}_${interaction.id}`,
          value,
          required: false,
        },
      });
    }

    const msgContent = {
      type: InteractionResponseType.Modal,
      data: {
        title: 'Configure Server',
        custom_id: `${ConfigureMessageCommand.modelComponentId}${clickedMessageId}_${interaction.id}`,
        components: [
          {
            type: ComponentType.Label,
            label: 'Ignore',
            component: {
              type: ComponentType.StringSelect,
              custom_id: `${ConfigureMessageCommand.isIgnoredComponentId}${interaction.id}`,
              min_values: 1,
              max_values: 1,
              options: [
                {
                  label: 'Ignore',
                  value: '1',
                  default: isIgnored,
                },
                {
                  label: 'Not ignore',
                  value: '0',
                  default: !isIgnored,
                },
              ],
            },
          },
          ...additionalInfoComponents,
        ],
      },
    } satisfies APIModalInteractionResponse;

    res.send(msgContent);
  }

  protected override async handleInteractionInternal(
    interaction: APIModalSubmitInteraction,
    res: Response
  ): Promise<boolean> {
    const componentId = interaction.data.custom_id;
    if (
      interaction.type !== InteractionType.ModalSubmit ||
      !componentId.startsWith(ConfigureMessageCommand.modelComponentId)
    )
      return false;

    const pattern = new RegExp(
      `^${ConfigureMessageCommand.modelComponentId}(\\d+)_.*$`
    );
    const matchRes = componentId.match(pattern);
    const messageId = matchRes[1];

    const config = await ApiCommand.getConfig(interaction.guild_id, res);
    if (!config) {
      return false;
    }

    const messageConfig = config.messageConfig.configs.find(
      elem => elem.id === messageId
    );
    if (!messageConfig) {
      return;
    }

    return this.handleModalResult(interaction, res, messageConfig, config);
  }

  private async handleModalResult(
    interaction: APIModalSubmitInteraction,
    res: Response,
    messageConfig: MessageConfig,
    config: FullGuildConfig
  ): Promise<boolean> {
    messageConfig.additionalData = {};
    for (const comp of interaction.data.components) {
      if (comp.type !== ComponentType.Label) {
        continue;
      }

      const labelComp = comp.component;
      if (
        labelComp.custom_id.startsWith(
          ConfigureMessageCommand.isIgnoredComponentId
        ) &&
        labelComp.type === ComponentType.StringSelect &&
        labelComp.values.length === 1
      ) {
        const isIgnored = labelComp.values[0] === '1';
        messageConfig.ignored = isIgnored;
      } else if (labelComp.type === ComponentType.TextInput) {
        const value = labelComp.value;
        const pattern = /^(\w+)_.*$/;
        const matchRes = labelComp.custom_id.match(pattern);
        if (matchRes?.length !== 2) {
          continue;
        }

        messageConfig.additionalData[matchRes[1]] = value;
      }
    }

    await MessageConfigDbService.getInstance().setConfig(config.messageConfig);

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

export default new ConfigureMessageCommand();
