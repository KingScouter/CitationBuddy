import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { ChannelListComponent, DiscordGuild } from './channel-list.component';
import { DiscordBackendService } from '../discord-backend/discord-backend.service';
import { signal, InputSignal } from '@angular/core';

const fakeGuilds: DiscordGuild[] = [
  {
    id: '155660323750150153',
    name: 'Scoutulus',
    icon: 'e35c3c10d058081f3fd025390f9d5bdb',
  },
];

// const discordBackendServiceMock = {
//   getGuilds(): Promise<DiscordGuild[]> {
//     // const fakeGuild: APIGuild = {

//     // }

//     const fakeGuilds: DiscordGuild[] = [];

//     return Promise.resolve(fakeGuilds);
//   },
// };

const meta: Meta<ChannelListComponent> = {
  component: ChannelListComponent,
  decorators: [
    moduleMetadata({
      imports: [ChannelListComponent],
      providers: [
        // { provide: DiscordBackendService, useValue: discordBackendServiceMock },
      ],
    }),
  ],
};
export default meta;

type Story = StoryObj<ChannelListComponent>;

export const Base: Story = {
  args: {
    // guilds: signal<DiscordGuild[]>(fakeGuilds) as unknown as InputSignal<
    //   DiscordGuild[]
    // >,
    guilds: fakeGuilds,
  },
};
