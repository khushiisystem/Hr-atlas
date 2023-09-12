import { Injectable } from "@angular/core";
import { LoadingController } from "@ionic/angular";

@Injectable({
  providedIn: "root",
})
export class LoaderService {
  isLoading: boolean = true;

  constructor(private loaderCtrl: LoadingController) {}

  async present(className: string) {
    this.isLoading = true;

    return await this.loaderCtrl
      .create({
        spinner: "dots",
        mode: "md",
        backdropDismiss: false,
        keyboardClose: false,
        animated: true,
        showBackdrop: true,
        cssClass: className || ""
      })
      .then((res) => {
        res.present().then(() => {
          if (!this.isLoading) {
            res.dismiss();
          }
        });
      });
  }

  async dismiss() {
    this.isLoading = false;
    const modal = await this.loaderCtrl.getTop();

    return modal
      ? await this.loaderCtrl
          .dismiss()
          .then((response) => {
            console.log("", response);
          })
          .catch((err) => {
            console.log("Error occured : ", err);
          })
      : "";
  }
}
