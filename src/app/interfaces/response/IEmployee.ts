import { IEmployeeRequest } from "../request/IEmployee";
import { IEmployeeWorkRequest } from "../request/IEmployeeWork";
import { IGeneric } from "./IGeneric";

export interface IEmployeeResponse extends IGeneric, IEmployeeRequest {
    employeeId: string;
    effectiveWorkweekDate: string | Date;
    workWeek: string;
}

export interface IEmployeeWrokResponse extends IGeneric, IEmployeeWorkRequest {}