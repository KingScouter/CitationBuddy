import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiscordBackendService } from '../discord-backend/discord-backend.service';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { GuildIconPipe } from './guild-icon.pipe';
import { APIGuild } from 'discord-api-types/v10';

@Component({
  selector: 'app-channel-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatListModule, GuildIconPipe],
  templateUrl: './channel-list.component.html',
  styleUrl: './channel-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChannelListComponent implements OnInit {
  protected guilds = signal<APIGuild[]>([]);
  private readonly discordBackendService = inject(DiscordBackendService);

  ngOnInit(): void {
    this.discordBackendService.getGuilds().then((val) => {
      this.guilds.set(val);
    });
  }
}
