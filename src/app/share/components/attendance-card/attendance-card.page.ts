import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AttListItem } from 'src/app/employee/attendance/attendance.page';
import { ReadMorePageModule } from '../read-more/read-more.module';
import { RoleStateService } from 'src/app/services/roleState.service';
import { AttendaceStatus } from 'src/app/interfaces/enums/leaveCreditPeriod';

@Component({
  selector: 'attendance-card',
  standalone: true,
  imports:[ CommonModule, FormsModule, IonicModule, ReadMorePageModule ],
  templateUrl: './attendance-card.page.html',
  styleUrls: ['./attendance-card.page.scss'],
})
export class AttendanceCardPage implements OnInit, OnChanges, AfterViewInit {
  @Input({required: true}) attendanceData!: AttListItem;
  @Input({required: true}) cardClass: string = "";
  @Input() leaveStartDay: string = "";
  @Input() leaveEndDay: string = "";
  @Input({required: true}) isWeekOff: boolean = false;
  @Input({required: true}) isAllGood: boolean = false;
  openCard: boolean = true;
  @Output() attendanceCardAction: EventEmitter<{approve: boolean, role: "attendance" | "leave"}> = new EventEmitter();
  workDurationString: string = "";
  totalDurationMs: number = 0;

  constructor(private rolseStateServ: RoleStateService, private cdr: ChangeDetectorRef) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log(changes, "changes");
    if(changes['attendanceData'] || changes['cardClass'] || changes['isAllGood']){
      this.workDurationString = this.calculateTotalWork();
      this.updateStatus();
    }
  }
  ngAfterViewInit(): void {this.updateStatus();}

  get userRole() {
    let role = ""
    this.rolseStateServ.getState().subscribe(res => {
      if(res){
        role = res.trim();
      }
    });
    return role;
  }

  updateStatus(){
    const today = new Date();
    today.setHours(0,0,1);
    if(this.attendanceData.attendanceData.length > 0 && this.attendanceData.attendanceData[0].clockIn){
      const firstDataDate = new Date(this.attendanceData.attendanceData[0].clockIn);
      if(firstDataDate < today){
        this.attendanceData.status = this.totalDurationMs < (28800000/2) ? AttendaceStatus.ABSENT : this.totalDurationMs >= (28800000/2) && this.totalDurationMs < 28800000 ? AttendaceStatus.HALF_DAY : this.attendanceData.status;
      }
    }
    this.cdr.detectChanges();
  }

  calculateTotalWork(): string{
    this.totalDurationMs = 0;
    this.attendanceData.attendanceData.forEach((item: {clockIn: string, clockOut: string | null}) => {
      const durationMs = this.calculateDuration(item.clockIn, item.clockOut);
      this.totalDurationMs += durationMs;
    });
    return this.formatDuration(this.totalDurationMs);
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
