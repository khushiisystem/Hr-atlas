import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatetimeCustomEvent, Platform } from '@ionic/angular';
import * as moment from 'moment';
import { ILeaveRequest } from 'src/app/interfaces/request/ILeaveApply';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-leave-apply-form',
  templateUrl: './leave-apply-form.page.html',
  styleUrls: ['./leave-apply-form.page.scss'],
})
export class LeaveApplyFormPage implements OnInit {
  @Input() leaveType: string = "";
  @Output() saveForm: EventEmitter<string> = new EventEmitter<string>();
  leaveApplyForm!: FormGroup;
  selectedCtrl: string = '';
  openCalendar: boolean = false;
  minDate: Date = new Date();
  maxDate: Date = new Date();
  minEndDate: any;
  leaveStartForm!: FormGroup;
  leaveEndForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private platform: Platform,
    private shareServ: ShareService,
    private loader: LoaderService,
  ) {
    this.platform.backButton.subscribeWithPriority(5, () => {
      shareServ.presentToast('Another handler was called!', 'top', 'dark');
    });
  }

  

  ngOnInit() {
    this.minDate.setDate(this.minDate.getDate() + 2);
    this.maxDate = this.minDate;
    this.leaveApplyForm = this.fb.group({
      from: this.fb.group({
        date: ['', Validators.required],
        dayType: ['', Validators.required],
      }),
      to: this.fb.group({
        date: [''],
        dayType: [''],
      }),
      purpose: ['', Validators.required],
      leaveType: [this.leaveType, Validators.required],
    });
    // (this.leaveApplyForm.get('from') as FormGroup).controls['dayType']?.disable();
    (this.leaveApplyForm.get('to') as FormGroup).controls['dayType']?.disable();
  }

  get getEndDate() {
    return (this.leaveApplyForm.controls['to'] as FormGroup).controls['date'].value;
  }

  getFormGroup(ctrlName: string): FormGroup{
    return (this.leaveApplyForm.controls[ctrlName] as FormGroup);
  }

  getDate(ctrlName: string){
    if(ctrlName === 'endDate'){
      const formDate = (this.leaveApplyForm.controls['to'] as FormGroup).controls['date'].value;
      return formDate != '' ? new Date(formDate) : "";
    } else {
      const formDate = (this.leaveApplyForm.controls['from'] as FormGroup).controls['date'].value;
      return formDate != '' ? new Date(formDate) : "";
    }
  }

  selectDate(event: DatetimeCustomEvent){
    (this.leaveApplyForm.controls['from'] as FormGroup).patchValue({
      date: moment(event.detail.value).utc().format(),
    });
    this.minEndDate = new Date(moment(event.detail.value).add(1, "day").format()).toISOString();
    if(this.getEndDate){
      const lastLeaveDate = new Date(this.getEndDate);
      const startDate = new Date(event.detail.value as string);
      
      if(startDate > lastLeaveDate){
        (this.leaveApplyForm.controls['to'] as FormGroup).patchValue({date: '', dayType: ''});
        (this.leaveApplyForm.get('to') as FormGroup).controls['dayType']?.disable();
      }
    }
    // (this.leaveApplyForm.get('from') as FormGroup).controls['dayType']?.enable();
  }

  selectEndDate(event: DatetimeCustomEvent){
    (this.leaveApplyForm.controls['to'] as FormGroup).patchValue({
      date: moment(event.detail.value as string).utc().format()
    });
    (this.leaveApplyForm.get('to') as FormGroup).controls['dayType']?.enable();
  }

  submitForm(){
    if(this.leaveApplyForm.valid){
      let reqData: ILeaveRequest = this.leaveApplyForm.value;
      const endDate = (this.leaveApplyForm.get('to') as FormGroup).controls['date'].value;
      if(endDate.toString().trim() === ""){
        reqData.to.date = null;
      }

      this.loader.present('');
      this.shareServ.leaveApply(this.leaveApplyForm.value).subscribe(res => {
        if(res){
          this.shareServ.presentToast(res.isUnplanned ? "you are appling late" : "leave applied successfully", 'top', res.isUnplanned ? "warning" : "success");
          this.loader.dismiss();
          this.saveForm.emit("success");
        }
      }, (error) => {
        this.shareServ.presentToast(error.error.message || 'Something went wrong', 'top', 'danger');
        this.loader.dismiss();
      });
    }
  }
}