import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { IState } from "../interfaces/request/IGlobalState";

@Injectable({
  providedIn: "root",
})
export class RoleStateService<T = "Admin" | "Employee" | string> implements IState<T>{
  public content = new BehaviorSubject<T>(null as any);

  constructor() {}
  
  updateState(data: T) {
    this.content.next(data);
  }

  getState() {
    return this.content.asObservable();
  }
}
