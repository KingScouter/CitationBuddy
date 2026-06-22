import { BotUtils } from '../bot-utils';
import ApplicationCommand from '../models/application-command';
import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from 'discord.js';

const commandId = 'stats';
const subCommandAuthor = 'author';
const subCommandPerson = 'person';

export default {
  data: new SlashCommandBuilder()
    .setName(commandId)
    .setDescription('Show stats for loaded quotes')
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName(subCommandAuthor)
        .setDescription('Stats about quote authors')
    )
    .addSubcommand(
      new SlashCommandSubcommandBuilder()
        .setName(subCommandPerson)
        .setDescription('Stats about the persons who got quoted')
    ),
  hasSubCommands: true,
  execute: async (interaction: ChatInputCommandInteraction): Promise<void> => {
    const subCommand = interaction.options.getSubcommand();
    switch (subCommand) {
      case subCommandAuthor:
        await handleAuthorStats(interaction);
        break;
      case subCommandPerson:
        await handlePersonStats(interaction);
        break;
      default:
        await BotUtils.sendAutoDeleteReply(
          interaction,
          `Unknown subcommand: ${subCommand}`
        );
        return;
    }
  },
} satisfies ApplicationCommand;

async function handleAuthorStats(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await BotUtils.sendAutoDeleteReply(interaction, 'Author stats');
}

async function handlePersonStats(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await BotUtils.sendAutoDeleteReply(interaction, 'Person stats');
}
