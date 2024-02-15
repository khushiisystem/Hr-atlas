import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { AuthService } from './auth.service';
import { IRoles } from '../interfaces/enums/IRoles';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  authService = inject(AuthService);
  router = inject(Router);
  role = localStorage.getItem('userRole') ?? "";

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const reqRole = route.data?.['role'];
    const hasAccess = (reqRole === this.role);
    return hasAccess ? true : this.router.createUrlTree(['/tabs/home']);
  }
}
