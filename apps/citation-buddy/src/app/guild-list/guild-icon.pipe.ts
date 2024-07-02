import { Pipe, PipeTransform } from '@angular/core';
import { DiscordGuild } from '@cite/models';
import { CDNRoutes, ImageFormat, RouteBases } from 'discord-api-types/v10';

@Pipe({
  name: 'guildIcon',
  standalone: true,
})
export class GuildIconPipe implements PipeTransform {
  transform(guild: DiscordGuild): string {
    const { id, icon } = guild.guild;
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
