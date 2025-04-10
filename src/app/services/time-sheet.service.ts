import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApproveTimesheetReq } from '../interfaces/request/ITimesheet';

@Injectable({
  providedIn: 'root'
})
export class TimeSheetService {

  constructor(
    private _http: HttpClient,    
  ) { }
  
  // project
  getAllProjects(pageIndex: number, pageSize: number): Observable<any> {
    return this._http.get<any[]>(environment.Api + `api/projects?skip=${pageIndex}&limit=${pageSize}`);
  }

  getProjectById(id: string): Observable<any> {
    return this._http.get<any>(environment.Api + `api/projects/${id}`);
  }

  addProject(data: any): Observable<any> {
    return this._http.post<any>(environment.Api + 'api/projects', data);
  }

  updateProject(id: string, data:any): Observable<any> {
    return this._http.put<any>(environment.Api + `api/projects/${id}`, data);
  }

  deleteProject(id: string): Observable<any> {
    return this._http.delete<any>(environment.Api + `api/projects/${id}`);
  }

  searchProject(title: string): Observable<any> {
    return this._http.get<any>(environment.Api + `api/projects/search?title=${title}`);
  }
 
  // category
  getAllCategories(pageIndex: number, pageSize: number): Observable<any> {
    return this._http.get<any>(environment.Api + `api/timesheet-category?skip=${pageIndex}&limit=${pageSize}`);
  }
  getCategoryById(id: string): Observable<any> {
    return this._http.get<any>(environment.Api + `api/timesheet-category/${id}`);
  }
  addCategory(data: any): Observable<any> {
    return this._http.post<any>(environment.Api + `api/timesheet-category`, data);
  }

  updateCategory(id: string, data: any): Observable<any> {
    return this._http.put<any>(environment.Api + `api/timesheet-category/${id}`, data);
  }

  deleteCategory(id: string): Observable<any> {
    return this._http.delete<any>(environment.Api + `api/timesheet-category/${id}`);
  }

  searchCategory(category: string): Observable<any> {
    return this._http.get<any>(environment.Api + `api/timesheet-category/search?category=${category}`);
  }

  // sub-category
  getAllSubCategories(pageIndex: number, pagesize: number): Observable<any> {
    return this._http.get<any>(environment.Api + `api/timesheet-sub-category?skip=${pageIndex}&limit=${pagesize}`);    
  }

  getSubCategoryById(id: string): Observable<any> {
    return this._http.get<any> (environment.Api + `api/timesheet-sub-category/${id}`);
  }

  addSubCateory(data: any): Observable<any> {
    return this._http.post<any>(environment.Api + `api/timesheet-sub-category`, data);
  }

  updateSubCategory(id: string, data: any): Observable<any> {
    return this._http.put<any>(environment.Api + `api/timesheet-sub-category/${id}`, data);
  }

  deleteSubCategory(id: string): Observable<any> {
    return this._http.delete<any>(environment.Api + `api/timesheet-sub-category/${id}`);
  }

  searchSubCategory(subCategory: string): Observable<any> {
    return this._http.get<any>(environment.Api + `api/timesheet-sub-category/search?subCategory=${subCategory}`);
  }

  // timesheet 
  addTimesheet(data: any): Observable<any> {
    return this._http.post<any>(environment.Api + `api/timesheet`, data);
  }

  getTimesheetList(pageIndex: number, pagesize: number, date: string): Observable<any> {
    return this._http.get<any>(environment.Api + `api/timesheet/getAdminTimesheet?skip=${pageIndex}&limit=${pagesize}&date=${date}`);
  }

  updateTimesheet(id: string, data: any): Observable<any> {
    return this._http.put<any>(environment.Api + `api/timesheet/${id}`, data);
  }

  deleteTimesheet(id: string): Observable<any> {
    return this._http.delete<any>(environment.Api + `api/timesheet/${id}`);
  }

  getTimesheetDay(date: string) {
    return this._http.get<any>(environment.Api + `api/timesheet/getDayTimesheet?date=${date}`);
  }

  getTimesheetMonth(date: string) {
    return this._http.get<any>(environment.Api + `api/timesheet/getMonthTimesheet?date=${date}`);
  }

  getAllTimesheetOfMonth(date: string) {
    return this._http.get<any>(environment.Api + `api/timesheet/getMontlytimesheetdata?date=${date}`);
  }

  // get particular user timesheet list
  getUserTimesheet(pageIndex: number, pagesize: number, id: string, date: string): Observable<any> {
    return this._http.get<any>(environment.Api + `api/timesheet/getUsersTimesheet?skip=${pageIndex}&limit=${pagesize}&userId=${id}&date=${date}`)
  }


  // timesheet reject, approve
  approveReject(data: ApproveTimesheetReq): Observable<any> {
    return this._http.put<any>(environment.Api + `api/timesheet/approveTimesheet`, data)
  }

  // assign project 
  addAssignProject(data: any): Observable<any> {
    return this._http.post<any>(environment.Api + `api/assign-project`, data);
  }

  getAllAssignProjects(pageIndex: number, pagesize: number): Observable<any> {
    return this._http.get<any[]>(environment.Api + `api/assign-project?skip=${pageIndex}&limit=${pagesize}`);
  }

  // getAssignProjectById(pageIndex: number, pagesize: number, userId: string): Observable<any> {
  //   return this._http.get<any[]>(environment.Api + `api/assign-project?skip=${pageIndex}&limit=${pagesize}`);
  // }

  getAssignProjectById(userId: string): Observable<any> {
    return this._http.get<any[]>(environment.Api + `api/assign-project/${userId}`);
  }

  updateAssignProject(id: string, data: any): Observable<any> {
    return this._http.put<any>(environment.Api + `api/assign-project/${id}`, data);
  }


}
