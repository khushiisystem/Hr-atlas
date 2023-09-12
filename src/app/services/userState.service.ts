import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { IState } from "../interfaces/request/IGlobalState";
import { IEmployeeResponse } from "../interfaces/response/IEmployee";

@Injectable({
  providedIn: "root",
})
export class UserStateService<T = IEmployeeResponse | any> implements IState<T>{
  public content = new BehaviorSubject<T>(null as any);

  constructor() {}
  
  updateState(data: T) {
    this.content.next(data);
  }

  getState() {
    return this.content.asObservable();
  }
}
