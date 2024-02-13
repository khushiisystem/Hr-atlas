import { ILeaveRequest } from "../request/ILeaveApply";
import { IHollydayRequest, ILeaveSetupRequest } from "../request/ILeaveSetup";
import { IGeneric } from "./IGeneric";

export interface ILeaveSetupResponse extends IGeneric, ILeaveSetupRequest {}

export interface ILeaveLogsResponse extends IGeneric, ILeaveRequest {
  status: 'Pending' | 'Accept' | 'Cancel' | 'Reject';
  employeeDetails: IEmployee;
  adminId: string;
  fullDayDates: [ date: Date | string ];
  halfDayDates: [ date: Date | string ];
}

export interface ILeaveStatus extends IGeneric {
  userId: string;
  casualLeave: {
    totalLeave: number;
    createdLeave: number;
    applyLeave: number;
  };
  loseOfPay: {
    totalLeave: number;
    createdLeave: number;
    applyLeave: number;
  };
}

export interface IEmployee {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  role: string;
  imageUrl: string;
}

export interface IHollydayResponse extends IGeneric, IHollydayRequest {}
