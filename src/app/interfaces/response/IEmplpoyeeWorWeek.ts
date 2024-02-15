import { IRoles } from "../enums/IRoles";
import { IGeneric } from "./IGeneric";

export interface IEmplpoyeeWorWeek extends IGeneric {
  employeeId: string;
  workWeekId: string;
  employeeDetails: {
    firstName: string;
    lastName: string;
    employeeId: string;
    role: IRoles;
  };
  workweekDetails: {
    weekOff: string[];
    title: string;
  };
}
