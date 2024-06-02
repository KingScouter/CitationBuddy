import SelectCiteChannelCommand from './chat-input/select-cite-channel-command';
import ShowCiteChannelCommand from './chat-input/show-cite-channel-command';
import AddCiteCommand from './chat-input/add-cite-command';
import GetRandomCiteCommand from './chat-input/get-random-cite-command';
import AddCiteModalCommand from './chat-input/add-cite-modal-command';
import IgnoreCitationCommand from './message-command/ignore-citation-command';
import UnignoreCitationCommand from './message-command/unignore-citation-command';

const CHAT_INPUT_COMMANDS = [
  SelectCiteChannelCommand,
  ShowCiteChannelCommand,
  AddCiteCommand,
  GetRandomCiteCommand,
  AddCiteModalCommand,
];

const MESSAGE_COMMANDS = [IgnoreCitationCommand, UnignoreCitationCommand];

export { CHAT_INPUT_COMMANDS, MESSAGE_COMMANDS };
