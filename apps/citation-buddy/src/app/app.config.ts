import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { environment } from '../environments/environment';
import { authenticationInterceptor } from './authentication.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([authenticationInterceptor])),
    provideRouter(appRoutes),
    {
      provide: 'API_URL',
      useValue: `${environment.apiUrl}:${environment.apiPort}`,
    },
    provideAnimationsAsync(),
  ],
};
