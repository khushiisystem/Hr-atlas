import { Component, OnInit } from '@angular/core';
import { AbstractControl, AbstractControlOptions, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/auth.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit {
  changePasswordForm!: FormGroup;
  isInProgress: boolean = false;
  showOldPassword: boolean = false;
  showNewPassword: boolean = false;

  constructor(
    private authServ: AuthService,
    private shareServ: ShareService,
    private fb: FormBuilder,
    private loader: LoaderService,
  ) { }

  ngOnInit() {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      newPassword: ['', Validators.compose([Validators.required, Validators.minLength(6)])],
      confirmPassword: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    },
    {validators:this.passwordValidator} as AbstractControlOptions
    );
  }

  isSamePassword(){
    const oldPass = this.changePasswordForm.controls['oldPassword'].value;
    const newPass = this.changePasswordForm.controls['newPassword'].value;
    return oldPass && newPass ? oldPass === newPass : false;
  }

  submit(){
    this.loader.present('');
    this.isInProgress = true;
    if(this.changePasswordForm.invalid){
      this.shareServ.presentToast('Please complete the form.', 'top', 'danger');
      this.isInProgress = false;
      this.loader.dismiss();
      return;
    } else {
      this.shareServ.changePassword(this.changePasswordForm.value).subscribe(res => {
        if(res) {
          this.shareServ.presentToast('Password changed successfully.', 'top', 'success');
          this.isInProgress = false;
          history.back();
          this.loader.dismiss();
        }
      }, (error) => {
        this.shareServ.presentToast(error.error.Message ||'Something is wrong.', 'top', 'danger');
        this.isInProgress = false;
        this.loader.dismiss();
      });
    }
  }

  goBack(){history.back();}
  
  passwordFormSubmit(event: KeyboardEvent){
    if(this.changePasswordForm.valid && event.key === 'Enter'){
      this.submit();
    }
  }

  passwordValidator: ValidatorFn = (contorl: AbstractControl): Validators | null => {
    const oldPassword = contorl.get('oldPassword');
    const newPassword = contorl.get('newPassword');
    const confirmPassword = contorl.get('confirmPassword');

    if(oldPassword && newPassword && (oldPassword.value && newPassword.value) && (oldPassword.value === newPassword.value)){
      return {passwordmatcherror: true}
    } else if(newPassword && confirmPassword && (newPassword.value && confirmPassword.value) && (newPassword.value !== confirmPassword.value)){
      return {passwordnotmatcherror: true}
    } else {return false}
  }

}
