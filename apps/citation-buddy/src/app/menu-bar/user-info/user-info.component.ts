import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DiscordAuth } from '../../models/discord-auth';
import { UserAvatarPipe } from './user-avatar.pipe';
import { MatIconModule } from '@angular/material/icon';

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

  loginClick = output();
  logoutClick = output();

  protected onLoginButtonClick(): void {
    this.loginClick.emit();
  }

  protected onLogoutButtonClick(): void {
    this.logoutClick.emit();
  }
}
