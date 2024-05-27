import 'dotenv/config';
import { InstallGlobalCommands } from './utils';
import APP_COMMANDS from './commands';

InstallGlobalCommands(process.env.APP_ID, APP_COMMANDS);
