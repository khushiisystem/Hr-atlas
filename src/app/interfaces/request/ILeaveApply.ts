import { LeaveDayType, LeaveType } from "../enums/leaveCreditPeriod";

export interface ILeaveRequest {
    isUnplanned:boolean,
    from: {
        date: string | Date,
        dayType: LeaveDayType,
    },
    to: {
        date: string | Date | null,
        dayType: LeaveDayType | string,
    },
    purpose: string,
    leaveType: LeaveType,
    // old data ------
    startDate: string | Date,
    dayType: LeaveDayType,
    endDate?: string | Date
}