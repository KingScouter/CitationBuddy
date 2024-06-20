import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DiscordBackendService } from '../discord-backend/discord-backend.service';

@Component({
  selector: 'app-test-screen',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './test-screen.component.html',
  styleUrl: './test-screen.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestScreenComponent {
  @ViewChild('channelIdInput')
  protected channelIdInput?: ElementRef<HTMLInputElement>;
  @ViewChild('guildIdInput')
  protected guildIdInput?: ElementRef<HTMLInputElement>;

  title = 'citation-buddy';
  protected messageList = signal<string[]>([]);
  protected channelList = signal<string[]>([]);

  private readonly discordBackendService = inject(DiscordBackendService);

  protected async readMessages(): Promise<void> {
    const channelId = this.channelIdInput?.nativeElement.value ?? '';
    if (!channelId) {
      console.error('No channelId provided');
    }
    const messages = await this.discordBackendService.getMessages(channelId);
    const mappedMessages = messages.map((elem) => elem.content);
    console.log('Mapped messages: ', mappedMessages);
    this.messageList.set(mappedMessages);
  }

  protected async getChannels(): Promise<void> {
    const guildId = this.channelIdInput?.nativeElement.value ?? '';
    if (!guildId) {
      console.error('No guildId provided');
    }

    const channels = await this.discordBackendService.getChannels(guildId);
    const mappedChannels = channels.map((elem) =>
      elem.name !== null ? elem.name : ''
    );
    console.log('Mapped channels: ', mappedChannels);
    this.channelList.set(mappedChannels);
  }
}
