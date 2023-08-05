import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClockService {
  private clockData: ClockData[] = [];

  constructor() { }

  clockIn(user: string) {
    const currentTime = new Date().getTime();
    this.clockData.push({ user, clockIn: currentTime, clockOut: null });
  }

  clockOut(user: string) {
    const currentTime = new Date().getTime();
    const userEntry = this.clockData.find(entry => entry.user === user && entry.clockOut === null);

    if (userEntry) {
      userEntry.clockOut = currentTime;
    }
  }

  getUserClockData(user: string) {
    return this.clockData.filter(entry => entry.user === user);
  }
}

interface ClockData {
  user: string;
  clockIn: number;
  clockOut: number | null;
}
