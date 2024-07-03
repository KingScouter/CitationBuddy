import { Pipe, PipeTransform } from '@angular/core';
import {
  APIGuild,
  CDNRoutes,
  ImageFormat,
  RouteBases,
} from 'discord-api-types/v10';

@Pipe({
  name: 'guildIcon',
  standalone: true,
})
export class GuildIconPipe implements PipeTransform {
  transform(guild: APIGuild): string {
    const { id, icon } = guild;
    if (!icon) {
      return '';
    }
    return `${RouteBases.cdn}/${CDNRoutes.guildIcon(
      id,
      icon,
      ImageFormat.PNG
    )}`;
  }
}
