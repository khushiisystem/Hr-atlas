import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatetimeCustomEvent } from '@ionic/angular';
import * as moment from 'moment';

@Component({
  selector: 'app-pro-timeline',
  templateUrl: './pro-timeline.page.html',
  styleUrls: ['./pro-timeline.page.scss'],
})
export class ProTimelinePage implements OnInit {
  isDataLoaded:boolean = true;
  proTimelineForm!: FormGroup;
  localDate!: Date;
  openCalendar: boolean = false;
  today: Date = new Date();
  constructor(
    private _fb: FormBuilder,
  ) { }

  ngOnInit() {
    // this.proTimelineForm.setDate(this.minDate.getDate() + 2);
    this.proTimelineForm = this._fb.group({
      projectName: [''],
      title: [''],
      description: [''],
      startDate: [''],
      endDate: [''],
    });
  }

  getStartDate(){
    const formValue = this.proTimelineForm.controls['startDate'].value;
    return formValue ? new Date(moment(formValue).format()) : '';
  }

  setStartDate(event: DatetimeCustomEvent){
    this.proTimelineForm.patchValue({
      startDate: moment.utc(event.detail.value).format()
    });
  }

  getEndDate(){
    const formValue = this.proTimelineForm.controls['endDate'].value;
    return formValue ? new Date(moment(formValue).format()) : '';
  }

  setEndDate(event: DatetimeCustomEvent){
    this.proTimelineForm.patchValue({
      endDate: moment.utc(event.detail.value).format()
    });
  }
}
