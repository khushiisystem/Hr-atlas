import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AttListItem } from 'src/app/employee/attendance/attendance.page';
import { ReadMorePageModule } from '../read-more/read-more.module';
import { RoleStateService } from 'src/app/services/roleState.service';

@Component({
  selector: 'attendance-card',
  standalone: true,
  imports:[ CommonModule, FormsModule, IonicModule, ReadMorePageModule ],
  templateUrl: './attendance-card.page.html',
  styleUrls: ['./attendance-card.page.scss'],
})
export class AttendanceCardPage implements OnInit, OnChanges {
  @Input({required: true}) attendanceData!: AttListItem;
  @Input({required: true}) cardClass: string = "";
  @Input() leaveStartDay: string = "";
  @Input() leaveEndDay: string = "";
  @Input({required: true}) isWeekOff: boolean = false;
  @Input({required: true}) isAllGood: boolean = false;
  @Input() openCard: boolean = false;
  @Output() attendanceCardAction: EventEmitter<{approve: boolean, role: "attendance" | "leave"}> = new EventEmitter();
  workDurationString: string = "";

  constructor(private rolseStateServ: RoleStateService,) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes, "changes");
    if(changes['attendanceData'] || changes['cardClass'] || changes['isAllGood']){
      this.workDurationString = this.calculateTotalWork(); 
    }
  }

  get userRole() {
    let role = ""
    this.rolseStateServ.getState().subscribe(res => {
      if(res){
        role = res.trim();
      }
    });
    return role;
  }


  calculateTotalWork(): string{
    let totalDurationMs = 0;
    this.attendanceData.attendanceData.forEach((item: {clockIn: string, clockOut: string | null}) => {
      const durationMs = this.calculateDuration(item.clockIn, item.clockOut);
      totalDurationMs += durationMs;
    });
    return this.formatDuration(totalDurationMs);
  }
  calculateDuration(clockIn: string, clockOut: string | null) {
    if (!clockOut) return 0;
    const startTime: Date = new Date(clockIn);
    const endTime: Date = new Date(clockOut);
    const durationMs: any = endTime.getTime() - startTime.getTime();
    return durationMs;
  }
  formatDuration(ms: number): string {
    return `${Math.floor((ms / (1000 * 60 * 60)) % 24)}h ${Math.floor((ms / (1000 * 60)) % 60)}m ${Math.floor((ms / 1000) % 60)}s`;
  }
  localDate(dateStr: string | Date): Date{
    return new Date(dateStr);
  }
  

  markPresent(event: Event){
    event.stopPropagation();
    event.preventDefault();
    this.attendanceCardAction.emit({role: "attendance", approve: true});
  }

}
