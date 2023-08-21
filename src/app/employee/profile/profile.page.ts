import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonAccordionGroup, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/core/auth.service';
import { LoaderService } from 'src/app/services/loader.service';
import { EditProfilePage } from '../edit-profile/edit-profile.page';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  @ViewChild('accordionGroup', { static: true }) accordionGroup!: IonAccordionGroup;
  employeeId: string = "";
  employeeDetail: any;
  activeTab: string = "";

  constructor(
    private router: Router,
    private authServ: AuthService,
    private loadingServ: LoaderService,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.employeeId = localStorage.getItem('userId') || "67243bhj23b45hjb";
  }

  async editProfile(){
    const profileModal = this.modalCtrl.create({
      component: EditProfilePage,
      mode: 'md',
      showBackdrop: true,
      backdropDismiss: false,
      initialBreakpoint: 1,
      componentProps: {employeeId: this.employeeId}
    });

    (await profileModal).present();

    (await profileModal).onDidDismiss().then(result => {
      console.log(result, "result");
    });
  }

  goBack() {history.back();}

  logout() {this.authServ.signOut();}
  
  openWorkPage() {
    this.router.navigate(['./workpage']);
  }
  workWeek() {
    this.router.navigate([`/employee-work-week/${this.employeeId}`]);
  }


}
