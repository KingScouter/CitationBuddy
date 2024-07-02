import { Pipe, PipeTransform } from '@angular/core';
import { DiscordAuth } from '../../models/discord-auth';
import { CDNRoutes, ImageFormat, RouteBases } from 'discord-api-types/v10';

@Pipe({
  name: 'userAvatar',
  standalone: true,
})
export class UserAvatarPipe implements PipeTransform {
  transform(user: DiscordAuth): string {
    return `${RouteBases.cdn}${CDNRoutes.userAvatar(
      user.id,
      user.avatar,
      ImageFormat.PNG
    )}`;
  }
}
