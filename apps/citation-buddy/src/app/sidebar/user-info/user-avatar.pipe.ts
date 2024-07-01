import { Pipe, PipeTransform } from '@angular/core';
import { DiscordAuth } from '../../models/discord-auth';

@Pipe({
  name: 'userAvatar',
  standalone: true,
})
export class UserAvatarPipe implements PipeTransform {
  transform(user: DiscordAuth): string {
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
  }
}
