import { IGeneric } from "./IGeneric";

export interface IPayslipResponse extends IGeneric {
  employeeId: string;
  lop: number;
  netPay: number;
  totalEarning: number;
  netPayableDays: number;
  basicSalary: number;
  workingDays: number;
  employeeName: string;
  totalLeaves: number;
  leavesCarryForward: number;
  bonus: number;
  advanceSalary: number;
  deductionAmount: number;
  payslipDate: Date | string;
  designation: string;
  otherDeduction: number;
  totalDeduction: number;
  incomeTax: number;
  compOff: number;
  netPayInWords: string;
  monthSalary: number;
  bankName?: string;
  accountNo?: string;
  relocationAllowance?: number;
  allowances?: number;
  reimbursement?: number;
  travelAllowance?: number;
}
