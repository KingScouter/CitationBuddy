import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OAuth2Routes, OAuth2Scopes } from 'discord-api-types/v10';
import { DiscordAuth } from '../../models/discord-auth';
import { UserAvatarPipe } from './user-avatar.pipe';
import { MatIconModule } from '@angular/material/icon';
import { AppConfig } from '../../models';

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [CommonModule, UserAvatarPipe, MatIconModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserInfoComponent {
  user = input.required<DiscordAuth | null>();

  private readonly oauth2Scopes: OAuth2Scopes[] = [
    OAuth2Scopes.Identify,
    OAuth2Scopes.Guilds,
  ];

  private readonly oauth2Url = `${OAuth2Routes.authorizationURL}?client_id=${
    AppConfig.CLIENT_ID
  }&response_type=code&redirect_uri=${encodeURI(
    AppConfig.BASE_REDIRECT_URI
  )}&scope=${this.oauth2Scopes.join('+')}`;

  protected onLoginButtonClick(): void {
    window.open(this.oauth2Url, '_self');
  }

  protected onLogoutButtonClick(): void {
    console.log('Should revoke token');
  }
}
