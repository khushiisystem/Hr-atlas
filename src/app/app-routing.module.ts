import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';



const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
 
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'addemp',
    loadChildren: () => import('./addemp/addemp.module').then( m => m.AddempPageModule)
  },
  {
    path: 'attendance',
    loadChildren: () => import('./attendance/attendance.module').then( m => m.AttendancePageModule)
  },
  {
    path: 'leaves',
    loadChildren: () => import('./leaves/leaves.module').then( m => m.LeavesPageModule)
  },
  {
    path: 'payroll',
    loadChildren: () => import('./payroll/payroll.module').then( m => m.PayrollPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'directory',
    loadChildren: () => import('./directory/directory.module').then( m => m.DirectoryPageModule)
  },
  {
    path: 'biopage',
    loadChildren: () => import('./biopage/biopage.module').then( m => m.BiopagePageModule)
  },
  {
    path: 'personalpage',
    loadChildren: () => import('./personalpage/personalpage.module').then( m => m.PersonalpagePageModule)
  },
  {
    path: 'workpage',
    loadChildren: () => import('./workpage/workpage.module').then( m => m.WorkpagePageModule)
  },
  {
    path: 'teampage',
    loadChildren: () => import('./teampage/teampage.module').then( m => m.TeampagePageModule)
  },
  {
    path: 'weekpage',
    loadChildren: () => import('./weekpage/weekpage.module').then( m => m.WeekpagePageModule)
  },
  {
    path: 'personalpage',
    loadChildren: () => import('./personalpage/personalpage.module').then( m => m.PersonalpagePageModule)
  },{
    path: 'user',
    loadChildren: () => import('./user/user.module').then( m => m.UserPageModule)
  },
  {
    path: 'attendance-setup',
    loadChildren: () => import('./attendance-setup/attendance-setup.module').then( m => m.AttendanceSetupPageModule)
  },
  {
    path: 'leave-setup',
    loadChildren: () => import('./leave-setup/leave-setup.module').then( m => m.LeaveSetupPageModule)
  },
  {
    path: 'payroll-setup',
    loadChildren: () => import('./payroll-setup/payroll-setup.module').then( m => m.PayrollSetupPageModule)
  },
  {
    path: 'additional-setup',
    loadChildren: () => import('./additional-setup/additional-setup.module').then( m => m.AdditionalSetupPageModule)
  },
  {
    path: 'logs',
    loadChildren: () => import('./logs/logs.module').then( m => m.LOGSPageModule)
  },
  {
    path: 'leaveadmin',
    loadChildren: () => import('./leaveadmin/leaveadmin.module').then( m => m.LeaveadminPageModule)
  },
 
  
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
