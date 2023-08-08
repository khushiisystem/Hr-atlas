import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AddempPage } from './components/addemp/addemp.page';
import { AttendancePage } from './components/attendance/attendance.page';
import { LeavesPage } from './components/leaves/leaves.page';
import { PayrollPage } from './components/payroll/payroll.page';
import { ProfilePage } from './components/profile/profile.page';
import { SettingsPage } from './components/settings/settings.page';
import { DirectoryPage } from './components/directory/directory.page';
import { BiopagePage } from './components/biopage/biopage.page';
import { PersonalpagePage } from './components/personalpage/personalpage.page';
import { WorkpagePage } from './components/workpage/workpage.page';
import { TeampagePage } from './components/teampage/teampage.page';
import { WeekpagePage } from './components/weekpage/weekpage.page';
import { UserPage } from './components/user/user.page';
import { AttendanceSetupPage } from './components/attendance-setup/attendance-setup.page';
import { LeaveSetupPage } from './components/leave-setup/leave-setup.page';
import { PayrollSetupPage } from './components/payroll-setup/payroll-setup.page';
import { AdditionalSetupPage } from './components/additional-setup/additional-setup.page';
import { LOGSPage } from './components/logs/logs.page';
import { LeaveadminPage } from './components/leaveadmin/leaveadmin.page';
import { FileSaverModule } from 'ngx-filesaver';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { AuthGuard } from './core/auth.guard';

@NgModule({
  declarations: [AppComponent, AddempPage, AttendancePage, LeavesPage, PayrollPage, ProfilePage, SettingsPage, DirectoryPage, BiopagePage, PersonalpagePage, WorkpagePage, TeampagePage, WeekpagePage, UserPage, AttendanceSetupPage, LeaveSetupPage, PayrollSetupPage, AdditionalSetupPage, LOGSPage, LeaveadminPage],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, FileSaverModule, HttpClientModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, AuthGuard],
  bootstrap: [AppComponent],
})
export class AppModule {}
