import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DatetimeCustomEvent, IonContent, IonicModule, ModalController } from '@ionic/angular';
import { AttListItem, ERegularization, IRegularization } from 'src/app/employee/attendance/attendance.page';
import { ReadMorePageModule } from '../read-more/read-more.module';
import { RoleStateService } from 'src/app/services/roleState.service';
import { AttendaceStatus } from 'src/app/interfaces/enums/leaveCreditPeriod';
import { IonModal } from '@ionic/angular/common';
import * as moment from 'moment';
import { ShareService } from 'src/app/services/share.service';
import { LoaderService } from 'src/app/services/loader.service';
import { IApproveRegularizationReq } from 'src/app/interfaces/request/IApproveRegularization';
import { RegularizationPage } from '../regularization/regularization.page';

@Component({
  selector: 'attendance-card',
  standalone: true,
  imports:[ CommonModule, FormsModule, IonicModule, ReadMorePageModule, ReactiveFormsModule ],
  templateUrl: './attendance-card.page.html',
  styleUrls: ['./attendance-card.page.scss'],
})
export class AttendanceCardPage implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(IonContent) content!: IonContent;
  @Input({required: true}) attendanceData!: AttListItem;
  @Input({required: true}) cardClass: string = "";
  @Input() leaveStartDay: string = "";
  @Input() leaveEndDay: string = "";
  @Input({required: true}) isWeekOff: boolean = false;
  @Input({required: true}) isAllGood: boolean = false;
  @Input() regularization: IRegularization | null = null;
  openCard: boolean = true;
  regCard: boolean = true;
  @Output() attendanceCardAction: EventEmitter<{approve: boolean, role: "attendance" | "leave"}> = new EventEmitter();
  workDurationString: string = "";
  totalDurationMs: number = 0;
  @ViewChild('modal', { static: true }) modal!: IonModal;
  @ViewChild('modal', { static: true }) modal2!: ElementRef;
  isModalOpen = false;
  regularizationForm! : FormGroup;
  openCalendar: boolean = false;
  today: Date = new Date(new Date().toDateString() + ' ' + '5:00 AM');
  totalTimeString: string = ""; 
  regularizationId: string = "";
  update: boolean = false;
  @Output() regularizationUpdated: EventEmitter<void> = new EventEmitter<void>();



  constructor(
    private rolseStateServ: RoleStateService, 
    private cdr: ChangeDetectorRef,
    private _fb: FormBuilder,
    private _shareServ: ShareService,
    private _loader: LoaderService,
    private modelCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.regularizationForm = this._fb.group({
      attandanceDate: [this.attendanceData.created_date, Validators.required],
      clockIn: ['', Validators.required],
      clockOut: ['', Validators.required],
      totalTime: null,
      reason: [''],      
      description: ["", Validators.required],
    });

    this.regularizationForm.get('clockIn')?.valueChanges.subscribe(() => this.calculateTotalTime());
    this.regularizationForm.get('clockOut')?.valueChanges.subscribe(() => this.calculateTotalTime());
  }
  

  calculateTotalTime() {
    const clockIn = this.regularizationForm.controls['clockIn'].value;
    const clockOut = this.regularizationForm.controls['clockOut'].value;
    
    if (clockIn && clockOut) {
      const durationMs = this.calculateDuration(clockIn, clockOut);
      this.totalTimeString = this.formatDurationReg(durationMs); // Update total time string for display
      this.regularizationForm.patchValue({ totalTime: this.totalTimeString });
    } else {
      this.totalTimeString = ""; // Clear if either clockIn or clockOut is missing
      this.regularizationForm.patchValue({ totalTime: "" })
    }
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

  formatDurationReg(ms: number): string {
    return `${Math.floor((ms / (1000 * 60 * 60)) % 24)}h ${Math.floor((ms / (1000 * 60)) % 60)}m`;
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

  // openModal() {
  //   console.log('Attempting to open modal');
  //   if (!this.isModalOpen) {
  //     console.log('Opening modal...');
  //     this.modal.present().then(() => {
  //       console.log('Modal opened');
  //     }).catch((err) => {
  //       console.error('Error opening modal:', err);
  //     });
  //     this.isModalOpen = true;
  //   } else {
  //     console.warn('Modal already open or reference not found');
  //   }
  // }
  

  closeModal() {
    this.modal.dismiss();
    this.isModalOpen = false;
  }

  markTouched(ctrlName: string) {
    this.regularizationForm.controls[ctrlName].markAsTouched();
  }

  getStartTime(){
    const formValue = this.regularizationForm.controls['clockIn'].value;
    return formValue ? new Date(moment(formValue).format()) : '';
  }
  setStartTime(event: DatetimeCustomEvent) {
    this.regularizationForm.patchValue({
      clockIn: moment(event.detail.value).utc().format()
    });
  }

  getEndTime(){
    const formValue = this.regularizationForm.controls['clockOut'].value;
    return formValue ? new Date(moment(formValue).format()) : '';
  }
  setEndTime(event: DatetimeCustomEvent) {
    this.regularizationForm.patchValue({
      clockOut: moment(event.detail.value).utc().format()
    });
  }

  getDate(ctrlName: string){
    const formDate = this.regularizationForm.controls[ctrlName].value;
    return formDate != '' ? new Date(formDate) : this.attendanceData.created_date;
  }
  selectDate(event: DatetimeCustomEvent){
    this.regularizationForm.controls['attandanceDate'].patchValue(moment(event.detail.value).utc().format());
  }

  // addRegularization() {
  //   this._loader.present('');
  //   this._shareServ.addRegularization(this.regularizationForm.value).subscribe(
  //     (res) => {
  //       if(res) {
  //         console.log("res_mes: ", res.message);
  //         this._shareServ.presentToast(res.message , 'top', 'success')
  //         this._loader.dismiss();
  //         this.regularizationForm.reset();
  //         this.closeModal();
  //       } else {
  //         this._loader.dismiss();
  //       }
  //   }, (error) => {
  //     this._shareServ.presentToast(error.error.message , 'top', 'danger');
  //     this._loader.dismiss();
  //   })
  // }

  approveReject(status: string , guid: string) {
    const data: IApproveRegularizationReq = {
      status: status === 'accept' ? ERegularization.ACCEPT : ERegularization.REJECT,
      regulariztinGuid : guid
    } 
    this._shareServ.approveRegularization(data).subscribe(res => {
      if(res) {
        console.log("res_accept: ", res);
        this.regularization
      }
    })
  }

  // async triggerModal(regularizationData: IRegularization | null = null) {
  //   const abcModal = await this.modelCtrl.create({
  //     component: RegularizationPage,
  //     mode: 'md',
  //     componentProps: {
  //       regularizationData,
  //       attendance: this.attendanceData
  //     }
  //   });
  //   await abcModal.present();
  //   await abcModal.onDidDismiss().then((value) => {
  //     console.log(value);
  //   })
  // }

  submit() {
    if(this.update) {
      if(this.regularizationId.trim() == '') { return }
      this._shareServ.updateRegularization(this.regularizationId, this.regularizationForm.value).subscribe(res => {
        if(res) {
          console.log("res: ", res);
          this.regularizationForm.reset();
          this.update = false;
          this.closeModal();
          this.regularization
          this.regularizationUpdated.emit();
          this.modal.dismiss(res);
          this.regularizationForm.patchValue({ attendanceData: this.attendanceData.created_date })
        }
      })
    }
    else {
      this._loader.present('');
      this._shareServ.addRegularization(this.regularizationForm.value).subscribe(
        async (res) => {
          if(res) {
            console.log("res_mes: ", res.message);
            this._shareServ.presentToast(res.message , 'top', 'success')
            this._loader.dismiss();
            this.regularizationForm.reset();
            this.closeModal();  
            this.regularizationUpdated.emit();          
            await this.modal.dismiss(res);
            // await this.modal.onDidDismiss().then(value => {
            //   console.log(value);
            // });
            this.regularizationForm.patchValue({ attendanceData: this.attendanceData.created_date })
          } else {
            this._loader.dismiss();
          }
      }, (error) => {
        this._shareServ.presentToast(error.error.message , 'top', 'danger');
        this._loader.dismiss();
      })
    }
  }

  updateRegularization(regul: IRegularization) {
    this.regularizationForm.patchValue(regul);
    this.regularizationId = this.regularization!.guid;
    console.log("id: ", this.regularizationId);

    this.update = true;
    if(this.content){   
      this.content.scrollToTop(100);
    }
  }

  handleModalAction(regul: IRegularization) {
    console.log('Button clicked with regularization:', regul);
    console.log(this.isModalOpen, "isModelOpen");
    this.openModal();
  
    if (regul) {
      console.log('Patching form with data:', regul);
      this.updateRegularization(regul);
    }
  }
  
  getStatusClass(status: string): string {
    return status  === 'Pending' ? 'status-pending' : 
        status === 'Accept' ? 'status-accept' : 
        status === 'Reject' ? 'status-reject' : '';
  }
  
}
