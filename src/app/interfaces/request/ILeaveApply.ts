import { LeaveDayType, LeaveType } from "../enums/leaveCreditPeriod";

export interface ILeaveApplyrequest {
    startDate: string | Date,
    purpose: string,
    leaveType: LeaveType,
    dayType: LeaveDayType,
    endDate?: string | Date
}