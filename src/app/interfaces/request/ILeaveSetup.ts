import { LeaveCreditCycle } from "../enums/leaveCreditCycle";
import { LeaveCreditPeriod } from "../enums/leaveCreditPeriod";

export interface ILeaveSetupRequest {
    creditCycle: LeaveCreditCycle,
    creditPeriod: LeaveCreditPeriod,
    annualLeave: number,
    creditLeave: number,
    reserveDays: number,
}

export interface IHollydayRequest {
    eventTitle: string,
    eventDate: string | Date,
}