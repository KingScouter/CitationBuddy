import {
  APIApplicationCommand,
  APIApplicationCommandInteraction,
  APIInteraction,
  ApplicationCommandType,
  InteractionResponseType,
} from 'discord.js';
import { Response } from 'express';
import { ServerConfig } from '../../../models';
import configService from '../../../configuration/config.service';
import { InteractionResponseFlags } from 'discord-interactions';
import { BotUtils } from '../../bot-utils';

export abstract class ApiCommand<
  T extends APIApplicationCommandInteraction,
  I extends APIInteraction = APIInteraction
> implements APIApplicationCommand
{
  id: string;
  name: string;
  description: string;
  type: ApplicationCommandType;
  application_id: string;
  version: string;
  default_member_permissions: string;
  needsConfig = true;

  protected constructor(
    name: string,
    description: string,
    type: ApplicationCommandType,
    needsConfig = true
  ) {
    this.name = name;
    this.description = description;
    this.type = type;
    this.needsConfig = needsConfig;
  }

  checkRequest(name: string): boolean {
    return name === this.name;
  }

  static getConfig(guildId: string, res: Response): ServerConfig {
    const config = configService.getConfig(guildId);
    if (!config) {
      res.send({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: {
          content: 'No cite channel configured!',
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
      return null;
    }

    return config;
  }

  async handleInteraction(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interaction: APIInteraction,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    res: Response
  ): Promise<boolean> {
    if (!this.isInteractionType(interaction)) return false;

    return this.handleInteractionInternal(interaction, res);
  }

  execute(interaction: APIInteraction, res: Response): Promise<void> {
    if (!this.isCommandType(interaction)) {
      return;
    }

    let config: ServerConfig = null;
    if (this.needsConfig) {
      config = ApiCommand.getConfig(interaction.guild_id, res);
      if (!config) {
        return;
      }
    }

    return this.executeInternal(interaction, res, config);
  }

  protected async handleInteractionInternal(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interaction: I,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    res: Response
  ): Promise<boolean> {
    return false;
  }

  protected abstract executeInternal(
    interaction: T,
    res: Response,
    config: ServerConfig
  ): Promise<void>;

  protected isCommandType(obj: APIInteraction): obj is T {
    return true;
  }

  protected isInteractionType(obj: APIInteraction): obj is I {
    return true;
  }

  protected autoDeleteInitialResponse(interaction: T): void {
    BotUtils.autoDeleteInitialResponse(
      interaction.application_id,
      interaction.token
    );
  }
}
