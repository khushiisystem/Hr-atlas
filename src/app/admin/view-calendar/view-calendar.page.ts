import { Component, OnInit, ViewChild } from '@angular/core';
import { DatetimeChangeEventDetail, IonModal, IonPopover, ModalController } from '@ionic/angular';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';
import { HollydaySetupPage } from '../hollyday-setup/hollyday-setup.page';
import { IHollydayResponse } from 'src/app/interfaces/response/ILeave';
import * as moment from 'moment';
import { RoleStateService } from 'src/app/services/roleState.service';

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
  @ViewChild('popover') popover!: IonPopover;
  eventsList: IHollydayResponse[] = [];
  isDataLoaded: boolean = false;
  selectedDate: any;
  userRole: string = '';
  activView: string = 'listView';

  currentMonth: moment.Moment = moment();
  dates: (moment.Moment | string | null)[][] = [];
  monthsList: (string | Date)[] = [];
  selectedEvent?: IHollydayResponse | null;

  constructor(
    private shareServ: ShareService,
    private adminServ: AdminService,
    private loader: LoaderService,
    private modalCtrl: ModalController,
    private roleStateServ: RoleStateService,
  ) { 
    roleStateServ.getState().subscribe(res => {
      this.userRole = res;
    })
  }

  ngOnInit() {
    this.selectedDate = new Date();
    this.getCalendar();
    this.generateDates();
  }


  async createHollyday(events: IHollydayResponse | any, action: 'add' | 'update') {
    const eventModal = this.modalCtrl.create({
      component: HollydaySetupPage,
      mode: 'ios',
      initialBreakpoint: 0.9,
      breakpoints: [0.75, 0.85, 1],
      showBackdrop: true,
      backdropDismiss: false,
      componentProps: {action: action, hollyday: events}
    });

    (await eventModal).present();

    this.selectedEvent = null;
    (await eventModal).onDidDismiss().then(result => {
      if(result && result.role === 'confirm'){
        this.getCalendar();
      }
    });
  }
  deleteEvent(){
    if(this.selectedEvent){
      this.loader.present('');
      this.adminServ.deleteEventHollyday(this.selectedEvent.guid).subscribe(res => {
        if(res) {
          this.shareServ.presentToast('Event Deleted Successfully', 'top', 'success');
          this.selectedEvent = null;
          this.loader.dismiss();
          this.getCalendar();
        } else {
          this.shareServ.presentToast('Something went wrong', 'top', 'danger');
          this.loader.dismiss();
        }
      }, (error) => {
        console.log(error);
        this.loader.dismiss();
      });
    }
  }
  presentPopover(e: Event, event: IHollydayResponse) {
    this.popover.event = e;
    this.selectedEvent = event;
  }

  selectYear(event: DatetimeCustomEvent){
    this.selectedDate = new Date(event.detail.value as string);
    this.modal.dismiss(this.selectedDate, 'confirm');
    this.getCalendar();
  }

  getDate(dateStr: string | Date) {
    return new Date(moment(dateStr).format());
  }

  getCalendar(){
    this.loader.present('');
    this.eventsList = [];
    this.monthsList = [];
    this.adminServ.getEventHollyday(moment(this.selectedDate).utc().format()).subscribe(res => {
      if(res) {
        if(res.length < 1) {
          this.isDataLoaded = true;
          this.loader.dismiss();
          return;
        } else {
          const abcList = res;
          this.eventsList = abcList.sort((a: IHollydayResponse, b: IHollydayResponse) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
          this.eventsList.forEach((event: IHollydayResponse) => {
            const index = this.monthsList.findIndex((ev) => moment(ev).format('yyyy/MM') == moment(event.eventDate).format('yyyy/MM'));
            if(index < 0){
              this.monthsList.push(event.eventDate);
            }
          });
          this.isDataLoaded = true;
          this.loader.dismiss();
        }
      }
    }, (error) => {
      this.isDataLoaded = true;
      this.loader.dismiss();
    })
  }

  generateDates() {
    const startOfMonth = moment(this.currentMonth).startOf('month');
    const endOfMonth = moment(this.currentMonth).endOf('month');
    const currentDate = moment(startOfMonth);

    this.dates = [];

    while (currentDate.isSameOrBefore(endOfMonth)) {
      let weekIndex = currentDate.week() - startOfMonth.week() + (startOfMonth.weekday() === 0 ? 1 : 0);
      let dayIndex = currentDate.weekday();
  
      if (weekIndex < 0) {
        // If the weekIndex is negative, adjust for the previous year
        weekIndex += moment(currentDate).subtract(1, 'year').weeksInYear();
      }

      if (!this.dates[weekIndex]) {
        this.dates[weekIndex] = [];
      }

      this.dates[weekIndex][dayIndex] = moment(currentDate);
      currentDate.add(1, 'day');
    }

    // Fill empty slots with null or empty string
    this.dates = this.dates.map((week) => week.map((day) => (day ? day : '')));
  }

  incrementMonth() {
    const previousMonth = new Date(this.currentMonth.format('YYYY/MM/DD'));
    this.currentMonth.add(1, 'month');
    if(moment(previousMonth).year() !== this.currentMonth.year()){
      this.selectedDate = this.currentMonth;
      this.getCalendar();
    }
    this.generateDates();
  }

  decrementMonth() {
    const previousMonth = new Date(this.currentMonth.format('YYYY/MM/DD'));
    this.currentMonth.subtract(1, 'month');
    if(moment(previousMonth).year() !== this.currentMonth.year()){
      this.selectedDate = this.currentMonth;
      this.getCalendar();
    }
    this.generateDates();
  }

  incrementYear() {
    this.currentMonth.add(1, 'year');
    this.selectedDate = this.currentMonth;
    this.getCalendar();
    this.generateDates();
  }

  decrementYear() {
    this.currentMonth.subtract(1, 'year');
    this.selectedDate = this.currentMonth;
    this.getCalendar();
    this.generateDates();
  }

  getMomentDate(inputDate: string | moment.Moment){
    if(inputDate instanceof moment){
      return inputDate.format('D');
    } else {
      return '';
    }
  }

  isHoliday(date1: string | moment.Moment){
    if(date1 == ''){return false;}    
    const index = this.eventsList.findIndex((event: IHollydayResponse) => moment(date1).format('yyyy/MM/DD') === moment(event.eventDate).format('yyyy/MM/DD'));
    return index != -1 ? true : false;
  }

  filterByMonth(month?: string | Date): IHollydayResponse[]{
    return this.eventsList.filter((event: IHollydayResponse) => moment(month && month.toString().trim() !== '' ? month : this.currentMonth).format('yyyy/MM') === moment(event.eventDate).format('yyyy/MM'));
  }

  goBack(){history.back();}
}
