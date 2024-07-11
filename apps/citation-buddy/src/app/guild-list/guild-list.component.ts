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
import { Router } from '@angular/router';
import { AppRoutes } from '../models';

@Component({
  selector: 'app-guild-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatListModule,
    GuildIconPipe,
    MatIconModule,
  ],
  templateUrl: './guild-list.component.html',
  styleUrl: './guild-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuildListComponent implements OnInit {
  protected guilds = signal<DiscordGuild[]>([]);
  private readonly discordBackendService = inject(DiscordBackendService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.discordBackendService.getGuilds().then(val => {
      this.guilds.set(val);
    });
  }

  protected onGuildClick(guild: DiscordGuild): void {
    if (guild.hasBot) {
      this.router.navigate([AppRoutes.Guilds, guild.guild.id]);
    } else {
      console.log('Bot not on the server');
    }
  }
}
