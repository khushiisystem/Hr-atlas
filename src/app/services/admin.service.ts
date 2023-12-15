import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { AttendanceSetupRequest, udpateAttendanceRequst } from "../interfaces/request/IAttendanceSetup";
import { IEmployeeRequest } from "../interfaces/request/IEmployee";
import { IEmployeeResponse, IEmployeeWrokResponse } from "../interfaces/response/IEmployee";
import { IAttendanceSetupResponse, IClockInResponce } from "../interfaces/response/IAttendanceSetup";
import { IAssignWorkWeek, IWorkWeek } from "../interfaces/request/IAssignWorks";
import { IWorkWeekResponse } from "../interfaces/response/IWorkWeek";
import { IHollydayRequest, ILeaveSetupRequest } from "../interfaces/request/ILeaveSetup";
import { IHollydayResponse, ILeaveSetupResponse } from "../interfaces/response/ILeave";
import { IEmployeeWorkRequest } from "../interfaces/request/IEmployeeWork";
import { ISalarySetupRequest } from "../interfaces/request/ISalarySetup";
import { ISalarySetupResponse } from "../interfaces/response/ISalaryResponse";
import { IPayslipResponse } from "../interfaces/response/payslipResponse";

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    constructor(private http: HttpClient){}

    getEmployees(pageIndex: number, pageSize: number): Observable<any>{
        return this.http.get<any>(environment.Api + `api/user?skip=${pageIndex}&limit=${pageSize}`);
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

    addEmployeesWork(workData: IEmployeeWorkRequest): Observable<IEmployeeWorkRequest>{
        return this.http.post<IEmployeeWorkRequest>(environment.Api + `api/employeeWork`, workData);
    }
    updateEmployeeWork(employeeWorkId: string, employeeWorkData: IEmployeeRequest): Observable<IEmployeeWrokResponse>{
        return this.http.put<IEmployeeWrokResponse>(environment.Api + `api/employeeWork/${employeeWorkId}`, employeeWorkData);
    }
    getWorkByEmployeeId(employeeId: string): Observable<IEmployeeWrokResponse[]>{
        return this.http.post<IEmployeeWrokResponse[]>(environment.Api + `api/employeeWork/userId`, {userId: employeeId});
    }
    deleteEmployeeWork(employeeId: string): Observable<IEmployeeWrokResponse>{
        return this.http.delete<IEmployeeWrokResponse>(environment.Api + `api/employeeWork/${employeeId}`);
    }

    // attendance setup
    saveAttendanceSetup(data: AttendanceSetupRequest): Observable<IAttendanceSetupResponse>{
        return this.http.post<IAttendanceSetupResponse>(environment.Api + 'api/attendancesetup', data);
    }
    getAttendanceSetup(): Observable<IAttendanceSetupResponse>{
        return this.http.get<IAttendanceSetupResponse>(environment.Api + `api/attendancesetup`);
    }
    updateEmployeeAttendance(uuid: string, attendanceData: udpateAttendanceRequst): Observable<any> {
        return this.http.put<any>(environment.Api + `api/attendence/${uuid}`, attendanceData);
    }
    getDailyAttendance(dateStr: string, pageIndex: number, pageSize: number): Observable<IClockInResponce[]> {
        return this.http.get<IClockInResponce[]>(environment.Api + `api/attendence/dayAttendance?skip=${pageIndex}&limit=${pageSize}&date=${dateStr}`);
    }
    markAttendEmp(employeeId: string, reqData: any, markDate: Date): Observable<IClockInResponce> {
        return this.http.post<IClockInResponce>(environment.Api + `api/attendence/markAttendance?id=${employeeId}&time=${markDate.toISOString()}`, reqData);
    }

    // assign work week
    createWorkWeek(data: IWorkWeek): Observable<any> {
        return this.http.post<any>(environment.Api + `api/workWeek`, data);
    }
    getWorkWeek(pageIndex: number, pageSize: number): Observable<IWorkWeekResponse[]> {
        return this.http.get<IWorkWeekResponse[]>(environment.Api + `api/workWeek?skip=${pageIndex}&limit=${pageSize}`);
    }
    deletetWorkWeek(workWeekID: string): Observable<any> {
        return this.http.delete<any>(environment.Api + `api/workWeek/${workWeekID}`);
    }
    assignWorkWeek(data: IAssignWorkWeek): Observable<any> {
        return this.http.post<any>(environment.Api + `api/workWeekEmployee`, data);
    }

    // leave setup
    addLeaveSetup(leaveData: ILeaveSetupRequest): Observable<ILeaveSetupRequest> {
        return this.http.post<ILeaveSetupRequest>(environment.Api + `api/leaveSetup`, leaveData);
    }
    deleteLeaveSetup(leaveId: string): Observable<any> {
        return this.http.delete<any>(environment.Api + `api/leaveSetup/${leaveId}`);
    }
    getLeaveSetup(): Observable<ILeaveSetupResponse> {
        return this.http.get<ILeaveSetupResponse>(environment.Api + `api/leaveSetup/getLeaveSetup`);
    }
    leaveApprove(leaveData: {leaveGuid: string, aproveLeave: boolean}): Observable<any> {
        return this.http.put<any>(environment.Api + `api/applyLeave/aproveLeave`, leaveData);
    }

    createEventHollyday(eventData: IHollydayRequest): Observable<IHollydayRequest> {
        return this.http.post<IHollydayRequest>(environment.Api + `api/hollyday`, eventData);
    }
    updateEventHollyday(eventId: string, eventData: IHollydayRequest): Observable<IHollydayRequest> {
        return this.http.put<IHollydayRequest>(environment.Api + `api/hollyday/${eventId}`, eventData);
    }
    getEventHollyday(selectedYear: string | number): Observable<IHollydayResponse[]> {
        return this.http.get<IHollydayResponse[]>(environment.Api + `api/hollyday/allHollyday?date=${selectedYear}`);
    }
    deleteEventHollyday(eventId: string): Observable<IHollydayRequest> {
        return this.http.delete<IHollydayRequest>(environment.Api + `api/hollyday${eventId}`);
    }


    // payroll and salary setup
    employeeSalarySetup(salaryData: ISalarySetupRequest): Observable<ISalarySetupRequest> {
        return this.http.post<ISalarySetupRequest>(environment.Api + `api/salary`, salaryData);
    }
    deleteEmployeeSalarySetup(salarysetupId: string): Observable<ISalarySetupRequest> {
        return this.http.delete<ISalarySetupRequest>(environment.Api + `api/salary/${salarysetupId}`);
    }
    getEmloyeeReviseSalary(userId: string): Observable<ISalarySetupResponse> {
        return this.http.get<ISalarySetupResponse>(environment.Api + `api/salary/latestSalary/${userId}`);
    }
    getEmloyeeSalaryHistory(userId: string, pageIndex: number, pageSize: number): Observable<ISalarySetupResponse[]> {
        return this.http.get<ISalarySetupResponse[]>(environment.Api + `api/salary/employeeId/${userId}?skip=${pageIndex}&limit=${pageSize}`);
    }
    getEmloyeePayStructure(userId: string, date: string): Observable<ISalarySetupResponse> {
        return this.http.get<ISalarySetupResponse>(environment.Api + `api/salary/getSalarybeforeDate?employeeId=${userId}&date=${date}`);
    }

    createPayslip(payslipData: {employeeIds: Array<string>, date: string}): Observable<any> {
        return this.http.post<any>(environment.Api + `api/paySlip`, payslipData);
    }
    getEmployeePayslip(payslipData: {employeeId: string, date: string}): Observable<IPayslipResponse> {
        return this.http.get<IPayslipResponse>(environment.Api + `api/paySlip?employeeId=${payslipData.employeeId}&date=${payslipData.date}`);
    }
    createIndividualPayslip(payslipData: IPayslipResponse): Observable<any> {
        return this.http.post<any>(environment.Api + `api/paySlip`, payslipData);
    }
}