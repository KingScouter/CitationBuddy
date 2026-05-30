import { Events } from 'discord.js';
import Event from '../models/event';

export default new Event({
  name: Events.ClientReady,
  once: true,
  execute(readyClient): void {
    // Runs when the bot logs in
    console.log(`Logged in as ${readyClient.user.tag}!`);
  },
});
