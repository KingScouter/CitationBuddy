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
    path: 'test',
    loadComponent: () =>
      import('./test-screen/test-screen.component').then(
        (comp) => comp.TestScreenComponent
      ),
  },
  {
    path: 'oauth-error',
    loadComponent: () =>
      import('./oauth-error/oauth-error.component').then(
        (comp) => comp.OauthErrorComponent
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
