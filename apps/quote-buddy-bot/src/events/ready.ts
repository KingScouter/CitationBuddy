import { Events } from 'discord.js';
import Event from '../models/event';

export default new Event({
  name: Events.ClientReady,
  once: true,
  execute(): void {
    // Runs when the bot logs in
    if (client) {
      console.log(`Logged in as ${client?.user?.tag as string}!`);
    } else {
      console.log('Ready, but no client');
    }
  },
});
