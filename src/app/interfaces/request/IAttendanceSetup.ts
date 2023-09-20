export interface AttendanceSetupRequest {
  inTime: string | Date;
  outTime: string | Date;
  gracePeriod: number;
  workDuration: string;
}

export interface udpateAttendanceRequst {
  status: string;
  clockIn?: string | Date;
  clockOut?: string | Date;
  employeeId: string;
  guid: string;
}
