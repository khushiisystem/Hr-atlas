import { Component, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { DatetimeChangeEventDetail, ModalController } from "@ionic/angular";
import * as moment from "moment";
import { IEmployeeResponse } from "src/app/interfaces/response/IEmployee";
import { AdminService } from "src/app/services/admin.service";
import { LoaderService } from "src/app/services/loader.service";
import { ShareService } from "src/app/services/share.service";

interface DatetimeCustomEvent extends CustomEvent {
  detail: DatetimeChangeEventDetail;
  target: HTMLIonDatetimeElement;
}

@Component({
  selector: "app-edit-profile",
  templateUrl: "./edit-profile.page.html",
  styleUrls: ["./edit-profile.page.scss"],
})
export class EditProfilePage implements OnInit {
  employeeForm!: FormGroup;
  employeeDetail!: IEmployeeResponse;
  openCalendar: boolean = false;
  today: Date = new Date();
  userId: string = "";
  // imgUrl: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  imgUrl: string = "";
  expandedCard: string[] = [
    "personal_card",
    "contact_card",
    "address_card",
    "social_card",
  ];

  constructor(
    private fb: FormBuilder,
    private adminServ: AdminService,
    private shareServ: ShareService,
    private modalCtrl: ModalController,
    private loader: LoaderService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    this.today = new Date();
    this.userId = this.activeRoute.snapshot.params?.["employeeId"];

    this.employeeForm = this.fb.group({
      firstName: [
        "",
        Validators.compose([
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-z\s'-]+$/), // Letters, spaces, apostrophes, and hyphens
        ]),
      ],
      lastName: [
        "",
        Validators.compose([
          Validators.required,
          Validators.maxLength(50),
          Validators.pattern(/^[A-Za-z\s'-]+$/), // Letters, spaces, apostrophes, and hyphens
        ]),
      ],
      email: [
        "",
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ), // Standard email pattern
        ]),
      ],
      officialEmail: [
        "",
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ), // Standard email pattern
        ]),
      ],
      mobileNumber: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern("^[6-9][0-9]{9}$"),
          Validators.maxLength(10),
        ]),
      ],

      alternateMobileNumber: [
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern("^[6-9][0-9]{9}$"),
          Validators.maxLength(10),
        ]),
      ],
      dateOfBirth: ["", Validators.required],
      gender: ["Male", Validators.required],
      bloodGroup: ["Group A"],
      maritalStatus: ["", Validators.required],
      imageUrl: [""],
      guid: [""],
      accountInfo: this.fb.group({
        bankName: [
          "",
          Validators.compose([
            Validators.required,
            Validators.pattern(/^[a-zA-Z\s.'-]{2,}$/), // Valid characters, min 2
          ]),
        ],
        accountHolderName: [
          "",
          Validators.compose([
            Validators.required,
            Validators.pattern(/^[a-zA-Z\s.'-]{2,}$/),
          ]),
        ],
        accountNumber: [
          "",
          Validators.compose([
            Validators.required,
            Validators.pattern(/^\d{9,18}$/), // 9 to 18 digits
          ]),
        ],
        ifscCode: [
          "",
          Validators.compose([
            Validators.required,
            Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/), // Valid IFSC format
          ]),
        ],
      }),
      currentAddress: this.fb.group({
        addressLine1: ["", Validators.compose([Validators.required])],
        addressLine2: [""],
        city: ["", Validators.compose([Validators.required])],
        state: [
          "",
          Validators.compose([
            Validators.required,
            Validators.pattern(/^[a-zA-Z\s.'-]{2,}$/), // Indian states
          ]),
        ],
        country: [
          "",
          Validators.compose([
            Validators.required,
            Validators.pattern(/^[a-zA-Z\s'-]{2,}$/), // Accepts names like India, United States, Côte d'Ivoire
          ]),
        ],
        zipCode: [
          "",
          Validators.compose([
            Validators.required,
            Validators.pattern(/^[1-9][0-9]{5}$/), // 6-digit Indian PIN code starting 1-9
          ]),
        ],
      }),
      permanentAddress: this.fb.group({
        addressLine1: ["", Validators.compose([Validators.required])],
        addressLine2: [""],
        city: ["", Validators.compose([Validators.required])],
        state: [
          "",
          Validators.compose([
            Validators.required,
            Validators.pattern(/^[a-zA-Z\s.'-]{2,}$/), // Indian states
          ]),
        ],
        country: [
          "",
          Validators.compose([
            Validators.required,
            Validators.pattern(/^[a-zA-Z\s'-]{2,}$/), // Accepts names like India, United States, Côte d'Ivoire
          ]),
        ],
        zipCode: [
          "",
          Validators.compose([
            Validators.required,
            Validators.pattern(/^[1-9][0-9]{5}$/), // 6-digit Indian PIN code starting 1-9
          ]),
        ],
      }),
      linkedinUrl: [
        "",
        Validators.pattern(/^https?:\/\/(www\.)?linkedin\.com\/.*$/),
      ],
      facebookUrl: [
        "",
        Validators.pattern(/^https?:\/\/(www\.)?facebook\.com\/.*$/),
      ],
      twitterUrl: [
        "",
        Validators.pattern(/^https?:\/\/(www\.)?twitter\.com\/.*$/),
      ],
    });

    if (this.userId.trim() !== "") {
      this.getEmployeeDetail();
    }
  }

  toTitleCaseAndTrim(event: any, controlPath: string): void {
    const value = event.detail.value;
    const formattedValue = value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ") // normalize multiple spaces
      .replace(
        /\w\S*/g,
        (txt: string) => txt.charAt(0).toUpperCase() + txt.substring(1)
      );

    // Get the control using the provided path
    const control = this.getControlByPath(controlPath);
    // Only set the value if the control exists
    if (control) {
      control.setValue(formattedValue, { emitEvent: false });
    }
  }

  // Helper method to get control by path (handles nested form groups)
  getControlByPath(path: string): AbstractControl | null {
    const parts = path.split(".");
    let currentControl: AbstractControl | null = this.employeeForm;

    for (const part of parts) {
      if (currentControl instanceof FormGroup) {
        currentControl = currentControl.get(part);
        if (!currentControl) return null;
      } else {
        return null;
      }
    }

    return currentControl;
  }

  getEmployeeDetail() {
    this.loader.present("fullHide");
    this.shareServ.getEmployeeById(this.userId).subscribe(
      (res) => {
        if (res) {
          this.employeeDetail = res;
          this.employeeForm.patchValue(res);
          this.loader.dismiss();
        }
      },
      (error) => {
        this.loader.dismiss();
      }
    );
  }

  restrictToNumbers(event: any) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, ""); // Only keep numbers
  }

  expandCard(cardName: string) {
    const index = this.expandedCard.findIndex((e: string) => e === cardName);
    if (index != -1) {
      this.expandedCard.splice(index, 1);
    } else {
      this.expandedCard.push(cardName);
    }
  }
  isExpanded(cardName: string) {
    return this.expandedCard.includes(cardName);
  }

  sameAddress(event: CustomEvent) {
    if (event.detail.checked === true) {
      (this.employeeForm.controls["permanentAddress"] as FormGroup).patchValue(
        (this.employeeForm.controls["currentAddress"] as FormGroup).value
      );
    } else {
      (this.employeeForm.controls["permanentAddress"] as FormGroup).reset();
    }
  }

  checkSameAddress() {
    const permanentAdd = (
      this.employeeForm.controls["permanentAddress"] as FormGroup
    ).value;
    const currentAdd = (
      this.employeeForm.controls["currentAddress"] as FormGroup
    ).value;
    return permanentAdd &&
      currentAdd &&
      Object.values(permanentAdd)[0] !== "" &&
      Object.values(currentAdd)[0] !== ""
      ? JSON.stringify(currentAdd) === JSON.stringify(permanentAdd)
      : false;
  }

  handleInput(event: Event) {
    this.loader.present("");
    event.preventDefault();
    event.stopPropagation();
    console.log(event, "file input");

    const file = (event.target as any).files[0];

    if ((file.type as string).toLowerCase().search("image") != -1) {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      let imgPath: string = "";
      reader.onload = (event: ProgressEvent) => {
        console.log(event.target, "readerEnvent");
        imgPath = ((event.target as FileReader)?.result as string) || "";
        this.imgUrl = imgPath;
        this.loader.dismiss();
      };
    } else {
      alert("Please upload image in jpeg, jpg, png format.");
      this.loader.dismiss();
    }
  }

  setDob(event: DatetimeCustomEvent) {
    this.employeeForm.patchValue({
      dateOfBirth: moment.utc(event.detail.value).format(),
    });
  }
  getDob() {
    const formValue = this.employeeForm.controls["dateOfBirth"].value;
    return formValue ? new Date(moment(formValue).format()) : "";
  }

  submit() {
    if (this.employeeForm.invalid) {
      return;
    } else {
      this.loader.present("");
      this.adminServ
        .updateEmployee(this.employeeDetail.guid, this.employeeForm.value)
        .subscribe(
          (res) => {
            if (res) {
              this.shareServ.presentToast(
                "Profile updated successfully.",
                "top",
                "success"
              );
              // this.modalCtrl.dismiss(res, 'confirm');
              this.loader.dismiss();
              const lastRoute =
                localStorage.getItem("lastRoute") || "/tabs/home";
              localStorage.setItem("lastRoute", "/tabs/home");
              this.router.navigateByUrl(lastRoute, { replaceUrl: true });
            }
          },
          (error) => {
            this.shareServ.presentToast(
              error.error || error.error.message,
              "top",
              "danger"
            );
            this.loader.dismiss();
          }
        );
    }
  }

  goBack() {
    const lastRoute = localStorage.getItem("lastRoute") || "/tabs/home";
    this.router.navigate([lastRoute]);
  }
  getName() {
    if (this.employeeDetail) {
      if (
        this.employeeDetail.lastName &&
        this.employeeDetail.lastName.trim() !== ""
      ) {
        return `${this.employeeDetail.firstName.slice(
          0,
          1
        )}${this.employeeDetail.lastName.slice(0, 1)}`;
      } else {
        return `${this.employeeDetail.firstName.slice(0, 2)}`;
      }
    } else {
      return "UK";
    }
  }
  getGroup(ctrlName: string) {
    return this.employeeForm.get(ctrlName) as FormGroup;
  }
}
