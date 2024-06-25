import 'dotenv/config';
import express from 'express';
import { VerifyDiscordRequest } from './utils';
import globalConfig from './configuration/config.service';
import cors from 'cors';
import discordBackend from './discord-backend/discord-backend';
import botApi from './bot/bot-api';
import cookieParser from 'cookie-parser';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
const origin = [process.env.CLIENT_URL];
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));
app.use(
  cors({
    origin,
    credentials: true,
  })
);
app.use(cookieParser());

globalConfig.loadConfigs();

discordBackend(app);
botApi(app);

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
