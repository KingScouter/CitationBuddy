import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor to add the stored credentials to every request to the backend.
 */
export const authenticationInterceptor: HttpInterceptorFn = (req, next) => {
  const newReq = req.clone({
    withCredentials: true,
  });
  return next(newReq);
};
