import {
  APIApplicationCommand,
  APIBaseInteraction,
  APIChatInputApplicationCommandInteraction,
  ApplicationCommandType,
  InteractionResponseType,
  InteractionType,
} from 'discord-api-types/v10';
import { Response } from 'express';
import { ServerConfig } from '../../models';
import configService from '../../configuration/config.service';
import { InteractionResponseFlags } from 'discord-interactions';

export abstract class ApiCommand implements APIApplicationCommand {
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
    needsConfig = true,
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
    interaction: APIBaseInteraction<InteractionType, unknown>,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    res: Response,
  ): Promise<boolean> {
    return false;
  }

  execute(
    interaction: APIChatInputApplicationCommandInteraction,
    res: Response,
  ): Promise<void> {
    let config: ServerConfig = null;
    if (this.needsConfig) {
      config = ApiCommand.getConfig(interaction.guild_id, res);
      if (!config) {
        return;
      }
    }

    return this.executeInternal(interaction, res, config);
  }

  protected abstract executeInternal(
    interaction: APIChatInputApplicationCommandInteraction,
    res: Response,
    config: ServerConfig,
  ): Promise<void>;
}
