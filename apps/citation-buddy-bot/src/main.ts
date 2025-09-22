import 'dotenv/config';
import express from 'express';
import { VerifyDiscordRequest } from './bot/utils';
import cors from 'cors';
import discordBackend from './discord-backend/discord-backend';
import botApi from './bot/bot-api';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { checkCookieAuthMiddleware } from './discord-backend/oauth-handlers';
import path from 'node:path';

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
app.use(morgan('combined'));
app.use(checkCookieAuthMiddleware);

app.use(express.static(path.join(__dirname, 'citation-buddy/browser')));

discordBackend(app);
botApi(app);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'citation-buddy/browser/index.html'));
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
