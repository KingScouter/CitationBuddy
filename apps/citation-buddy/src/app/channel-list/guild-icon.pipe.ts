import { Pipe, PipeTransform } from '@angular/core';
import { DiscordGuild } from '@cite/models';

@Pipe({
  name: 'guildIcon',
  standalone: true,
})
export class GuildIconPipe implements PipeTransform {
  transform(guild: DiscordGuild): string {
    return `https://cdn.discordapp.com/icons/${guild.guild.id}/${guild.guild.icon}.png`;
  }
}
