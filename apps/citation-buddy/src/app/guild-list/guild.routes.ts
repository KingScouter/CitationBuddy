import { Route } from '@angular/router';
import { AppRoutes } from '../models';

export const guildRoutes: Route[] = [
  {
    path: ':guildId',
    loadComponent: () =>
      import('./guild-detail/guild-detail.component').then(
        comp => comp.GuildDetailComponent
      ),
  },
  {
    path: `${AppRoutes.CitationsList}/:guildId`,
    loadComponent: () =>
      import('./citations-list/citations-list.component').then(
        comp => comp.CitationsListComponent
      ),
  },

  {
    path: '',
    loadComponent: () =>
      import('./guild-list.component').then(comp => comp.GuildListComponent),
  },
];
