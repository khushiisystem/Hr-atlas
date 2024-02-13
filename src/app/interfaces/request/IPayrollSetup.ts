import { IGeneric } from "../response/IGeneric";
export interface ICreditLogsRequest {
    employeeId: string,
    bonus: number,
    compOff: number,
    advanceAmount: number,
    description: string,
    deductionAmount: number,
    otherDeduction: number,
    payslipDate: string | Date,
}

export interface ICreditLogsResponse extends IGeneric, ICreditLogsRequest {
    remainingAmount: number,
}