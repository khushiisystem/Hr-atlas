import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SharePage } from './share.page';
import { LoginPage } from './components/login/login.page';
import { ForgotPasswordPage } from './components/forgot-password/forgot-password.page';
import { ChangePasswordPage } from './components/change-password/change-password.page';

const routes: Routes = [
  {
    path: '',
    component: SharePage
  },
  {
    path: '',
    children: [
      {
        path: 'login',
        title: 'Login | HR Payroll - Spundan',
        component: LoginPage
      },
      {
        path: 'forgot-password',
        title: 'Forgot Password',
        component: ForgotPasswordPage
      },
      {
        path: 'change-password',
        title: 'Change Password',
        component: ChangePasswordPage
      },
      {
        path: '',
        redirectTo: '/login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SharePageRoutingModule {}
