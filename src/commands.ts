import 'dotenv/config';
import { InstallGlobalCommands } from './utils';
import {
  ApplicationCommandType,
  APIApplicationCommand,
} from 'discord-api-types/v10';

// // Get the game choices from game.js
// function createCommandChoices() {
//   const choices = getRPSChoices();
//   const commandChoices = [];

//   for (let choice of choices) {
//     commandChoices.push({
//       name: capitalize(choice),
//       value: choice.toLowerCase(),
//     });
//   }

//   return commandChoices;
// }

// // Command containing options
// const CHALLENGE_COMMAND = {
//   name: 'challenge',
//   description: 'Challenge to a match of rock paper scissors',
//   options: [
//     {
//       type: 3,
//       name: 'object',
//       description: 'Pick your object',
//       required: true,
//       choices: createCommandChoices(),
//     },
//   ],
//   type: 1,
// };

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: ApplicationCommandType.ChatInput,
} as APIApplicationCommand;

const FOO_COMMAND = {
  name: 'foo',
  description: 'General test command',
  type: ApplicationCommandType.ChatInput,
} as APIApplicationCommand;

const BAR_COMMAND = {
  name: 'bar',
  description: 'Other test command',
  type: ApplicationCommandType.ChatInput,
} as APIApplicationCommand;

const SELECT_CITE_CHANNEL_COMMAND = {
  name: 'selectCiteChannel',
  description: 'Select the citation channel',
  type: ApplicationCommandType.ChatInput,
} as APIApplicationCommand;

const RANDOM_CITE_COMMAND = {
  name: 'randomCite',
  description: 'Get a random citation',
  type: ApplicationCommandType.ChatInput,
} as APIApplicationCommand;

const ALL_COMMANDS: APIApplicationCommand[] = [
  TEST_COMMAND,
  FOO_COMMAND,
  BAR_COMMAND,
  SELECT_CITE_CHANNEL_COMMAND,
  RANDOM_CITE_COMMAND,
];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
