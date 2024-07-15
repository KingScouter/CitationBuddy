import { Express, Request, Response } from 'express';
import { RegisterCommand } from './utils';
import {
  APIApplicationCommandInteraction,
  APIInteraction,
  InteractionResponseType,
  InteractionType,
} from 'discord.js';
import { CHAT_INPUT_COMMANDS, MESSAGE_COMMANDS } from './commands';

const APP_COMMANDS = [...CHAT_INPUT_COMMANDS, ...MESSAGE_COMMANDS];

export default function (app: Express): void {
  /**
   * Interactions endpoint URL where Discord will send HTTP requests
   */
  app.post('/interactions', postInteractions);

  app.post('/registercommands', postRegisterCommand);
}

async function postRegisterCommand(req: Request, res: Response): Promise<void> {
  RegisterCommand(APP_COMMANDS);
  res.send();
}

async function postInteractions(
  req: Request,
  res: Response
): Promise<Response | void> {
  // Interaction type and data
  const payload = req.body as APIInteraction;

  /**
   * Handle verification requests
   */
  if (payload.type === InteractionType.Ping) {
    return res.send({ type: InteractionResponseType.Pong });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (payload.type === InteractionType.ApplicationCommand) {
    const interaction = payload as APIApplicationCommandInteraction;
    const { name } = interaction.data;

    for (const command of APP_COMMANDS) {
      if (!command.checkRequest(name)) continue;

      await command.execute(interaction, res);
      return;
    }
  }

  for (const command of APP_COMMANDS) {
    if (!(await command.handleInteraction(payload, res))) continue;
    break;
  }
}
