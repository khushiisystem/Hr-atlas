import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { DirectoryPage } from './components/directory/directory.page';
import { AttendancePage } from '../employee/attendance/attendance.page';
import { ProfilePage } from '../employee/profile/profile.page';
import { Tab1Page } from '../tab1/tab1.page';
import { AuthGuard } from '../core/auth.guard';
import { AddEmployeePage } from '../admin/add-employee/add-employee.page';
import { EmployeeListPage } from './components/employee-list/employee-list.page';
import { SettingsPage } from './components/settings/settings.page';
import { EditProfilePage } from '../employee/edit-profile/edit-profile.page';
import { EmployeeProfilePage } from '../employee/employee-profile/employee-profile.page';
import { PayrollSetupPage } from '../admin/payroll-setup/payroll-setup.page';
import { PayrollPage } from '../employee/payroll/payroll.page';
import { AdditionalSetupPage } from '../admin/additional-setup/additional-setup.page';
import { AdminProfilePage } from '../admin/admin-profile/admin-profile.page';
import { LeavesPage } from '../employee/leaves/leaves.page';
import { RoleGuard } from '../core/role.guard';
import { AdminLeavesPage } from '../admin/admin-leaves/admin-leaves.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        title: 'HR Payroll | Spundan',
        component: Tab1Page,
        canActivate: [AuthGuard],
      },
      {
        path: 'directory',
        title: "Directory",
        component: DirectoryPage,
        canActivate: [AuthGuard]
      },
      {
        path: 'attendance',
        title: "Attendance",
        component: AttendancePage,
        canActivate: [AuthGuard]
      },
      {
        path: 'additional-setup',
        title: "Additional Setup",
        component: AdditionalSetupPage,
        canActivate:[AuthGuard, RoleGuard],
        data: {role: "Admin"}
      },
      {
        path: 'profile',
        loadChildren: () => import('../employee/profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'admin-profile',
        title: 'Admin Profile',
        component: AdminProfilePage,
        canActivate:[AuthGuard, RoleGuard],
        data: {role: "Admin"}
      },
      {
        path: 'add-employee',
        title: "Add Employee",
        component: AddEmployeePage,
      },
      {
        path: 'employee-list',
        title: "Employee List",
        component: EmployeeListPage,
        canActivate:[AuthGuard, RoleGuard],
        data: {role: "Admin"}
      },
      {
        path: 'settings',
        title: "Settings",
        component: SettingsPage,
        canActivate:[AuthGuard, RoleGuard],
        data: {role: "Admin"}
      },
      {
        path: 'edit-profile/:employeeId',
        title: "Edit Profile",
        component: EditProfilePage
      },
      {
        path: 'employee-profile/:employeeId',
        title: "Employee Profile",
        component: EmployeeProfilePage
      },
      {
        path: 'payroll-setup/:employeeId',
        title: "Payroll Setup",
        component: PayrollSetupPage,
        canActivate:[AuthGuard, RoleGuard],
        data: {role: "Admin"}
      },
      {
        path: 'payroll',
        title: "Payroll",
        component: PayrollPage,
        canActivate:[AuthGuard],
      },
      {
        path: 'leaves',
        title: "Apply Leave",
        component: LeavesPage
      },
      {
        path: 'admin-leaves',
        title: "Admin Leaves",
        component: AdminLeavesPage,
        canActivate:[AuthGuard, RoleGuard],
        data: {role: "Admin"}
      },
      {
        path: 'directory',
        title: 'Directory',
        component: DirectoryPage
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      },
    ],
    // canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
