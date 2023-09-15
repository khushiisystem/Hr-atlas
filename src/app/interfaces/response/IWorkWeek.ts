import { IRoles } from "../enums/IRoles";
import { IWorkWeek } from "../request/IAssignWorks";
import { IGeneric } from "./IGeneric";

export interface IWorkWeekResponse extends IGeneric, IWorkWeek {
  employees?: string[];
  employeeDetails: [
    {
      firstName: string;
      lastName: string;
      employeeId: number | string;
      role: IRoles.EMPLOYEE;
    }
  ];
}
