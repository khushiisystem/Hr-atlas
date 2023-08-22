import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { IJWTPayload } from '../interfaces/request/IPayload';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

export const ROLES = {
  ADMIN: 'Admin',
  EMPLOYEE: 'Employee'
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  header!: HttpHeaders;
  headers!: HttpHeaders | { [header: string]: string | string[] };
  currentUser!: Observable<string>;
  private currentUserSubject!: BehaviorSubject<string>;
  private currentUserPayload!: BehaviorSubject<IJWTPayload>;
  userRole: string = ROLES.EMPLOYEE;

  constructor(private http: HttpClient, public router: Router) {
    this.currentUserSubject = new BehaviorSubject<string>(
      localStorage.getItem('token') || ''
    );

    this.currentUserPayload = new BehaviorSubject<IJWTPayload>(
      localStorage.getItem('payload') !== undefined
        ? JSON.parse(localStorage.getItem('payload') as string)
        : false
    );

    this.header = new HttpHeaders({
      'Content-Type': 'Application/json',
      Authentication: `Barear ${this.currentUserSubject}`,
    });

    this.currentUser = this.currentUserSubject.asObservable();
  }

  hasRole(role: string): boolean{
    return this.userRole === role;
  }

  getToken(): string {
    return this.currentUserSubject.value || (null as any);
  }

  getUserPayload() {
    return this.currentUserPayload.value || null;
  }

  emailLogin(login: any): Observable<any> {
    return this.http.post<any>(environment.Api + 'api/login', login).pipe(
      map((user: any) => {
        return this.saveToken(user);
      })
    );
  }

  addUser(data: any): Observable<any> {
    return this.http.post<any>(environment.Api + 'api/user', data);
  }
  

  private saveToken(user: any) {
    localStorage.setItem('token', user.access_token);
    localStorage.setItem('payload', JSON.stringify(user.payload));
    localStorage.setItem('userRole', user.payload.role);
    localStorage.setItem('email', user.payload.email);
    localStorage.setItem('userId', user.payload.guid);
    this.currentUserSubject.next(user.access_token);
    this.currentUserPayload.next(user.payload);
    return user;
  }

  signOut() {
    this.currentUserSubject.next(null as any);
    this.currentUserPayload.next(null as any);
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
