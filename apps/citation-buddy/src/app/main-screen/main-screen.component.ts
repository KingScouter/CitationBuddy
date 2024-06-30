import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../authentication/authentication.service';
import { DiscordBackendService } from '../discord-backend/discord-backend.service';

@Component({
  selector: 'app-main-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main-screen.component.html',
  styleUrl: './main-screen.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainScreenComponent {
  private readonly authenticationService = inject(AuthenticationService);
  private readonly discordBackendService = inject(DiscordBackendService);

  protected isLoggedIn = computed(this.authenticationService.isAuthenticated);

  protected backendData = signal<string[]>([]);

  protected async onGetChannels(): Promise<void> {
    const channels = await this.discordBackendService.getGuilds();
    this.backendData.set(channels.map((elem) => JSON.stringify(elem)));
  }
}
