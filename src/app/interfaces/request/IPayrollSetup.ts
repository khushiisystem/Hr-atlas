export interface IPayrollSetupRequest {
    employeeId: string,
    ctc: number,
    hra: number,
    basics: number,
    lop: number,
    salary: number,
    totalSalary: number,
    currency: string,
    comment: string,
    payslipDate: string | Date,
}