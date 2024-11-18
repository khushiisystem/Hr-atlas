import { ERegularization } from "src/app/employee/attendance/attendance.page";

export interface IApproveRegularizationReq {
    status: ERegularization;
    regulariztinGuid: string;
}