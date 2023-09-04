import { IRoles } from "../enums/IRoles";
import { AttendaceStatus } from "../enums/leaveCreditPeriod";
import { AttendanceSetupRequest } from "../request/IAttendanceSetup";
import { IGeneric } from "./IGeneric";

export interface IAttendanceSetupResponse
  extends IGeneric,
    AttendanceSetupRequest {}

export interface IClockInResponce extends IGeneric, AttendanceSetupRequest {
  clockIn: string | Date;
  clockOut: string | Date;
  employeeId: string;
  status: AttendaceStatus;
  EmployeeDetails: IEmpDetail;
  workingTime: string;
}

export interface IEmpDetail {
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    role: IRoles;
}

export interface ILeaveStatus {
    employeeId: string,
    employeeDetails: IEmpDetail,
    lossOfPay: {
        totalLeaves: number,
        creditedLeaves: number,
        appliedLeaves: number
    }
    casualLeaves: {
        totalLeaves: number,
        creditedLeaves: number,
        appliedLeaves: number
    }
}