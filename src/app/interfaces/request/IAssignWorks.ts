export interface IAssignWorkWeek {
    employeeIds: string[];
    workWeekId: string;
    workWeekDate?:Date;
}

export interface IWorkWeek {
    weekOff: string;
    title: string;
}