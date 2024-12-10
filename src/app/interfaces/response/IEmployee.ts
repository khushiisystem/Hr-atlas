import { IEmployeeRequest } from "../request/IEmployee";
import { IEmployeeWorkRequest } from "../request/IEmployeeWork";
import { IGeneric } from "./IGeneric";

export interface IEmployeeResponse extends IGeneric, IEmployeeRequest {
    employeeId: string;
    effectiveWorkweekDate: string | Date;
    workWeek: string;
    // employeeWorkDetails: {
    //     employeeType: string,
    //     status: string,
    //     joiningDate: string | Date,
    //     resignationDate: string | Date,
    //     workLocation: string,
    //     designation: string,
    //     jobTitle: string,
    //     department: string,
    //     subDepartment: string
    // } 
}

export interface IEmployeeWrokResponse extends IGeneric, IEmployeeWorkRequest {}