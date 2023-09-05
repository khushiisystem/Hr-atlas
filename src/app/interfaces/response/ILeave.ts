import { ILeaveApplyrequest } from "../request/ILeaveApply";
import { ILeaveSetupRequest } from "../request/ILeaveSetup";
import { IGeneric } from "./IGeneric";

export interface ILeaveSetupResponse extends IGeneric, ILeaveSetupRequest {}

export interface ILeaveLogsResponse extends IGeneric, ILeaveApplyrequest {
    status: string;
}