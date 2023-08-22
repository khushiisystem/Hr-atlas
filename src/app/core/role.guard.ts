import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  authService = inject(AuthService);
  router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const role = route.data?.['role'];
    const hasAccess = this.authService.hasRole(role);
    return hasAccess ? true : this.router.createUrlTree(['/tabs/home']);
  }
}
