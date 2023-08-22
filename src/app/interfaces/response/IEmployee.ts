import { IEmployeeRequest } from "../request/IEmployee";

export interface IEmployeeResponse extends IEmployeeRequest {
    guid: string;
}