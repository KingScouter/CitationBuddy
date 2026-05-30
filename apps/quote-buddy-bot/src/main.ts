import { GatewayIntentBits, Partials } from 'discord.js';
import deployGlobalCommands from './deploy-commands';
import { EVENTS } from './events';
import { BOT_COMMANDS } from './commands';
import { DiscordClient } from './models/discord-client';

async function runBot(): Promise<void> {
  await deployGlobalCommands();

  // Discord client object
  global.client = new DiscordClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
  });

  for (const command of BOT_COMMANDS) {
    client.commands.set(command.data.name, command);
  }

  for (const elem of EVENTS) {
    if (elem.once) {
      client.once(elem.name, (...args) => elem.execute(...args));
    } else {
      client.on(elem.name, (...args) => elem.execute(...args));
    }
  }

  client.login(process.env.DISCORD_TOKEN);
}

runBot();
