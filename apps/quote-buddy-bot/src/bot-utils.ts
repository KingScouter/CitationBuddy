import { ChatInputCommandInteraction } from 'discord.js';

export class BotUtils {
  static autoDeleteReply(
    interaction: ChatInputCommandInteraction,
    timeout = 5000
  ): void {
    setTimeout(async () => {
      await interaction.deleteReply();
    }, timeout);
  }
}
