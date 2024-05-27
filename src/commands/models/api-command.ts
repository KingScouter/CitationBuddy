import {
  APIApplicationCommand,
  APIChatInputApplicationCommandInteraction,
  ApplicationCommandType,
} from 'discord-api-types/v10';
import { Response } from 'express';

export abstract class ApiCommand implements APIApplicationCommand {
  id: string;
  name: string;
  description: string;
  type: ApplicationCommandType;
  application_id: string;
  version: string;
  default_member_permissions: string;

  protected constructor(
    name: string,
    description: string,
    type: ApplicationCommandType
  ) {
    this.name = name;
    this.description = description;
    this.type = type;
  }

  checkRequest(name: string): boolean {
    return name === this.name;
  }

  abstract execute(
    interaction: APIChatInputApplicationCommandInteraction,
    res: Response
  ): Promise<void>;
}
