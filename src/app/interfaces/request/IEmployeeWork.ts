import { IEmplpoyeeType } from "../enums/IGenderType";

export interface IEmploeeyWorks {
    employeeId: string;
    EmployeeType: IEmplpoyeeType | string;
    status: boolean;
    joiningDate: string | Date;
    resignationDate: string | Date;
    Work_experience: number;
    workLocation: string;
    probationPeriod: number;
    designation: string;
    jobTitle: string;
    department: string;
    subDepartment: string;
    workHistory: IExperience[];
}

export interface IExperience {
    designation: string;
    jobTitle: string;
    department: string;
    from: string | Date;
    to: string | Date;
}
