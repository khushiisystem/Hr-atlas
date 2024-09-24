import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgOtpInputConfig } from 'ng-otp-input';
import { IOptVerifyRequest } from 'src/app/interfaces/request/IOtpRequest';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
})
export class ForgotPasswordPage implements OnInit {
  otpCtrl!: FormControl;
  getOTPForm!: FormGroup;
  passwordForm!: FormGroup;
  otpConfig: NgOtpInputConfig = {
    length: 6,
    allowNumbersOnly: true,
    inputClass: 'otp_input',
    containerClass: 'otp_input_container'
  };
  userEvents: string[] = ['sendOTP', 'getOTP', 'setPassword'];
  activeEvent: string = 'sendOTP';
  showPassword: boolean = false;
  showConfigPassword: boolean = false;
  isInProgress: boolean = false;

  constructor(
    private shareServ: ShareService,
    private loader: LoaderService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.otpCtrl = new FormControl('', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(6)]));
    this.getOTPForm = this.fb.group({
      emailOrPhone: ['', Validators.compose([Validators.required, Validators.email])],
      isEmail: true
    });
    this.passwordForm = this.fb.group({
      emailOrPhone: ['', Validators.compose([Validators.required, Validators.email])],
      isEmail: true,
      password: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      confirmPassword: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });
  }

  onOtpChange(event: any){
    this.otpCtrl.setValue(event);
    const val = this.otpCtrl.value;
    if(this.otpCtrl.valid){
      let otpTimeOut = setTimeout(() => {
        this.verifyOtp();
        this.loader.dismiss();
        clearTimeout(otpTimeOut);
      }, 2000);
    }
  }

  getOtp(){
    if(this.getOTPForm.valid){
      this.isInProgress = true;
      this.passwordForm.patchValue(this.getOTPForm.value);
      this.loader.present('');
      this.shareServ.getOTP(this.getOTPForm.value).subscribe(res => {
        if(res) {
          this.shareServ.presentToast('OTP sent in your registered email.', 'top', 'success');
          this.activeEvent = 'getOTP';
          this.loader.dismiss();
          this.isInProgress = false;
        }
      }, (error) => {
        this.shareServ.presentToast('Something is wrong..', 'top', 'danger');
        this.loader.dismiss();
        this.isInProgress = false;
      });
    }
  }

  verifyOtp(){
    // console.log(this.otpCtrl.value, "value");
    // console.log(this.getOTPForm.value, "email form");
    this.loader.present('');
    this.isInProgress = true;
    const data: IOptVerifyRequest = {
      emailOrPhone: this.getOTPForm.controls['emailOrPhone'].value,
      isEmail: true,
      otp: this.otpCtrl.value
    };
    this.shareServ.verifyOTP(data).subscribe(res => {
      if(res) {
        this.shareServ.presentToast('OTP verification successful.', 'top', 'success');
        this.activeEvent = 'setPassword';
        this.loader.dismiss();
        this.isInProgress = false;
      }
    }, (error) => {
      this.shareServ.presentToast('Something is wrong.', 'top', 'danger');
      this.loader.dismiss();
      this.isInProgress = false;
    });
    this.activeEvent = 'setPassword';
  }

  isSamePassword(){
    const oldPass = this.passwordForm.controls['password'].value;
    const newPass = this.passwordForm.controls['confirmPassword'].value;
    return oldPass && newPass ? oldPass === newPass :  true;
  }

  setPassword(){
    this.isInProgress = true;
    if(this.passwordForm.invalid){
      this.shareServ.presentToast('Form was not completed.', 'top', 'danger');
      this.isInProgress = false;
      return;
    } else {
      this.loader.present('');
      this.shareServ.resetPassword(this.passwordForm.value).subscribe(res => {
        if(res) {
          this.shareServ.presentToast('Password successfully changed.', 'top', 'success');
          this.activeEvent = 'sendOTP';
          this.isInProgress = false;
          history.back();
          this.loader.dismiss();
        }
      }, (error) => {
        this.shareServ.presentToast('Something is wrong or Enter new Password.', 'top', 'danger');
        this.loader.dismiss();
        this.isInProgress = false;
      });
    }
  }

  passwordFormSubmit(event: KeyboardEvent){
    if(this.passwordForm.valid && event.key === 'Enter'){
      this.setPassword();
    }
  }

  emailFormSubmit(event: KeyboardEvent){
    if(this.getOTPForm.valid && event.key === 'Enter'){
      this.getOtp();
    }
  }

  goBack(){history.back();}

}
