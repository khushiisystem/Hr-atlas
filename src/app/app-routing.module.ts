import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { EmployeeWorkWeekPage } from './employee/employee-work-week/employee-work-week.page';
import { AuthGuard } from './core/auth.guard';
const routes: Routes = [
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () => import('./share/share.module').then( m => m.SharePageModule),
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'employee-work-week/:employeeId',
    title: "Work Week",
    component: EmployeeWorkWeekPage,
  },
  {
    path: 'profile-popup',
    loadChildren: () => import('./employee/profile-popup/profile-popup.module').then( m => m.ProfilePopupPageModule)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
