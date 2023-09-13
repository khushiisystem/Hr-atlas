import { Component, QueryList, ViewChildren } from "@angular/core";
import {
  AlertController,
  IonRouterOutlet,
  ModalController,
  Platform,
} from "@ionic/angular";
import { ShareService } from "./services/share.service";
import { App } from "@capacitor/app";
import { Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
  @ViewChildren(IonRouterOutlet) routerOutlets!: QueryList<IonRouterOutlet>;
  lastTimeBackPress: number = 0;
  timePeriodToExit: number = 2000;

  constructor(
    private platform: Platform,
    private shareServ: ShareService,
    private alertController: AlertController,
    private modalCtrl: ModalController,
    private router: Router
  ) {
    this.backButtonEvent();
    this.platform.backButton.subscribeWithPriority(5, () => {
      console.log("Another handler was called!");
      shareServ.presentToast("Another handler was called!", "top", "dark");
    });
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      message: "Are you sure you want to exit the app?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => {},
        },
        {
          text: "Close App",
          handler: () => {
            App.exitApp();
          },
        },
      ],
    });

    await alert.present();
  }

  backButtonEvent() {
    this.platform.backButton.subscribeWithPriority(100, async () => {
      const modal = this.modalCtrl.getTop();
      this.routerOutlets.forEach(async (outlet: IonRouterOutlet) => {
        if (this.router.url != "/tabs/home" && this.router.url != "/login") {
          if (await modal) {
            console.log("model opened");
            this.modalCtrl.dismiss();
          } else {
            history.back();
          }
        } else if (
          this.router.url === "/tabs/home" ||
          this.router.url === "/login"
        ) {
          if (
            new Date().getTime() - this.lastTimeBackPress >=
            this.timePeriodToExit
          ) {
            this.lastTimeBackPress = new Date().getTime();
            this.presentAlertConfirm();
          } else {
            App.exitApp();
          }
        }
      });
    });
  }
}
