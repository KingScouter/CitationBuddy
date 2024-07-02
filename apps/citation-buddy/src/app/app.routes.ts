import { Route } from '@angular/router';
import { AppRoutes } from './models';

export const appRoutes: Route[] = [
  {
    path: AppRoutes.Oauth,
    loadComponent: () =>
      import('./oauth-redirect/oauth-redirect.component').then(
        (comp) => comp.OauthRedirectComponent
      ),
  },
  {
    path: 'test',
    loadComponent: () =>
      import('./test-screen/test-screen.component').then(
        (comp) => comp.TestScreenComponent
      ),
  },
  {
    path: AppRoutes.OauthError,
    loadComponent: () =>
      import('./oauth-error/oauth-error.component').then(
        (comp) => comp.OauthErrorComponent
      ),
  },
  {
    path: AppRoutes.Guilds,
    loadChildren: () =>
      import('./guild-list/guild.routes').then((routes) => routes.guildRoutes),
  },
  {
    path: '**',
    loadComponent: () =>
      import('./main-screen/main-screen.component').then(
        (comp) => comp.MainScreenComponent
      ),
  },
];
