import { IEmployeeRequest } from "../request/IEmployee";
import { IGeneric } from "./IGeneric";

export interface IEmployeeResponse extends IGeneric, IEmployeeRequest {}