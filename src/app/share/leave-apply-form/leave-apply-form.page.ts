import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatetimeCustomEvent, Platform } from '@ionic/angular';
import * as moment from 'moment';
import { ILeaveApplyrequest } from 'src/app/interfaces/request/ILeaveApply';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-leave-apply-form',
  templateUrl: './leave-apply-form.page.html',
  styleUrls: ['./leave-apply-form.page.scss'],
})
export class LeaveApplyFormPage implements OnInit {
  @Input() leaveType: string = "";
  @Output() saveForm: EventEmitter<ILeaveApplyrequest> = new EventEmitter<ILeaveApplyrequest>();
  leaveApplyForm!: FormGroup;
  selectedCtrl: string = '';
  openCalendar: boolean = false;
  minDate: Date = new Date();
  maxDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private platform: Platform,
    private shareServ: ShareService
  ) {
    this.platform.backButton.subscribeWithPriority(5, () => {
      console.log('Another handler was called!');
      shareServ.presentToast('Another handler was called!', 'top', 'dark');
    });
  }

  

  ngOnInit() {
    this.minDate.setDate(this.minDate.getDate() + 2);
    this.maxDate = this.minDate;
    this.leaveApplyForm = this.fb.group({
      startDate: ['', Validators.required],
      purpose: ['', Validators.required],
      leaveType: [this.leaveType, Validators.required],
      dayType: ['', Validators.required],
      endDate: [''],
    });
  }

  getDate(ctrlName: string){
    const formDate = this.leaveApplyForm.controls[ctrlName].value;
    return formDate != '' ? new Date(formDate) : "";
  }

  selectDate(event: DatetimeCustomEvent){
    this.leaveApplyForm.patchValue({
      startDate: new Date(event.detail.value as string).toISOString()
    });
    if(this.leaveApplyForm.controls['endDate'].value){
      const startDate = new Date(event.detail.value as string);
      const endDate = new Date(this.leaveApplyForm.controls['endDate'].value);
      if(startDate > endDate){
        this.leaveApplyForm.patchValue({endDate: ''});
      }
    }
    this.maxDate = new Date(event.detail.value as string);
    
    console.log(this.leaveApplyForm.value);
  }

  selectEndDate(event: DatetimeCustomEvent){
    this.leaveApplyForm.patchValue({
      endDate: new Date(event.detail.value as string).toISOString()
    });
  }

  submitForm(){
    if(this.leaveApplyForm.valid){
      if(this.leaveApplyForm.controls['dayType'].value === 'Half Day'){
        this.leaveApplyForm.patchValue({
          endDate: this.leaveApplyForm.controls['startDate'].value
        });
      }
      this.saveForm.emit(this.leaveApplyForm.value);
    }
  }
}