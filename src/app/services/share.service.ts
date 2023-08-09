import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ToastController } from "@ionic/angular";

@Injectable({
  providedIn: "root",
})
export class ShareService {
    constructor(
        private toastController: ToastController,
        private http: HttpClient,
    ){}

  async presentToast(message: string, position: "top" | "middle" | "bottom", color: "primary" | "dark" | "secondary" | "tertiary" | "success" | "warning" | "danger" | "medium") {
    const toast = await this.toastController.create({
      message: message,
      duration: 2500,
      position: position,
      color: color
    });

    await toast.present();
  }
}
