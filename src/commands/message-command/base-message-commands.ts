import {
  APIApplicationCommandInteraction,
  APIInteraction,
  APIMessageApplicationCommandInteraction,
  ApplicationCommandType,
} from 'discord-api-types/v10';
import { ApiCommand } from '../models/api-command';
import { isContextMenuApplicationCommandInteraction } from 'discord-api-types/utils/v10';

export abstract class BaseMessageCommand<
  T extends APIInteraction = APIInteraction,
> extends ApiCommand<APIMessageApplicationCommandInteraction, T> {
  protected constructor(name: string, description: string, needsConfig = true) {
    super(name, description, ApplicationCommandType.Message, needsConfig);
  }

  protected isCommandType(
    obj: APIApplicationCommandInteraction,
  ): obj is APIMessageApplicationCommandInteraction {
    return (
      super.isCommandType(obj) &&
      isContextMenuApplicationCommandInteraction(obj) &&
      obj.data.type === ApplicationCommandType.Message
    );
  }
}
