import { LeaveCreditCycle } from "../enums/leaveCreditCycle";
import { LeaveCreditPeriod } from "../enums/leaveCreditPeriod";

export interface LeaveSetupRequest {
    creditCycle: LeaveCreditCycle
    creditPeriod: LeaveCreditPeriod,
    annualLeave: number,
    creditLeave: number
}