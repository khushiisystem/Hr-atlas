import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimeSheetService {

  constructor(
    private _http: HttpClient,    
  ) { }
  
  getAllProjects(pageIndex: number, pageSize: number): Observable<any> {
    return this._http.get(environment.Api + `api/projects?skip=${pageIndex}&limit=${pageSize}`);
  }

  createProject(eventDate: any): Observable<any> {
    return this._http.post<any>(environment.Api + `api/projects`, eventDate);
  }


  getAllCategories(pageIndex: number, pageSize: number): Observable<any> {
    return this._http.get(environment.Api + `api/timesheet-category?skip=${pageIndex}&limit=${pageSize}`);
  }

}
