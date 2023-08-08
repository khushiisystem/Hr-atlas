import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(
    public router: Router,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login(){
    if(this.loginForm.invalid){
      return;
    } else {
      console.log(this.loginForm.value);
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
}
