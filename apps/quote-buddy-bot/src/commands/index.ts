import loadMessagesCommand from './load-messages-command';
import quizCommand from './quiz-command';
import scoreboardCommand from './scoreboard-command';
import selectQuoteChannelCommand from './select-quote-channel-command';
import testCommand from './test-command';
import userCommand from './user-command';

export const BOT_COMMANDS = [
  testCommand,
  userCommand,
  selectQuoteChannelCommand,
  loadMessagesCommand,
  quizCommand,
  scoreboardCommand,
];
