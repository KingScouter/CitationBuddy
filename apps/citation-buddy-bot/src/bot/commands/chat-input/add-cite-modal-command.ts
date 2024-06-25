import {
  APIActionRowComponent,
  APIApplicationCommandOption,
  APIChatInputApplicationCommandInteraction,
  APIModalSubmitInteraction,
  APITextInputComponent,
  ComponentType,
  InteractionResponseType,
  InteractionType,
  TextInputStyle,
} from 'discord.js';
import { ApiCommand } from '../models/api-command';
import { InteractionResponseFlags } from 'discord-interactions';
import { Response } from 'express';
import { BotUtils } from '../../bot-utils';
import { ServerConfig } from '../../../models';
import { BaseChatInputCommand } from './base-chat-input-commands';

class AddCiteModalCommand extends BaseChatInputCommand {
  options: APIApplicationCommandOption[] = [];

  private readonly modalComponentId = 'create_citation_modal_';
  private readonly messageComponentId = 'create_citation_msg_';
  private readonly personComponentId = 'create_citation_person_';
  private readonly messageContextComponentId = 'create_citation_msgctx_';

  constructor() {
    super('cite_modal', 'Create a citation');
  }

  protected async handleInteractionInternal(
    interaction: APIModalSubmitInteraction,
    res: Response
  ): Promise<boolean> {
    const componentId = interaction.data.custom_id;
    if (
      interaction.type !== InteractionType.ModalSubmit ||
      !componentId.startsWith(this.modalComponentId)
    )
      return false;

    const config = ApiCommand.getConfig(interaction.guild_id, res);
    if (!config) {
      return false;
    }

    return this.handleModalResult(
      interaction as APIModalSubmitInteraction,
      res,
      config
    );
  }

  protected async executeInternal(
    interaction: APIChatInputApplicationCommandInteraction,
    res: Response
  ): Promise<void> {
    res.send({
      type: InteractionResponseType.Modal,
      data: {
        title: 'Create citation',
        custom_id: `${this.modalComponentId}${interaction.id}`,
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.TextInput,
                label: 'Message',
                custom_id: `${this.messageComponentId}${interaction.id}`,
                style: TextInputStyle.Paragraph,
                required: true,
              },
            ],
          } satisfies APIActionRowComponent<APITextInputComponent>,
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.TextInput,
                label: 'Person',
                custom_id: `${this.personComponentId}${interaction.id}`,
                style: TextInputStyle.Short,
                required: true,
              },
            ],
          } satisfies APIActionRowComponent<APITextInputComponent>,
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.TextInput,
                label: 'Context',
                custom_id: `${this.messageContextComponentId}${interaction.id}`,
                style: TextInputStyle.Short,
                required: false,
              },
            ],
          } satisfies APIActionRowComponent<APITextInputComponent>,
        ],
      },
    });
  }

  private async handleModalResult(
    interaction: APIModalSubmitInteraction,
    res: Response,
    config: ServerConfig
  ): Promise<boolean> {
    let msg = '';
    let person = '';
    let msgCtx = '';

    for (const comp of interaction.data.components) {
      if (
        comp.type !== ComponentType.ActionRow ||
        comp.components.length !== 1
      ) {
        continue;
      }
      const elem = comp.components[0] as APITextInputComponent;
      if (elem.custom_id.startsWith(this.messageComponentId)) {
        msg = elem.value;
      } else if (elem.custom_id.startsWith(this.personComponentId)) {
        person = elem.value;
      } else if (elem.custom_id.startsWith(this.messageContextComponentId)) {
        msgCtx = elem.value;
      }
    }

    let returnMsg = `"${msg}"\r\n- ${person}, ${new Date().getFullYear()}`;
    if (msgCtx) {
      returnMsg += `, ${msgCtx}`;
    }

    await BotUtils.createMessage(config.citeChannelId, returnMsg);

    res.send({
      type: InteractionResponseType.ChannelMessageWithSource,
      data: {
        content: 'Cite created',
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });

    return true;
  }
}

export default new AddCiteModalCommand();
