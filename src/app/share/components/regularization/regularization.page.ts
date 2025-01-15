import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatetimeCustomEvent, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { AttListItem, IRegularization } from 'src/app/employee/attendance/attendance.page';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-regularization',
  templateUrl: './regularization.page.html',
  styleUrls: ['./regularization.page.scss'],
})
export class RegularizationPage implements OnInit {
  regularizationForm!: FormGroup;
  update: boolean = false;
  regularizationData!: IRegularization;
  attendance: AttListItem | null = null;
  totalTimeString: string = "";
  openCalendar: boolean = false;
  today: Date = new Date();

  constructor(
    private _fb: FormBuilder,
    private _shareServ: ShareService,
    private _loader: LoaderService,
    private modelCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.regularizationForm = this._fb.group({
      attandanceDate: [this.attendance?.created_date, Validators.required],
      clockIn: ['', Validators.required],
      clockOut: ['', Validators.required],
      totalTime: null,
      reason: [''],      
      description: ["", Validators.required],
    });

    this.regularizationForm.get('clockIn')?.valueChanges.subscribe(() => this.calculateTotalTime());
    this.regularizationForm.get('clockOut')?.valueChanges.subscribe(() => this.calculateTotalTime());
    if(this.regularizationData){
      this.update = true;
      this.regularizationForm.patchValue(this.regularizationData);
    }
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
    return formDate != '' ? new Date(formDate) : this.attendance?.created_date;
  }
  selectDate(event: DatetimeCustomEvent){
    this.regularizationForm.controls['attandanceDate'].patchValue(moment(event.detail.value).utc().format());
  }

  submit() {
    if(this.update) {
      if(this.regularizationData.guid.trim() == '') { return }
      this._shareServ.updateRegularization(this.regularizationData.guid, this.regularizationForm.value).subscribe(res => {
        if(res) {
          this.regularizationForm.reset();
          this.update = false;
          this.modelCtrl.dismiss(res);
        }
      })
    }
    else {
      this._loader.present('');
      this._shareServ.addRegularization(this.regularizationForm.value).subscribe(
        async (res) => {
          if(res) {
            this._shareServ.presentToast(res.message , 'top', 'success')
            this._loader.dismiss();
            this.regularizationForm.reset();
            await this.modelCtrl.dismiss(res);
          } else {
            this._loader.dismiss();
          }
      }, (error) => {
        this._shareServ.presentToast(error.error.message , 'top', 'danger');
        this._loader.dismiss();
      })
    }
  }
  closeModal(): void {this.modelCtrl.dismiss();}
}
