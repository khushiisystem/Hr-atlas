import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanDeactivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  constructor(private router: Router, private authServ: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    const token = this.authServ.getToken();

    return token && token.trim() !== '' ? true : this.router.navigateByUrl('/login');
  }

  canDeactivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = this.authServ.getToken();

    return token && token.trim() !== '' ? false : true;
  }
}

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

export const NameGuard: CanDeactivateFn<CanComponentDeactivate> = (
  component: CanComponentDeactivate
) => {
    if (component.canDeactivate()) {
      console.log(`💂‍♀️ [Guard] - Can Deactivate Guard - allowed`);
      return true;
    } else {
      console.log(`💂‍♀️ [Guard] - Can Deactivate Guard - not allowed`);
      return false;
  }
}
