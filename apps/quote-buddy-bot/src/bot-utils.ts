import {
  ButtonInteraction,
  ChatInputCommandInteraction,
  CommandInteraction,
  GuildMember,
} from 'discord.js';

export class BotUtils {
  static autoDeleteReply(
    interaction:
      | CommandInteraction
      | ChatInputCommandInteraction
      | ButtonInteraction,
    timeout = 5000
  ): void {
    setTimeout(async () => {
      await interaction.deleteReply();
    }, timeout);
  }

  static getUsername(
    interaction:
      | CommandInteraction
      | ChatInputCommandInteraction
      | ButtonInteraction
  ): string {
    const user = interaction.member as GuildMember;
    return user.nickname ?? user.user.globalName ?? user.user.username;
  }
}
