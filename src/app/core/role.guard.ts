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
  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const role = localStorage.getItem('userRole') ?? "";
    const reqRole: Array<string> = route.data?.['role'] || [];
    const hasAccess = (reqRole.includes(role));
    return hasAccess ? true : this.router.createUrlTree(['/tabs/home']);
  }
}
