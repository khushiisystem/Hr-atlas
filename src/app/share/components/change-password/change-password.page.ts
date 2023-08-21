import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
      newPassword: ['', Validators.compose([Validators.required, Validators.minLength(6)])]
    });
  }

  isSamePassword(){
    const oldPass = this.changePasswordForm.controls['oldPassword'].value;
    const newPass = this.changePasswordForm.controls['newPassword'].value;
    return oldPass && newPass ? oldPass === newPass : false;
  }

  submit(){
    this.loader.present('');
    console.log(this.changePasswordForm.value);
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
        this.shareServ.presentToast('Something is wrong.', 'top', 'danger');
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

}
