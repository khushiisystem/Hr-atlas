import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatetimeChangeEventDetail, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { IHollydayResponse } from 'src/app/interfaces/response/ILeave';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

interface DatetimeCustomEvent extends CustomEvent {
  detail: DatetimeChangeEventDetail;
  target: HTMLIonDatetimeElement;
}

@Component({
  selector: 'app-hollyday-setup',
  templateUrl: './hollyday-setup.page.html',
  styleUrls: ['./hollyday-setup.page.scss'],
})
export class HollydaySetupPage implements OnInit {
  holdayForm!: FormGroup;
  isInProcess: boolean = false;
  openCalendar1: boolean = false;
  action: string = 'add';
  eventId: string = '';
  hollyday!: IHollydayResponse | any;

  constructor(
    private shareServ: ShareService,
    private adminServ: AdminService,
    private fb: FormBuilder,
    private loader: LoaderService,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.holdayForm = this.fb.group({
      eventTitle: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(50)])],
      eventDate: ['', Validators.required]
    });

    if(this.action === 'update' && this.hollyday) {
      const data = this.hollyday as IHollydayResponse
      this.holdayForm.patchValue(data);
      this.eventId = data.guid;
    }
  }

  getValue() {
    const formValue = this.holdayForm.controls['eventDate'].value;
    return formValue ? new Date(moment(formValue).format()) : '';
  }
  setEventDate(event: DatetimeCustomEvent){
    const select = new Date(event.detail.value as string);
    select.setHours(0,0,0);
    this.holdayForm.patchValue({
      eventDate: moment(select).utc().format()
    });
    this.openCalendar1 = false;
  }

  createEvent() {
    this.adminServ.createEventHollyday(this.holdayForm.value).subscribe(res => {
      if(res) {
        this.shareServ.presentToast("Event created successfully", 'top', 'success');
        this.loader.dismiss();
        this.modalCtrl.dismiss(res, 'confirm');
      }
    }, (error) => {
      this.shareServ.presentToast(error.error.message, 'top', 'danger');
      this.isInProcess = false;
      this.loader.dismiss();
    });
  }

  updateEvent() {
    this.adminServ.updateEventHollyday(this.eventId, this.holdayForm.value).subscribe(res => {
      if(res) {
        this.shareServ.presentToast("Event created successfully", 'top', 'success');
        this.loader.dismiss();
        this.modalCtrl.dismiss(res, 'confirm');
      }
    }, (error) => {
      this.shareServ.presentToast(error.error.message, 'top', 'danger');
      this.isInProcess = false;
      this.loader.dismiss();
    });
  }

  submit(){
    if(this.holdayForm.invalid){
      return;
    } else {
      this.isInProcess = true;
      this.loader.present('');
      if(this.action === 'add') {
        this.createEvent();
      } else {
        this.updateEvent();
      }
    }
  }

  deleteEvenet(){
    this.isInProcess = true;
    this.loader.present('');
    this.adminServ.deleteEventHollyday(this.eventId).subscribe(res => {
      if(res) {
        this.shareServ.presentToast('Event Deleted Successfully', 'top', 'success');
        this.loader.dismiss();
        this.modalCtrl.dismiss('deleted', 'confirm');
      }
    }, (error) => {
      console.log(error.error.message);
      this.isInProcess = false;
      this.loader.dismiss();
    });
  }

  closeModal(){this.modalCtrl.dismiss('', 'cancel');}

}
