import { Observable } from "rxjs";

export interface IState<T> {
    getState(): Observable<T>;
    updateState(data: T, updateAction: boolean): void
}
