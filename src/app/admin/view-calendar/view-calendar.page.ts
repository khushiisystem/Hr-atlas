import { Component, OnInit, ViewChild } from '@angular/core';
import { DatetimeChangeEventDetail, IonModal, ModalController } from '@ionic/angular';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';
import { HollydaySetupPage } from '../hollyday-setup/hollyday-setup.page';
import { IHollydayResponse } from 'src/app/interfaces/response/ILeave';
import * as moment from 'moment';

interface DatetimeCustomEvent extends CustomEvent {
  detail: DatetimeChangeEventDetail;
  target: HTMLIonDatetimeElement;
}

@Component({
  selector: 'app-view-calendar',
  templateUrl: './view-calendar.page.html',
  styleUrls: ['./view-calendar.page.scss'],
})
export class ViewCalendarPage implements OnInit {
  @ViewChild(IonModal) modal!: IonModal;
  eventsList: IHollydayResponse[] = [];
  isDataLoaded: boolean = false;
  selectedDate: any;

  constructor(
    private shareServ: ShareService,
    private adminServ: AdminService,
    private loader: LoaderService,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.selectedDate = new Date();
    this.getCalendar();
  }


  async createHollyday(events: IHollydayResponse | any, action: 'add' | 'update') {
    const eventModal = this.modalCtrl.create({
      component: HollydaySetupPage,
      mode: 'md',
      initialBreakpoint: 1,
      componentProps: {action: action, hollyday: events}
    });

    (await eventModal).present();

    (await eventModal).onDidDismiss().then(result => {
      if(result && result.role === 'confirm'){
        this.getCalendar();
      }
    });
  }

  selectYear(event: DatetimeCustomEvent){
    console.log(event, "effectiveDate");
    this.selectedDate = new Date(event.detail.value as string);
    console.log(this.selectedDate);
    this.modal.dismiss(this.selectedDate, 'confirm');
    this.getCalendar();
  }

  getDate(dateStr: string | Date) {
    return new Date(moment(dateStr).format());
  }

  getCalendar(){
    this.loader.present('');
    this.adminServ.getEventHollyday(moment.utc(this.selectedDate).format()).subscribe(res => {
      if(res) {
        if(res.length < 1) {
          this.isDataLoaded = true;
          this.loader.dismiss();
          return;
        } else {
          this.eventsList = res;
          this.isDataLoaded = true;
          this.loader.dismiss();
        }
      }
    }, (error) => {
      this.isDataLoaded = true;
      this.loader.dismiss();
    })
  }

  goBack(){history.back();}
}
