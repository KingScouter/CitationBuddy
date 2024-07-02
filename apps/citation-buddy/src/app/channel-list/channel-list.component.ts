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
import { DiscordGuild } from '@cite/models';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-channel-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatListModule,
    GuildIconPipe,
    MatIconModule,
  ],
  templateUrl: './channel-list.component.html',
  styleUrl: './channel-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChannelListComponent implements OnInit {
  protected guilds = signal<DiscordGuild[]>([]);
  private readonly discordBackendService = inject(DiscordBackendService);

  ngOnInit(): void {
    this.discordBackendService.getGuilds().then((val) => {
      this.guilds.set(val);
    });
  }

  protected onGuildClick(guild: DiscordGuild): void {
    if (guild.hasBot) {
      console.log('Clicked guild: ', guild.guild.name);
    } else {
      console.log('Bot not on the server');
    }
  }
}
