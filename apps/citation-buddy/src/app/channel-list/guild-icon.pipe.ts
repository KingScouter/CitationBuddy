import { Pipe, PipeTransform } from '@angular/core';
import { APIGuild } from 'discord-api-types/v10';

@Pipe({
  name: 'guildIcon',
  standalone: true,
})
export class GuildIconPipe implements PipeTransform {
  transform(guild: APIGuild): string {
    return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`;
  }
}
