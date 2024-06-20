import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'oauth',
    loadComponent: () =>
      import('./oauth-redirect/oauth-redirect.component').then(
        (comp) => comp.OauthRedirectComponent
      ),
  },
  {
    path: 'oauth-token',
    loadComponent: () =>
      import('./oauth-token-redirect/oauth-token-redirect.component').then(
        (comp) => comp.OauthTokenRedirectComponent
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
    path: '**',
    loadComponent: () =>
      import('./main-screen/main-screen.component').then(
        (comp) => comp.MainScreenComponent
      ),
  },
];
