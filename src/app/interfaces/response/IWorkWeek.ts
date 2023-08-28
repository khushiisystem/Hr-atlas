import { IWorkWeek } from "../request/IAssignWorks";
import { IGeneric } from "./IGeneric";

export interface IWorkWeekResponse extends IGeneric, IWorkWeek {
    employees?: string[];
}