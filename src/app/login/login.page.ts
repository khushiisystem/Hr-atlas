import { Component, OnInit } from '@angular/core';
import{Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {
  }
  inputvalue: string | undefined;
  inputValue!: string;

  
    


validateInput(inputValue: string): boolean {
  const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const phonePattern = /^\d{10}$/;

  return emailPattern.test(inputValue) || phonePattern.test(inputValue);
}
checkInput() {
  if (this.validateInput(this.inputValue)) {
    console.log("valid output");
    this.router.navigate(['./home'])

   
  } else {
    console.log('Invalid input');
  }
}


}
