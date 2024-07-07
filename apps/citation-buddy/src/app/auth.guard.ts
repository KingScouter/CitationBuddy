import { CanActivateChildFn, Router } from '@angular/router';
import { AuthenticationService } from './authentication/authentication.service';
import { inject } from '@angular/core';
import { AppRoutes } from './models';

export const authGuard: CanActivateChildFn = async () => {
  const authenticationService = inject(AuthenticationService);
  const router = inject(Router);

  if (authenticationService.isAuthenticated()) {
    return true;
  }

  const user = await authenticationService.checkAuthentication();
  if (user) {
    return true;
  }

  router.navigate([AppRoutes.Login]);
  return false;
};
