import { REST, Routes } from 'discord.js';
import { BOT_COMMANDS } from './commands';

export default async function deployGlobalCommands() {
  const clientId = process.env.CLIENT_ID ?? '';
  const token = process.env.DISCORD_TOKEN ?? '';

  const commands = BOT_COMMANDS.map(elem => elem.data.toJSON());

  const rest = new REST({ version: '10' }).setToken(token);

  try {
    console.log('Started refreshing application (/) commands.');

    console.log('Delete old commands');
    await rest.put(Routes.applicationCommands(clientId), {
      body: [],
    });

    console.log('Register new commands');
    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}
