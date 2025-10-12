import selectCiteChannelCommand from './chat-input/select-cite-channel-command';
import showCiteChannelCommand from './chat-input/show-cite-channel-command';
import addCiteCommand from './chat-input/add-cite-command';
import getRandomCiteCommand from './chat-input/get-random-cite-command';
import addCiteModalCommand from './chat-input/add-cite-modal-command';
import ignoreCitationCommand from './message-command/ignore-citation-command';
import unignoreCitationCommand from './message-command/unignore-citation-command';
import manageIgnoreCommand from './chat-input/manage-ignore-command';
import configureServerCommand from './chat-input/configure-server-command';

const CHAT_INPUT_COMMANDS = [
  selectCiteChannelCommand,
  showCiteChannelCommand,
  addCiteCommand,
  getRandomCiteCommand,
  addCiteModalCommand,
  manageIgnoreCommand,
  configureServerCommand,
];

const MESSAGE_COMMANDS = [ignoreCitationCommand, unignoreCitationCommand];

export { CHAT_INPUT_COMMANDS, MESSAGE_COMMANDS };
