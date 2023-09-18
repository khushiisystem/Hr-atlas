export interface ISalarySetupRequest {
  employeeId: string;
  effectiveDate: string | Date;
  lastIncrementDate: string | Date;
  current_ctc: number;
  increment: number;
}
