import { BotUtils } from '../bot-utils';
import { ChannelMessagesCacheService } from '../message-cache/channel-messages-cache.service';
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

/**
 * Handle the command to show stats about how often which person creates a quote.
 * @param interaction Interaciton
 */
async function handleAuthorStats(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await interaction.deferReply();
  const guildId = interaction.guildId ?? '';

  const messages = await ChannelMessagesCacheService.fetchMessages(guildId);
  if (!messages || messages.messages.size === 0) {
    await interaction.editReply('Keine Nachrichten vorhanden / geladen!');
    return;
  }

  const stats = new Map<string, number>();
  for (const [_, quote] of messages.messages) {
    let userStat = stats.get(quote.author) ?? 0;
    userStat++;
    stats.set(quote.author, userStat);
  }

  const results = prepareStats(stats);

  await interaction.editReply(
    `# Wer schreibt die meisten Zitate?\n\n${results}`
  );
}

/**
 * Handle the command to show stats about how often which person got quoted
 * @param interaction Interaction
 */
async function handlePersonStats(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await interaction.deferReply();
  const guildId = interaction.guildId ?? '';

  const messages = await ChannelMessagesCacheService.fetchMessages(guildId);
  if (!messages || messages.messages.size === 0) {
    await interaction.editReply('Keine Nachrichten vorhanden / geladen!');
    return;
  }

  const stats = new Map<string, number>();
  for (const [_, quote] of messages.messages) {
    let userStat = stats.get(quote.person) ?? 0;
    userStat++;
    stats.set(quote.person, userStat);
  }

  const results = prepareStats(stats);

  await interaction.editReply(`# Wer wurde am öftesten zitiert?\n\n${results}`);
}

function prepareStats(stats: Map<string, number>): string {
  return Array.from(stats.entries())
    .sort((personA, personB) => {
      return personB[1] - personA[1];
    })
    .map(([name, stat]) => `**${name}:** ${stat}`)
    .join('\n');
}
