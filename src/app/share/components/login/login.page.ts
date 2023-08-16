import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/auth.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

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
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
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
      this.authServ.emailLogin(this.loginForm.value).subscribe(res => {
        if(res){
          this.shareServ.presentToast('Login successful.', 'top', 'success');
          this.router.navigateByUrl('/tabs/home');
          this.loader.dismiss();
          this.isInProgress = false;
        }
      }, (error) => {
        this.shareServ.presentToast('Something is wrong.', 'top', 'danger');
        this.loader.dismiss();
        this.isInProgress = false;
      })
      this.router.navigateByUrl('/tabs/home');
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
