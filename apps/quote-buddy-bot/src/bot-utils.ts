import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ChatInputCommandInteraction,
  CommandInteraction,
  ComponentType,
  GuildMember,
} from 'discord.js';

export class BotUtils {
  /**
   * Send a reply to the interaction and automatically delete it after a given timeout.
   * @param interaction Interaction
   * @param message Message to send
   * @param isPrivate True if the reply should be private (Ephemeral), otherwise false for a public message
   * @param timeout Timeout for the automatic deletion of the reply
   */
  static async sendAutoDeleteReply(
    interaction:
      | CommandInteraction
      | ChatInputCommandInteraction
      | ButtonInteraction,
    message: string,
    isPrivate = true,
    timeout = 5000
  ): Promise<void> {
    await interaction.reply({
      content: message,
      flags: isPrivate ? 'Ephemeral' : undefined,
    });
    BotUtils.autoDeleteReply(interaction, timeout);
  }

  /**
   * Send a follow-up to the interaction and automatically delete it after a given timeout.
   * @param interaction Interaction
   * @param message Message to send
   * @param isPrivate True if the follow up should be private (Ephemeral), otherwise false for a public message
   * @param timeout Timeout for the automatic deletion of the follow up
   */
  static async sendAutoDeleteFollowUp(
    interaction:
      | CommandInteraction
      | ChatInputCommandInteraction
      | ButtonInteraction,
    message: string,
    isPrivate = true,
    timeout = 5000
  ): Promise<void> {
    const msg = await interaction.followUp({
      content: message,
      flags: isPrivate ? 'Ephemeral' : undefined,
    });
    setTimeout(async () => {
      await msg.delete();
    }, timeout);
  }

  /**
   * Automatically delete the last reply after a given timeout.
   * @param interaction Interaction
   * @param timeout Timeout for the automatic deletion of the reply
   */
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

  /**
   * Retrieve the display username of the user that triggered an interaction
   * @param interaction Interaction
   * @returns {string} The name of the interaction-user
   */
  static getUsername(
    interaction:
      | CommandInteraction
      | ChatInputCommandInteraction
      | ButtonInteraction
  ): string {
    const user = interaction.member as GuildMember;
    return user.nickname ?? user.user.globalName ?? user.user.username;
  }

  /**
   * Disable all buttons within the interaction message.
   * @param interaction Interaction with a message
   */
  static async disableMessageButtons(
    interaction: ButtonInteraction
  ): Promise<void> {
    const prevMsgComps = interaction.message.components
      .map(row => {
        if (row.type !== ComponentType.ActionRow) {
          return row;
        }

        const subElems = row.components
          .map(subElem => {
            if (subElem.type !== ComponentType.Button) {
              return null;
            }

            return ButtonBuilder.from(subElem).setDisabled(true);
          })
          .filter(elem => !!elem);

        return ActionRowBuilder.from(row)
          .setComponents(...subElems)
          .toJSON();
      })
      .filter(elem => !!elem);
    await interaction.message.edit({ components: prevMsgComps });
  }
}
