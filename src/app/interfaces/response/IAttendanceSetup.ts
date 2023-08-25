import { AttendanceSetupRequest } from "../request/IAttendanceSetup";
import { IGeneric } from "./IGeneric";

export interface IAttendanceSetupResponse extends IGeneric, AttendanceSetupRequest{}