import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatetimeCustomEvent, IonicModule } from '@ionic/angular';
import { AttListItem } from 'src/app/employee/attendance/attendance.page';
import { ReadMorePageModule } from '../read-more/read-more.module';
import { RoleStateService } from 'src/app/services/roleState.service';
import { AttendaceStatus } from 'src/app/interfaces/enums/leaveCreditPeriod';
import { IonModal } from '@ionic/angular/common';
import * as moment from 'moment';

@Component({
  selector: 'attendance-card',
  standalone: true,
  imports:[ CommonModule, FormsModule, IonicModule, ReadMorePageModule, ReactiveFormsModule ],
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
  @ViewChild('modal', { static: true }) modal!: IonModal;
  isModalOpen = false;
  regularization! : FormGroup;
  openCalendar: boolean = false;
  today: Date = new Date(new Date().toDateString() + ' ' + '5:00 AM');

  constructor(
    private rolseStateServ: RoleStateService, 
    private cdr: ChangeDetectorRef,
    private _fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.regularization = this._fb.group({
      attandanceDate: ['', Validators.required],
      clockIn: ['', Validators.required],
      clockOut: ['', Validators.required],
      totalHours: [''],
      reason: [''],      
      description: ['', Validators.required],
      // status: ['']
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
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
        const isSaturday = firstDataDate.getDay() === 6;
        if (isSaturday && this.totalDurationMs >= 14400000) {
          this.attendanceData.status = AttendaceStatus.PRESENT;
        } else {
          this.attendanceData.status = this.totalDurationMs < (28800000/2) ? AttendaceStatus.ABSENT : this.totalDurationMs >= (28800000/2) && this.totalDurationMs < 28800000 ? AttendaceStatus.HALF_DAY : this.attendanceData.status;
        }
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


  openModal() {
    if (!this.isModalOpen) {
      this.modal.present();
      this.isModalOpen = true;
    }
  }

  closeModal() {
    this.modal.dismiss();
    this.isModalOpen = false;
  }

  markTouched(ctrlName: string) {
    this.regularization.controls[ctrlName].markAsTouched();
  }

  getStartTime(){
    const formValue = this.regularization.controls['clockIn'].value;
    return formValue ? new Date(moment(formValue).format()) : '';
  }
  setStartTime(event: DatetimeCustomEvent) {
    this.regularization.patchValue({
      clockIn: moment(event.detail.value).utc().format()
    });
  }

  getEndTime(){
    const formValue = this.regularization.controls['clockOut'].value;
    return formValue ? new Date(moment(formValue).format()) : '';
  }
  setEndTime(event: DatetimeCustomEvent) {
    this.regularization.patchValue({
      clockOut: moment(event.detail.value).utc().format()
    });
  }

  getDate(ctrlName: string){
    const formDate = this.regularization.controls[ctrlName].value;
    return formDate != '' ? new Date(formDate) : "";
  }
  selectDate(event: DatetimeCustomEvent){
    this.regularization.controls['attandanceDate'].patchValue(moment(event.detail.value).utc().format());
  }

  submit() {
    if(this.regularization) {
      // console.log("regularization: ",this.regularization.value);
    }
  }

}
