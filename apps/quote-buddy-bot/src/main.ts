import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  Partials,
} from 'discord.js';
import deployGlobalCommands from './deploy-commands';
import MessageCommand from './models/message-command';
import { EVENTS } from './events';
import ApplicationCommand from './models/application-command';
import { BOT_COMMANDS } from './commands';

class CustomClient extends Client {
  commands = new Collection<string, ApplicationCommand>();
  msgCommands = new Collection<string, MessageCommand>();
}

async function runBot(): Promise<void> {
  await deployGlobalCommands();

  // client = new CustomClient({ intents: [GatewayIntentBits.Guilds] });
  // Discord client object
  global.client = new CustomClient({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.MessageContent,
    ],
    partials: [Partials.Channel],
  });
  // global.client = Object.assign(
  //   new Client({
  //     intents: [
  //       GatewayIntentBits.Guilds,
  //       GatewayIntentBits.GuildMessages,
  //       GatewayIntentBits.DirectMessages,
  //       GatewayIntentBits.MessageContent,
  //     ],
  //     partials: [Partials.Channel],
  //   }),
  //   {
  //     commands: new Collection<string, ApplicationCommand>(),
  //     msgCommands: new Collection<string, MessageCommand>(),
  //   }
  // );

  client.once(Events.ClientReady, readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  });

  // client.commands = new Collection();

  for (const command of BOT_COMMANDS) {
    client.commands.set(command.data.name, command);
  }

  // const eventsList = [readyEvent, interactionCreateEvent, messageCreateEvent];

  for (const elem of EVENTS) {
    if (elem.once) {
      client.once(elem.name, (...args) => elem.execute(...args));
    } else {
      client.on(elem.name, (...args) => elem.execute(...args));
    }
  }

  client.login(process.env.DISCORD_TOKEN);

  // RegisterCommands();
}

runBot();
