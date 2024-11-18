import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ToastController } from "@ionic/angular";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { IOTPRequest, IOptVerifyRequest, IResetPasswordRequest } from "../interfaces/request/IOtpRequest";
import { IEmployeeRequest } from "../interfaces/request/IEmployee";
import { IEmployeeResponse, IEmployeeWrokResponse } from "../interfaces/response/IEmployee";
import { ILeaveRequest } from "../interfaces/request/ILeaveApply";
import { IClockInResponce } from "../interfaces/response/IAttendanceSetup";
import { IHollydayResponse, ILeaveLogsResponse, ILeaveSetupResponse, ILeaveStatus } from "../interfaces/response/ILeave";
import { IEmplpoyeeWorWeek } from "../interfaces/response/IEmplpoyeeWorWeek";
import { IRegularization } from "../employee/attendance/attendance.page";
import { IApproveRegularizationReq } from "../interfaces/request/IApproveRegularization";

@Injectable({
  providedIn: "root",
})
export class ShareService {
  constructor(
    private toastController: ToastController,
    private http: HttpClient,
  ){}

  async presentToast(message: string, position: "top" | "middle" | "bottom", color: "primary" | "dark" | "secondary" | "tertiary" | "success" | "warning" | "danger" | "medium") {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: position,
      color: color
    });

    await toast.present();
  }


  // APIs for employee
  getAllEmployee(empType: 'All' | 'Active' | 'InActive', pageIndex: number, pageSize: number): Observable<IEmployeeResponse[]>{
    return this.http.get<IEmployeeResponse[]>(environment.Api + `api/user?isDeleted=${empType}&skip=${pageIndex}&limit=${pageSize}`);
  }
  getEmployeeById(empId: string): Observable<IEmployeeResponse>{
    return this.http.get<IEmployeeResponse>(environment.Api + `api/user/${empId}`);
  }
  updateEmployeeById(empId: string, empData: IEmployeeRequest): Observable<IEmployeeRequest>{
    return this.http.put<any>(environment.Api + `api/user/${empId}`, empData);
  }
  searchEmployee(empData: any): Observable<any>{
    return this.http.post<any>(environment.Api + `api/user/search`, empData);
  }
  getWorkByEmployeeId(employeeId: string): Observable<IEmployeeWrokResponse>{
    return this.http.post<IEmployeeWrokResponse>(environment.Api + `api/employeeWork/userId`, {userId: employeeId});
  }

  // payroll APIs
  getEmployeePayroll(empId: string, session: string | Date): Observable<any>{
    return this.http.get<any>(environment.Api + `api/payroll/employee/${empId}?session=${session}`, {
      headers: {
        responseType: 'blob',
      }
    });
  }
  downloadPayslip(employeeId: string, slipDate: string | Date): Observable<any> {
    return this.http.get(environment.Api + `api/paySlip/generatepdf?employeeId=${employeeId}&payslipDate=${slipDate}`, {
      responseType: 'blob',
    });
  }

  public exportFile(res: Blob, fileName: string) {
    const url = window.URL.createObjectURL(res);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    // the filename you want
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    // const blob = new Blob(res, {type: 'application/pdf'});
    // const url = window.URL.createObjectURL(res);
    // window.open(url);
  }

  // sharable APIs
  getOTP(data: IOTPRequest): Observable<any> {
    return this.http.post<any>(environment.Api + `api/user/sendOtp`, data);
  }
  verifyOTP(data: IOptVerifyRequest): Observable<any> {
    return this.http.post<any>(environment.Api + `api/user/verifyOtp`, data);
  }
  resetPassword(data: IResetPasswordRequest): Observable<any> {
    return this.http.put<any>(environment.Api + `api/user/forgotPassword`, data);
  }
  changePassword(data: any): Observable<any> {
    return this.http.post<any>(environment.Api + `api/user/changePassword`, data);
  }

  // APIs related to attendance
  clockIn(): Observable<IClockInResponce> {
    return this.http.post<IClockInResponce>(environment.Api + `api/attendence/clockIn`, {});
  }
  clockOut(clockinId: string): Observable<IClockInResponce> {
    return this.http.put<IClockInResponce>(environment.Api + `api/attendence/clockOut/${clockinId}`, {});
  }
  leaveApply(leaveData: ILeaveRequest): Observable<ILeaveRequest> {
    return this.http.post<ILeaveRequest>(environment.Api + `api/applyLeave`, leaveData);
  }
  cancelLeave(leaveId: string): Observable<any> {
    return this.http.put<any>(environment.Api + `api/applyLeave/cancelLeave/${leaveId}`, {});
  }
  getLeaveList(filterData: any, pageIndex: number, pageSize: number): Observable<ILeaveLogsResponse[]> {
    return this.http.post<ILeaveLogsResponse[]>(environment.Api + `api/applyLeave/allLeaves?skip=${pageIndex}&limit=${pageSize}`, filterData);
  }
  getLeaveStatus(): Observable<ILeaveStatus> {
    return this.http.get<ILeaveStatus>(environment.Api + `api/leaveStatus/getLeaveStatus`);
  }
  getMonthLeaves(empId: string, monthDate: string): Observable<ILeaveLogsResponse[]> {
    return this.http.get<ILeaveLogsResponse[]>(environment.Api + `api/applyLeave/monthLeaves?Date=${monthDate}&employeeId=${empId}`);
  }
  employeeAttendance(employeeId: string, pageIndex: number, pageSize: number): Observable<any> {
    return this.http.get<any>(environment.Api + `api/attendence/employeeId/${employeeId}?skip=${pageIndex}&limit=${pageSize}`);
  }
  todayAttendance(): Observable<any> {
    return this.http.get<any>(environment.Api + `api/attendence/todayAttendance`);
  }
  monthlyAttendance(employeeId: string, dateStr: string, pageIndex: number, pageSize: number): Observable<IClockInResponce[]> {
    return this.http.get<IClockInResponce[]>(environment.Api + `api/attendence/monthAttendance?employeeId=${employeeId}&date=${dateStr}&skip=${pageIndex}&limit=${pageSize}`)
  }

  // employee workWeek
  employeeAssignedWorkWeek(emplId: string) : Observable<IEmplpoyeeWorWeek> {
    return this.http.get<IEmplpoyeeWorWeek>(environment.Api + `api/workWeekEmployee/employeeId/${emplId}`);
  }
  getEventHollyday(selectedYear: string | number): Observable<IHollydayResponse[]> {
    return this.http.get<IHollydayResponse[]>(environment.Api + `api/hollyday/allHollyday?date=${selectedYear}`);
  }
  upcomingBirthday(): Observable<IEmployeeResponse[]> {
    return this.http.get<IEmployeeResponse[]>(environment.Api + `api/user/upcomingBirthday`);
  }

  // regularization
  addRegularization(regularization: IRegularization): Observable<any> {
    return this.http.post<any[]>(environment.Api + `api/regularization`, regularization);
  }
  getAllRegularization(): Observable<any> {
    return this.http.get<any[]>(environment.Api + `api/regularization`);
  }
  getByIdRegularization(id: string): Observable<any> {
    return this.http.get<any[]>(environment.Api + `api/regularization/${id}`);
  }
  updateRegularization(id: string, updatedRegularization:IRegularization): Observable<any> {
    return this.http.put<any[]>(environment.Api + `api/regularization/${id}`, updatedRegularization);
  }
  deleteRegularization(id: string): Observable<any> {
    return this.http.delete<any>(environment.Api + `api/regularization/${id}`);
  }

  // APPROVE REJECT REGULARIZATION
  approveRegularization(data: IApproveRegularizationReq): Observable<any> {
    return this.http.put<any>(environment.Api + `api/regularization/approveRegu`,data);
  }
}
