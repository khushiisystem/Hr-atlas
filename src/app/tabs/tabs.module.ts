import { IonicModule } from "@ionic/angular";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { TabsPageRoutingModule } from "./tabs-routing.module";

import { TabsPage } from "./tabs.page";
import { AuthGuard } from "../core/auth.guard";
import { AddEmployeePage } from "../admin/add-employee/add-employee.page";
import { EmployeeListPage } from "./components/employee-list/employee-list.page";
import { SettingsPage } from "./components/settings/settings.page";
import { AttendanceSetupPage } from "../admin/attendance-setup/attendance-setup.page";
import { EmployeeProfilePage } from "../employee/employee-profile/employee-profile.page";
import { EditProfilePage } from "../employee/edit-profile/edit-profile.page";
import { PayrollSetupPage } from "../admin/payroll-setup/payroll-setup.page";
import { PayrollPage } from "../employee/payroll/payroll.page";
import { AttendancePage } from "../employee/attendance/attendance.page";
import { AdditionalSetupPage } from "../admin/additional-setup/additional-setup.page";
import { RouterModule } from "@angular/router";
import { AdminProfilePage } from "../admin/admin-profile/admin-profile.page";
import { Tab1Page } from "../tab1/tab1.page";
import { NameImgPageModule } from "../share/components/name-img/name-img.module";
import { LeavesPage } from "../employee/leaves/leaves.page";
import { LeaveApplyFormPage } from "../employee/leaves/leave-apply-form/leave-apply-form.page";
import { DirectoryPage } from "./components/directory/directory.page";
import { RoleGuard } from "../core/role.guard";
import { AdminLeavesPageModule } from "../admin/admin-leaves/admin-leaves.module";
import { AddExperiencePageModule } from "../admin/add-experience/add-experience.module";
import { EmployeesPageModule } from "../share/employees/employees.module";
import { SalarySetupPage } from "../admin/salary-setup/salary-setup.page";
import { SalaryIncrementsPage } from "../admin/salary-increments/salary-increments.page";
import { HollydaySetupPage } from "../admin/hollyday-setup/hollyday-setup.page";
import { ViewCalendarPage } from "../admin/view-calendar/view-calendar.page";
import { EmployeeAttendancePage } from "../admin/employee-attendance/employee-attendance.page";

@NgModule({
  declarations: [
    TabsPage,
    Tab1Page,
    AddEmployeePage,
    EmployeeListPage,
    SettingsPage,
    AttendanceSetupPage,
    EmployeeProfilePage,
    EditProfilePage,
    PayrollSetupPage,
    PayrollPage,
    AttendancePage,
    AdditionalSetupPage,
    AdminProfilePage,
    LeavesPage,
    LeaveApplyFormPage,
    DirectoryPage,
    SalarySetupPage,
    SalaryIncrementsPage,
    HollydaySetupPage,
    ViewCalendarPage,
    EmployeeAttendancePage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabsPageRoutingModule,
    RouterModule,
    NameImgPageModule,
    AdminLeavesPageModule,
    AddExperiencePageModule,
    EmployeesPageModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [AuthGuard, RoleGuard],
})
export class TabsPageModule {}
