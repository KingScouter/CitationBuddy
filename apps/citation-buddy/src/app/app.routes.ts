import { Route } from '@angular/router';
import { AppRoutes } from './models';
import { authGuard } from './auth.guard';

export const appRoutes: Route[] = [
  {
    path: AppRoutes.Login,
    loadComponent: () =>
      import('./login/login.component').then((comp) => comp.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./main/main.component').then((comp) => comp.MainComponent),
    canActivateChild: [authGuard],
    children: [
      {
        path: AppRoutes.Oauth,
        loadComponent: () =>
          import('./oauth-redirect/oauth-redirect.component').then(
            (comp) => comp.OauthRedirectComponent
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
          import('./guild-list/guild.routes').then(
            (routes) => routes.guildRoutes
          ),
      },
      {
        path: '**',
        redirectTo: AppRoutes.Guilds,
      },
    ],
  },
];
