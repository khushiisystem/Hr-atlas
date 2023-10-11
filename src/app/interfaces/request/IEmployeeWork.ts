import { IEmplpoyeeType } from "../enums/IGenderType";

export interface IEmployeeWorkRequest {
    employeeId: string;
    employeeType: IEmplpoyeeType | string;
    status: string;
    joiningDate: string | Date;
    resignationDate: string | Date;
    work_experience: number;
    workLocation: string;
    probationPeriod: number;
    designation: string;
    jobTitle: string;
    department: string;
    subDepartment: string;
    workHistory: IExperience[];
    // salaryInformation: ISalary;
}

export interface IExperience {
    employeeType: IEmplpoyeeType | string;
    work_experience: number;
    designation: string;
    jobTitle: string;
    department: string;
    from: string | Date;
    to: string | Date;
}

export interface ISalary {
    ctc: number;
    salary: number;
    effectiveDate: Date;
}