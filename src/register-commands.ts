import 'dotenv/config';
import { RegisterCommand } from './utils';
import { CHAT_INPUT_COMMANDS, MESSAGE_COMMANDS } from './commands';

RegisterCommand([...CHAT_INPUT_COMMANDS, ...MESSAGE_COMMANDS]);
