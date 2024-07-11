import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs';
import { DiscordBackendService } from '../../discord-backend/discord-backend.service';
import { ServerConfig } from '@cite/models';
import { APIMessage } from 'discord-api-types/v10';
import { MessageWithContext } from './models/message-with-context';
import { MessageEditComponent } from './message-edit/message-edit.component';

@Component({
  selector: 'app-citations-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, NgClass, MessageEditComponent],
  templateUrl: './citations-list.component.html',
  styleUrl: './citations-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CitationsListComponent implements OnInit {
  protected readonly displayedColumns = computed(() => {
    return ['text', 'ignored', ...this.additionalColumns()];
  });

  protected readonly additionalColumns = signal<string[]>([]);
  protected readonly dataSource = signal<MessageWithContext[]>([]);

  protected readonly selectedRow = signal<MessageWithContext | null>(null);

  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly discordBackendService = inject(DiscordBackendService);

  private readonly guildId = signal<string>('');

  ngOnInit(): void {
    this.activatedRoute.paramMap.pipe(first()).subscribe(async (params) => {
      const guildId = params.get('guildId');
      if (!guildId) {
        return;
      }
      this.guildId.set(guildId);

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

  protected onRowClick(row: MessageWithContext): void {
    console.log('Clicked on row: ', row);
    if (row.id === this.selectedRow()?.id) {
      this.selectedRow.set(null);
    } else {
      this.selectedRow.set(row);
    }
  }

  protected async onSaveMessage(data: MessageWithContext): Promise<void> {
    await this.discordBackendService.updateMessageConfig(this.guildId(), data);

    this.dataSource.update((val) => {
      const updatedValues = [...val];
      const toUpdate = updatedValues.findIndex((elem) => elem.id === data.id);
      if (toUpdate >= 0) {
        updatedValues.splice(toUpdate, 1, data);
      }

      return updatedValues;
    });

    this.selectedRow.set(null);
  }

  private mapDisplayColumns(serverConfig: ServerConfig): void {
    this.additionalColumns.set(serverConfig.additionalContexts);
  }

  private mapDataSource(
    serverConfig: ServerConfig,
    messages: APIMessage[]
  ): void {
    const mapped: MessageWithContext[] = messages.map((message) => {
      const configuredMessage = serverConfig?.messageConfigs?.find(
        (elem) => elem.id === message.id
      );

      const val: MessageWithContext = {
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
