import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';
import { UserStateService } from 'src/app/services/userState.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  inputvalue: string | undefined;
  inputValue!: string;
  loginForm!: FormGroup;
  showPassword: boolean = false;
  isInProgress: boolean = false;

  constructor(
    public router: Router,
    private fb: FormBuilder,
    private authServ: AuthService,
    private shareServ: ShareService,
    private loader: LoaderService,
    private userStateServ: UserStateService,
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      emailOrPhone: ['', Validators.required],
      // isEmail: true,
      password: ['', Validators.required]
    });
  }

  login(){
    console.log(this.loginForm.value);
    if(this.loginForm.invalid){
      this.shareServ.presentToast('Form is not completed.', 'top', 'danger');
      return;
    } else {
      this.loader.present('');
      this.isInProgress = true;
      this.authServ.emailLogin(this.loginForm.value).subscribe(async res => {
        if(res){
          this.shareServ.presentToast('Login successful.', 'top', 'success');
          this.isInProgress = false;
          this.loginForm.reset();
          const userId = localStorage.getItem('userId') || "";
          this.shareServ.getEmployeeById(userId).subscribe(async res => {
            this.userStateServ.updateState(res);

            if(res.role === 'Employee'){
              localStorage.setItem('isSwitchable', 'false');
            } else {
              localStorage.setItem('isSwitchable', 'true');
            }
            localStorage.setItem('isFirst' , String(true))
          });
          this.router.navigateByUrl('/tabs/home');
          this.loader.dismiss();
        }
      }, (error) => {
        this.shareServ.presentToast(error.error.Message, 'top', 'danger');
        this.loader.dismiss();
        this.isInProgress = false;
      });
    }
  }


  validateInput(inputValue: string): boolean {
    const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    const phonePattern = /^\d{10}$/;

    return emailPattern.test(inputValue) || phonePattern.test(inputValue);
  }
  
  checkInput() {
    if (this.validateInput(this.inputValue)) {
      console.log('valid output');
      this.router.navigate(['./home']);
    } else {
      console.log('Invalid input');
    }
  }

  formSubmit(event: KeyboardEvent){
    if(this.loginForm.valid && event.key === 'Enter'){
      this.login();
    }
  }
}
