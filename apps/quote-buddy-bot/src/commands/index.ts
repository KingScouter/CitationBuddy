import loadMessagesCommand from './load-messages-command';
import selectQuoteChannelCommand from './select-quote-channel-command';
import testCommand from './test-command';
import userCommand from './user-command';

export const BOT_COMMANDS = [
  testCommand,
  userCommand,
  selectQuoteChannelCommand,
  loadMessagesCommand,
];
