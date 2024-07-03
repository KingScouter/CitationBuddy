import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiscordBackendService } from '../../discord-backend/discord-backend.service';
import { APIGuild } from 'discord-api-types/v10';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GuildIconPipe } from '../guild-icon.pipe';

@Component({
  selector: 'app-guild-detail',
  standalone: true,
  imports: [CommonModule, GuildIconPipe],
  templateUrl: './guild-detail.component.html',
  styleUrl: './guild-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuildDetailComponent implements OnInit {
  protected guild = signal<APIGuild | null>(null);

  private readonly discordBackendService = inject(DiscordBackendService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.activatedRoute.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(async (params) => {
        const guildId = params.get('guildId');
        if (!guildId) {
          return;
        }
        const guild = await this.discordBackendService.getGuild(guildId);
        this.guild.set(guild);
      });
  }
}
