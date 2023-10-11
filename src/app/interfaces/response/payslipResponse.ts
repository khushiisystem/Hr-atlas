import { IGeneric } from "./IGeneric";

export interface IPayslipResponse extends IGeneric {
  employeeId: string;
  lop: number;
  netPay: number;
  basicSalary: number;
  workingDays: number;
  employeeName: string;
  totalLeaves: number;
  leavesCarryForward: number;
  bonus: number;
  advanceSalary: number;
  deductionAmount: number;
  payslipDate: Date | string;
}
