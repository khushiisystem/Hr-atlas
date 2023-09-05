import { LeaveCreditCycle } from "../enums/leaveCreditCycle";
import { LeaveCreditPeriod } from "../enums/leaveCreditPeriod";

export interface ILeaveSetupRequest {
    creditCycle: LeaveCreditCycle
    creditPeriod: LeaveCreditPeriod,
    annualLeave: number,
    creditLeave: number
}