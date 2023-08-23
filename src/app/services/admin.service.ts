import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { AttendanceSetupRequest } from "../interfaces/request/IAttendanceSetup";
import { IEmployeeRequest } from "../interfaces/request/IEmployee";
import { IEmployeeResponse } from "../interfaces/response/IEmployee";

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    constructor(private http: HttpClient){}

    getEmployees(): Observable<any>{
        return this.http.get<any>(environment.Api + `api/user`);
    }
    addEmployees(employeeData: IEmployeeRequest): Observable<IEmployeeResponse>{
        return this.http.post<IEmployeeResponse>(environment.Api + `api/user`, employeeData);
    }
    updateEmployee(employeeId: string, employeeData: IEmployeeRequest): Observable<IEmployeeResponse>{
        return this.http.put<IEmployeeResponse>(environment.Api + `api/user/${employeeId}`, employeeData);
    }
    getEmployeeById(employeeId: string): Observable<IEmployeeResponse>{
        return this.http.get<IEmployeeResponse>(environment.Api + `api/user/${employeeId}`);
    }
    deleteEmployee(employeeId: string): Observable<any>{
        return this.http.delete<any>(environment.Api + `api/user/${employeeId}`);
    }

    // attendance setup
    saveAttendanceSetup(data: AttendanceSetupRequest): Observable<any>{
        return this.http.post<AttendanceSetupRequest>(environment.Api + 'api/attendaceSetup', data);
    }
    updateAttendanceSetup(setupId: string, data: AttendanceSetupRequest): Observable<any>{
        return this.http.put<AttendanceSetupRequest>(environment.Api + `api/attendaceSetup/${setupId}`, data);
    }
    getAttendanceSetup(): Observable<any>{
        return this.http.get<any>(environment.Api + `api/attendaceSetup`);
    }

    // assign work week
    assignWorkWeek(data: any): Observable<any> {
        return this.http.post<any>(environment.Api + `/api/assignWorkWeek`, data);
    }
}