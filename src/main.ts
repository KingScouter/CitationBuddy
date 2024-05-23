import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
  ChannelTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, DiscordRequest } from './utils';
import globalConfig from './configuration/config.service';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
// const activeGames = {};

const config = globalConfig.globalConfig;
config.loadConfigs();

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data, guild_id } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: 'hello world ',
        },
      });
    }
    if (name === 'foo') {
      // // console.log('Foo: ', req.body);
      // const guildId = req.body.guild_id;
      // const endpoint = `guilds/${guildId}/channels`;
      // const channelResponse = await DiscordRequest(endpoint, { method: 'GET' });
      // // console.log('Channel response: ', channelResponse);

      // const body: any = await channelResponse.json();
      // console.log(body);
      // const channelNames = body
      //   .filter((elem) => elem.type === 0)
      //   .map((elem) => elem.name);
      // console.log('Channels here: ', channelNames);

      // config.setConfig({ guildId: guildId, citeChannelId: 'def' });
      // console.log(config);
      // config.saveConfigs();

      // return res.send({
      //   type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      //   data: {
      //     // Fetches a random emoji to send from a helper function
      //     content: `Following text-channels exist: ${channelNames.join(', ')}`,
      //   },
      // });

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Cite channel select',
          flags: InteractionResponseFlags.EPHEMERAL,
          components: [
            {
              type: MessageComponentTypes.ACTION_ROW,
              components: [
                {
                  type: MessageComponentTypes.CHANNEL_SELECT,
                  label: 'Select channel',
                  custom_id: `channel_select_${req.body.id}`,
                  channel_types: [ChannelTypes.GUILD_TEXT],
                },
              ],
            },
          ],
        },
      });
    }
    if (name === 'bar') {
      // const guildId = req.body.guild_id;
      const guildConfig = config.getConfig(guild_id);
      let responseMsg = '';
      if (guildConfig)
        responseMsg = `Configuration of the current server: ${JSON.stringify(
          guildConfig
        )}`;
      else responseMsg = 'No configuration set for the current server yet';

      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: responseMsg,
          flags: InteractionResponseFlags.EPHEMERAL,
        },
      });
    }
    // // "challenge" command
    // if (name === 'challenge' && id) {
    //   const userId = req.body.member.user.id;
    //   // User's object choice
    //   const objectName = req.body.data.options[0].value;

    //   // Create active game using message ID as the game ID
    //   activeGames[id] = {
    //     id: userId,
    //     objectName,
    //   };

    //   return res.send({
    //     type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    //     data: {
    //       // Fetches a random emoji to send from a helper function
    //       content: `Rock papers scissors challenge from <@${userId}>`,
    //       components: [
    //         {
    //           type: MessageComponentTypes.ACTION_ROW,
    //           components: [
    //             {
    //               type: MessageComponentTypes.BUTTON,
    //               // Append the game ID to use later on
    //               custom_id: `accept_button_${req.body.id}`,
    //               label: 'Accept',
    //               style: ButtonStyleTypes.PRIMARY,
    //             },
    //           ],
    //         },
    //       ],
    //     },
    //   });
    // }
  }

  /**
   * Handle requests from interactive components
   * See https://discord.com/developers/docs/interactions/message-components#responding-to-a-component-interaction
   */
  if (type === InteractionType.MESSAGE_COMPONENT) {
    // custom_id set in payload when sending message component
    const componentId: string = data.custom_id;

    if (componentId.startsWith('channel_select_')) {
      // const reqId = componentId.substring('channel_select_'.length);

      const selectedChannelId = data.values[0];
      const selectedChannel = data.resolved.channels[selectedChannelId];

      config.setConfig({
        citeChannelId: selectedChannelId,
        guildId: guild_id,
      });

      console.log('Interaction ID: ', selectedChannel);
      await res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: `'Cite channel selected: ', ${selectedChannel.name}`,
        },
      });

      const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
      // Delete previous message
      await DiscordRequest(endpoint, { method: 'DELETE' });
    }

    // if (componentId.startsWith('accept_button_')) {
    //   // get the associated game ID
    //   const gameId = componentId.replace('accept_button_', '');
    //   // Delete message with token in request body
    //   const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;
    //   try {
    //     await res.send({
    //       type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    //       data: {
    //         content: 'What is your object of choice?',
    //         // Indicates it'll be an ephemeral message
    //         flags: InteractionResponseFlags.EPHEMERAL,
    //         components: [
    //           {
    //             type: MessageComponentTypes.ACTION_ROW,
    //             components: [
    //               {
    //                 type: MessageComponentTypes.STRING_SELECT,
    //                 // Append game ID
    //                 custom_id: `select_choice_${gameId}`,
    //                 options: getShuffledOptions(),
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //     });
    //     // Delete previous message
    //     await DiscordRequest(endpoint, { method: 'DELETE' });
    //   } catch (err) {
    //     console.error('Error sending message:', err);
    //   }
    // } else if (componentId.startsWith('select_choice_')) {
    //   // get the associated game ID
    //   const gameId = componentId.replace('select_choice_', '');

    //   if (activeGames[gameId]) {
    //     // Get user ID and object choice for responding user
    //     const userId = req.body.member.user.id;
    //     const objectName = data.values[0];
    //     // Calculate result from helper function
    //     const resultStr = getResult(activeGames[gameId], {
    //       id: userId,
    //       objectName,
    //     });

    //     // Remove game from storage
    //     delete activeGames[gameId];
    //     // Update message with token in request body
    //     const endpoint = `webhooks/${process.env.APP_ID}/${req.body.token}/messages/${req.body.message.id}`;

    //     try {
    //       // Send results
    //       await res.send({
    //         type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    //         data: { content: resultStr },
    //       });
    //       // Update ephemeral message
    //       await DiscordRequest(endpoint, {
    //         method: 'PATCH',
    //         body: {
    //           content: 'Nice choice ' + getRandomEmoji(),
    //           components: [],
    //         },
    //       });
    //     } catch (err) {
    //       console.error('Error sending message:', err);
    //     }
    //   }
    // }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
