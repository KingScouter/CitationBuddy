import 'dotenv/config';
import { InstallGlobalCommands } from './utils';
import { CHAT_INPUT_COMMANDS, MESSAGE_COMMANDS } from './commands';

InstallGlobalCommands(process.env.APP_ID, [
  ...CHAT_INPUT_COMMANDS,
  ...MESSAGE_COMMANDS,
]);
