import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SharePageRoutingModule } from './share-routing.module';

import { SharePage } from './share.page';
import { LoginPage } from './components/login/login.page';
import { ForgotPasswordPage } from './components/forgot-password/forgot-password.page';
import { ChangePasswordPage } from './components/change-password/change-password.page';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    FormsModule,
    IonicModule,
    SharePageRoutingModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  exports: [ChangePasswordPage],
  declarations: [SharePage, LoginPage, ForgotPasswordPage, ChangePasswordPage],
  providers: []
})
export class SharePageModule {}
