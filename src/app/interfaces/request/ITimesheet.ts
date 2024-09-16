import { ETimesheet } from "src/app/employee/time-sheet/time-sheet.page";

export interface ApproveTimesheetReq {
    status: ETimesheet;
    timesheetGuid: string;
}