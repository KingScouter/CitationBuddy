import { Express } from 'express';
import { ChannelUtils } from '../channel-utils';

export default function (app: Express): void {
  app.get('/messages', async function (req, res) {
    res.set('Access-Control-Allow-Origin', 'http://localhost:4200');
    try {
      const channelId = req.query['channelId'];
      console.log('Get messages - channelId: ', channelId);
      const messages = await ChannelUtils.getMessages(channelId.toString());
      res.send(messages);
    } catch (err) {
      console.error(err);
      res.status(401).send('Error during request');
    }
  });

  app.get('/channels', async function (req, res) {
    res.set('Access-Control-Allow-Origin', 'http://localhost:4200');
    try {
      const guildId = req.query['guildId'];
      console.log('Get channels - guildId: ', guildId);
      const messages = await ChannelUtils.getChannels(guildId.toString());
      res.send(messages);
    } catch (err) {
      console.error(err);
      res.status(401).send('Error during request');
    }
  });
}
