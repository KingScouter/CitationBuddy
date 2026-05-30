import { REST, Routes } from 'discord.js';
import { BOT_COMMANDS } from './commands';

export async function RegisterCommands(): Promise<void> {
  const clientId = process.env.CLIENT_ID!;
  const guildId = '1242230589554429972';
  const token = process.env.DISCORD_TOKEN!;

  const commands = BOT_COMMANDS.map(elem => elem.data.toJSON());
  // // Grab all the command folders from the commands directory you created earlier
  // const foldersPath = path.join(__dirname, 'commands');
  // const commandFolders = fs.readdirSync(foldersPath);

  // for (const folder of commandFolders) {
  //   // Grab all the command files from the commands directory you created earlier
  //   const commandsPath = path.join(foldersPath, folder);
  //   const commandFiles = fs
  //     .readdirSync(commandsPath)
  //     .filter(file => file.endsWith('.js'));
  //   // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  //   for (const file of commandFiles) {
  //     const filePath = path.join(commandsPath, file);
  //     const command = require(filePath);
  //     if ('data' in command && 'execute' in command) {
  //       commands.push(command.data.toJSON());
  //     } else {
  //       console.log(
  //         `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
  //       );
  //     }
  //   }
  // }

  // Construct and prepare an instance of the REST module
  const rest = new REST().setToken(token);

  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );

    console.log(`Successfully reloaded  application (/) commands.`);
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error);
  }
  // // and deploy your commands!
  // (async () => {
  // })();
}

export default async function deployGlobalCommands() {
  const clientId = process.env.CLIENT_ID!;
  const token = process.env.DISCORD_TOKEN!;

  const commands = BOT_COMMANDS.map(elem => elem.data.toJSON());

  // const commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
  // const commandFiles: string[] = readdirSync('./commands').filter(
  //   file => file.endsWith('.js') || file.endsWith('.ts')
  // );

  // for (const file of commandFiles) {
  //   const command: ApplicationCommand = (await import(`./commands/${file}`))
  //     .default as ApplicationCommand;
  //   const commandData = command.data.toJSON();
  //   commands.push(commandData);
  // }

  const rest = new REST({ version: '10' }).setToken(token as string);

  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(clientId as string), {
      body: [],
    });

    await rest.put(Routes.applicationCommands(clientId as string), {
      body: commands,
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}
