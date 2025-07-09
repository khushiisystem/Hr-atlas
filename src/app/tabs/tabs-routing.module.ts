import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { DirectoryPage } from './components/directory/directory.page';
import { AttendancePage } from '../employee/attendance/attendance.page';
import { ProfilePage } from '../employee/profile/profile.page';
import { Tab1Page } from '../tab1/tab1.page';
import { AuthGuard } from '../core/auth.guard';
import { AddEmployeePage } from '../admin/add-employee/add-employee.page';
import { SettingsPage } from './components/settings/settings.page';
import { EditProfilePage } from '../employee/edit-profile/edit-profile.page';
import { EmployeeProfilePage } from '../employee/employee-profile/employee-profile.page';
import { PayrollSetupPage } from '../admin/payroll-setup/payroll-setup.page';
import { PayrollPage } from '../employee/payroll/payroll.page';
import { AdditionalSetupPage } from '../admin/additional-setup/additional-setup.page';
import { AdminProfilePage } from '../admin/admin-profile/admin-profile.page';
import { RoleGuard } from '../core/role.guard';
import { AdminLeavesPage } from '../admin/admin-leaves/admin-leaves.page';
import { AddExperiencePage } from '../admin/add-experience/add-experience.page';
import { SalarySetupPage } from '../admin/salary/salary-setup/salary-setup.page';
import { SalaryIncrementsPage } from '../admin/salary-increments/salary-increments.page';
import { ViewCalendarPage } from '../admin/view-calendar/view-calendar.page';
import { LeavesPage } from '../share/leaves/leaves.page';
import { SalaryPage } from '../admin/salary/salary.page';
import { EmployeePayrollPage } from '../admin/payroll-setup/employee-payroll/employee-payroll.page';
import { AttendanceStatusPage } from '../admin/attendance-status/attendance-status.page';
import { ProjectsPage } from '../admin/projects/projects.page';
import { AssignProjectPage } from '../admin/projects/assign-project/assign-project.page';
import { ProTimelinePage } from '../employee/pro-timeline/pro-timeline.page';
import { TimeSheetPage } from '../employee/time-sheet/time-sheet.page';
import { ProjectDetailsPage } from '../admin/projects/project-details/project-details.page';
import { TimesheetCategoryPage } from '../admin/timesheet-category/timesheet-category.page';
import { TimesheetSubCategoryPage } from '../admin/timesheet-sub-category/timesheet-sub-category.page';
import { TimesheetFormPage } from '../employee/time-sheet/timesheet-form/timesheet-form.page';
import { AdminTimesheetsPage } from '../admin/admin-timesheets/admin-timesheets.page';
import { PdfDetailsPage } from '../share/components/pdf-details/pdf-details.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        title: 'HR Atlas',
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
        path: 'projects',
        title: "Projects",
        component: ProjectsPage,
        canActivate: [AuthGuard]
      },
      // {
      //   path: 'project-timeline',
      //   title: "Projects Timeline",
      //   component: ProTimelinePage,
      //   canActivate: [AuthGuard]
      // },
      {
        path: 'assign-project',
        title: "Assign Project",
        component: AssignProjectPage,
        canActivate: [AuthGuard]
      },
      {
        path: 'time-sheet/:id',
        title: "Time Sheet",
        component: TimeSheetPage,
        canActivate: [AuthGuard],
      },
      {
        path: 'time-sheet',
        title: "Time Sheet",
        component: TimeSheetPage,
        canActivate:[AuthGuard, RoleGuard],
        data: {role: ["Admin", "HR"]}
      },
      {
        path: 'admin-timesheet',
        title: "Admin Timesheet",
        component: AdminTimesheetsPage,
        canActivate:[AuthGuard, RoleGuard],
        data: {role: ["Admin"]}
      },

      {
        path: 'timesheet-form',
        title: "Timesheet Form",
        component: TimesheetFormPage,
        canActivate: [AuthGuard]
      },
      {
        path: 'category',
        title: 'TimeSheet Category',
        component: TimesheetCategoryPage,
        canActivate: [AuthGuard]
      },
      {
        path: 'sub-category',
        title: 'TimeSheet Sub-Category',
        component: TimesheetSubCategoryPage,
        canActivate: [AuthGuard]
      },
      {
        path: 'pdf-details',
        title: 'Pdf Details',
        component: PdfDetailsPage,
        canActivate: [AuthGuard]
      },
      // {
      //   path: 'project-details',
      //   title: "Project Details",
      //   component: ProjectDetailsPage,
      //   canActivate: [AuthGuard]
      // },
      {
        path: 'attendance/:id',
        title: "Attendance",
        component: AttendancePage,
        canActivate: [AuthGuard]
      },
      {
        path: 'additional-setup',
        title: "Additional Setup",
        component: AdditionalSetupPage,
        canActivate:[AuthGuard, RoleGuard],
        data: {role: ["Admin", "HR"]}
      },
      {
        path: 'profile',
        loadChildren: () => import('../employee/profile/profile.module').then(m => m.ProfilePageModule),
        canActivate: [AuthGuard, RoleGuard],
        data: {role: ["Employee"]}
      },
      {
        path: 'admin-profile',
        title: 'Admin Profile',
        component: AdminProfilePage,
        canActivate:[AuthGuard, RoleGuard],
        data: {role: ["Admin", "HR"]}
      },
      {
        path: 'add-employee/:action/:employeeId',
        title: "Add Employee",
        component: AddEmployeePage,
        canActivate: [AuthGuard, RoleGuard],
        data: {role: ["Admin", "HR"]}
      },
      {
        path: 'settings',
        title: "Settings",
        component: SettingsPage,
        canActivate:[AuthGuard, RoleGuard],
        data: {role: ["Admin", "HR"]}
      },
      {
        path: 'edit-profile/:employeeId',
        title: "Edit Profile",
        component: EditProfilePage,
        canActivate:[AuthGuard],
      },
      {
        path: 'employee-profile/:employeeId',
        title: "Employee Profile",
        component: EmployeeProfilePage,
        canActivate: [AuthGuard]
      },
      {
        path: 'employee/workinfo',
        title: "Employee Workinfo",
        component: AddExperiencePage,
        canActivate:[AuthGuard, RoleGuard],
        data: {role: ["Admin", "HR"]}
      },
      {
        path: 'payroll-setup',
        title: "Payroll Setup",
        component: PayrollSetupPage,
        canActivate:[AuthGuard, RoleGuard],
        data: {role: ["Admin", "HR"]}
      },
      {
        path: 'employee-payroll',
        component: EmployeePayrollPage,
        canActivate:[AuthGuard, RoleGuard],
        data: {role: ["Admin"]}
      },
      {
        path: 'payroll/:id',
        title: "Payroll",
        component: PayrollPage,
        canActivate:[AuthGuard],
      },
      {
        path: 'leaves',
        title: "Apply Leave",
        component: LeavesPage,
        canActivate:[AuthGuard],
      },
      {
        path: 'admin-leaves',
        title: "Admin Leaves",
        component: AdminLeavesPage,
        canActivate:[AuthGuard, RoleGuard],
        data: {role: ["Admin", "HR"]}
      },
      {
        path: 'directory',
        title: 'Directory',
        component: DirectoryPage,
        canActivate:[AuthGuard],
      },
      {
        path: 'salary-setup',
        title: 'Salary Setup',
        component: SalarySetupPage,
        canActivate:[AuthGuard, RoleGuard],
        data: {role: ["Admin"]}
      },
      {
        path: 'salary',
        title: 'Salary',
        component: SalaryPage,
        canActivate:[AuthGuard, RoleGuard],
        data: {role: ["Admin"]}
      },
      {
        path: 'view-salary-increments',
        title: 'View Salary Increments',
        component: SalaryIncrementsPage,
        canActivate:[AuthGuard, RoleGuard],
        data: {role: ["Admin"]}
      },
      {
        path: 'view-calendar',
        title: 'View Calendar',
        component: ViewCalendarPage,
        canActivate:[AuthGuard],
        data: {role: ["Admin"]}
      },
      {
        path: 'attendance-status',
        title: 'Today\'s Attendance',
        component: AttendanceStatusPage,
        canActivate:[AuthGuard, RoleGuard],
        data: {role: ["Admin", "HR"]},
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
