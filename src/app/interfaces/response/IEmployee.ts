import { IEmployeeRequest } from "../request/IEmployee";
import { IGeneric } from "./IGeneric";

export interface IEmployeeResponse extends IGeneric, IEmployeeRequest {
    employeeId: string;
    effectiveWorkweekDate: string | Date;
    workWeek: string;
}