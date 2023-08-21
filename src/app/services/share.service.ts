import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ToastController } from "@ionic/angular";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { IPayrollSetupRequest } from "../interfaces/request/IPayrollSetup";
import { IOTPRequest, IResetPasswordRequest } from "../interfaces/request/IOtpRequest";

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
      duration: 2500,
      position: position,
      color: color
    });

    await toast.present();
  }


  // APIs for employee
  getAllEmployee(pageIndex: number, pageSize: number): Observable<any>{
    return this.http.get<any>(environment.Api + `api/employee?skip=${pageIndex}&limit=${pageSize}`);
  }
  getEmployeeById(empId: string): Observable<any>{
    return this.http.get<any>(environment.Api + `api/user/${empId}`);
  }
  updateEmployeeById(empId: string, empData: any): Observable<any>{
    return this.http.put<any>(environment.Api + `api/employee/${empId}`, empData);
  }

  // payroll APIs
  getEmployeePayroll(empId: string, session: string | Date): Observable<any>{
    return this.http.get<any>(environment.Api + `api/payroll/employee/${empId}?session=${session}`);
  }
  setEmployeePayroll(empId: string, session: string | Date, payrollData: IPayrollSetupRequest): Observable<any>{
    return this.http.post<any>(environment.Api + `api/payroll/employee/${empId}?session=${session}`, payrollData);
  }

  // sharable APIs
  getOTP(data: IOTPRequest): Observable<any> {
    return this.http.post<any>(environment.Api + `api/user/sendOtp`, data);
  }
  verifyOTP(data: {otp: string}): Observable<any> {
    return this.http.post<any>(environment.Api + `api/verifyOTP/`, data);
  }
  resetPassword(data: IResetPasswordRequest): Observable<any> {
    return this.http.post<any>(environment.Api + `api/resetPassword`, data);
  }
  changePassword(data: any): Observable<any> {
    return this.http.post<any>(environment.Api + `api/changePassword`, data);
  }
}
