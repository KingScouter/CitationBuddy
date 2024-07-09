import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs';
import { DiscordBackendService } from '../../discord-backend/discord-backend.service';
import { MessageConfig, ServerConfig } from '@cite/models';
import { APIMessage } from 'discord-api-types/v10';

type CitationTableElement = MessageConfig & { text: string };

@Component({
  selector: 'app-citations-list',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './citations-list.component.html',
  styleUrl: './citations-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitationsListComponent implements OnInit {
  protected readonly displayedColumns = computed(() => {
    return ['text', 'ignored', ...this.additionalColumns()];
  });

  protected readonly additionalColumns = signal<string[]>([]);
  protected readonly dataSource = signal<CitationTableElement[]>([]);

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly discordBackendService = inject(DiscordBackendService);

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(first()).subscribe(async (params) => {
      const guildId = params.get('guildId');
      if (!guildId) {
        return;
      }

      const messages = await this.discordBackendService.getMessages(guildId);
      const config = await this.discordBackendService.getServerConfigInfo(
        guildId
      );

      if (!config) {
        return;
      }

      this.mapDisplayColumns(config);
      this.mapDataSource(config, messages);
    });
  }

  private mapDisplayColumns(serverConfig: ServerConfig): void {
    this.additionalColumns.set(serverConfig.additionalContexts);
  }

  private mapDataSource(
    serverConfig: ServerConfig,
    messages: APIMessage[]
  ): void {
    const mapped: CitationTableElement[] = messages.map((message) => {
      const configuredMessage = serverConfig?.messageConfigs?.find(
        (elem) => elem.id === message.id
      );

      const val: CitationTableElement = {
        id: message.id,
        text: message.content,
        ignored: !!configuredMessage?.ignored,
        additionalData: {},
      };

      for (const additional of serverConfig.additionalContexts) {
        const data = configuredMessage?.additionalData[additional];
        val.additionalData[additional] = data ?? '';
      }

      return val;
    });

    this.dataSource.set(mapped);
  }
}
