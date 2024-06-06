import {
  APIApplicationCommandInteraction,
  APIChatInputApplicationCommandInteraction,
  APIInteraction,
  ApplicationCommandType,
  InteractionType,
} from 'discord.js';
import { ApiCommand } from '../models/api-command';

export abstract class BaseChatInputCommand<
  T extends APIInteraction = APIInteraction,
> extends ApiCommand<APIChatInputApplicationCommandInteraction, T> {
  protected constructor(name: string, description: string, needsConfig = true) {
    super(name, description, ApplicationCommandType.ChatInput, needsConfig);
  }

  protected isCommandType(
    obj: APIApplicationCommandInteraction,
  ): obj is APIChatInputApplicationCommandInteraction {
    return (
      super.isCommandType(obj) &&
      obj.type === InteractionType.ApplicationCommand &&
      obj.data.type === ApplicationCommandType.ChatInput
    );
  }
}
