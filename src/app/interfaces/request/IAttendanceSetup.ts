export interface AttendanceSetupRequest {
    inTime: string | Date,
    outTime: string | Date,
    gracePeriod: number,
    workDuration: string
}