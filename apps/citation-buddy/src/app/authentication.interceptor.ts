import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DiscordBackendService } from './discord-backend/discord-backend.service';

/**
 * Interceptor to add the stored credentials to every request to the backend.
 */
export const authenticationInterceptor: HttpInterceptorFn = (req, next) => {
  const backendService = inject(DiscordBackendService);
  // If the reuqest isn't for the own backend, don't attach the authentication cookie
  if (!req.url.startsWith(backendService.apiUrl)) {
    return next(req);
  }

  const newReq = req.clone({
    withCredentials: true,
  });
  return next(newReq);
};
