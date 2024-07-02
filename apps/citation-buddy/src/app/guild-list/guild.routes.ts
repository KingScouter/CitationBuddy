import { Route } from '@angular/router';

export const guildRoutes: Route[] = [
  {
    path: ':guildId',
    loadComponent: () =>
      import('./guild-detail/guild-detail.component').then(
        (comp) => comp.GuildDetailComponent
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./guild-list.component').then((comp) => comp.GuildListComponent),
  },
];
