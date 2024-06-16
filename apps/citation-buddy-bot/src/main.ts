import 'dotenv/config';
import express from 'express';
import { RegisterCommand, VerifyDiscordRequest } from './utils';
import globalConfig from './configuration/config.service';
import { CHAT_INPUT_COMMANDS, MESSAGE_COMMANDS } from './commands';
import {
  APIApplicationCommandInteraction,
  APIInteraction,
  InteractionResponseType,
  InteractionType,
} from 'discord.js';
import cors from 'cors';
import discordBackend from './discord-backend/discord-backend';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));
app.use(cors());

const APP_COMMANDS = [...CHAT_INPUT_COMMANDS, ...MESSAGE_COMMANDS];

// Store for in-progress games. In production, you'd want to use a DB
// const activeGames = {};

globalConfig.loadConfigs();

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
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
});

app.post('/registercommands', async function (req, res) {
  RegisterCommand(APP_COMMANDS);
  res.send();
});

discordBackend(app);

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
