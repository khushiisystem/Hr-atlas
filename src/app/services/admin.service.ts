import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    constructor(private http: HttpClient){}

    getEmployees(pageIndex: number, pageSize: number): Observable<any>{
        return this.http.get<any>(environment.Api + `api/employee?skip=${pageIndex}&limit=${pageSize}`);
    }
    addEmployees(employeeData: any): Observable<any>{
        return this.http.post<any>(environment.Api + `api/employee`, employeeData);
    }
    updateEmployees(employeeId: string, employeeData: any): Observable<any>{
        return this.http.put<any>(environment.Api + `api/employee/${employeeId}`, employeeData);
    }
    getEmployeeById(employeeId: string): Observable<any>{
        return this.http.get<any>(environment.Api + `api/employee/${employeeId}`);
    }
    deleteEmployee(employeeId: string): Observable<any>{
        return this.http.delete<any>(environment.Api + `api/employee/${employeeId}`);
    }
}