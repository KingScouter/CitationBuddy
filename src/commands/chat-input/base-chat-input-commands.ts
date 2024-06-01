import {
  APIApplicationCommandInteraction,
  APIChatInputApplicationCommandInteraction,
  APIInteraction,
  ApplicationCommandType,
} from 'discord-api-types/v10';
import { ApiCommand } from '../models/api-command';
import { isChatInputApplicationCommandInteraction } from 'discord-api-types/utils/v10';

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
      super.isCommandType(obj) && isChatInputApplicationCommandInteraction(obj)
    );
  }
}
