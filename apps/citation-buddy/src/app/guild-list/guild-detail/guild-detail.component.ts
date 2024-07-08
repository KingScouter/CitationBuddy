import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  Signal,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiscordBackendService } from '../../discord-backend/discord-backend.service';
import { APIGuild } from 'discord-api-types/v10';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GuildIconPipe } from '../guild-icon.pipe';
import { ServerConfig, ServerConfigResponse } from '@cite/models';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { AppRoutes } from '../../models';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

interface ComboboxValue {
  key: string;
  value: string;
}

@Component({
  selector: 'app-guild-detail',
  standalone: true,
  imports: [
    CommonModule,
    GuildIconPipe,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatListModule,
    MatIconModule,
  ],
  templateUrl: './guild-detail.component.html',
  styleUrl: './guild-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuildDetailComponent implements OnInit {
  protected guild = signal<APIGuild | null>(null);
  protected serverConfigInfo = signal<ServerConfigResponse | null>(null);

  protected readonly availableChannels: Signal<ComboboxValue[]>;
  protected readonly additionalData = signal<string[]>([]);
  protected readonly isAdditionalDataEmpty = computed(() => {
    const data = this.additionalData();
    return !data || data.length <= 0;
  });
  protected readonly formGroup: FormGroup;

  private readonly discordBackendService = inject(DiscordBackendService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  constructor() {
    this.formGroup = this.fb.group({
      citeChannel: [''],
      additionalDataInput: [''],
    });

    this.availableChannels = computed(() => {
      const channels = this.serverConfigInfo()?.availableChannels;
      if (!channels || channels.length <= 0) return [];

      return channels.map(
        (elem) =>
          ({ key: elem.id, value: elem.name ?? '' } satisfies ComboboxValue)
      );
    });

    effect(() => {
      const citeChannelId = this.serverConfigInfo()?.citeChannelId;
      if (!citeChannelId) return;
      const citeChannelControl = this.formGroup.controls['citeChannel'];
      citeChannelControl.setValue(citeChannelId);
    });
  }

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

        const serverConfig =
          await this.discordBackendService.getServerConfigInfo(guildId);
        this.serverConfigInfo.set(serverConfig);
        if (serverConfig.additionalContexts?.length > 0) {
          this.additionalData.set(serverConfig.additionalContexts);
        }
      });
  }

  protected async onSaveConfig(): Promise<void> {
    console.log('Save config', this.formGroup.value);

    const guild = this.guild();
    const originalConfig = this.serverConfigInfo();
    if (!guild || !originalConfig) {
      console.log('No guild available');
      return;
    }

    const updatedConfig: ServerConfig = {
      guildId: guild.id,
      citeChannelId: this.formGroup.value.citeChannel,
      excludedMessageIds: originalConfig.excludedMessageIds,
      additionalContexts: this.additionalData(),
    };

    await this.discordBackendService.updateServerConfig(updatedConfig);

    this.router.navigate([AppRoutes.Guilds]);
  }

  protected onAddAdditionalData(): void {
    const newData = this.formGroup.value.additionalDataInput;
    if (!newData) {
      return;
    }

    const updatedData = new Set([...this.additionalData(), newData]);

    this.additionalData.set([...updatedData.values()]);
    this.formGroup.controls['additionalDataInput'].setValue('');
  }

  protected onDeleteAdditionalData(elem: string): void {
    this.additionalData.set(
      this.additionalData().filter((val) => val !== elem)
    );
  }
}
