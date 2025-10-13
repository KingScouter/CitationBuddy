import {
  APIApplicationCommandInteraction,
  APIInteraction,
  APIMessageApplicationCommandInteraction,
  ApplicationCommandType,
  InteractionType,
} from 'discord.js';
import { ApiCommand } from '../models/api-command';

export abstract class BaseMessageCommand<
  T extends APIInteraction = APIInteraction,
> extends ApiCommand<APIMessageApplicationCommandInteraction, T> {
  protected constructor(name: string, needsConfig = true) {
    super(name, '', ApplicationCommandType.Message, needsConfig);
  }

  protected isCommandType(
    obj: APIApplicationCommandInteraction
  ): obj is APIMessageApplicationCommandInteraction {
    return (
      super.isCommandType(obj) &&
      obj.type === InteractionType.ApplicationCommand &&
      obj.data.type === ApplicationCommandType.Message
    );
  }
}
