import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy, RouterModule } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { FileSaverModule } from "ngx-filesaver";
import { CommonModule, DatePipe } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { AuthGuard } from "./core/auth.guard";
import { TokenInterceptor } from "./core/token.interceptor";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LeaveSetupPage } from "./admin/leave-setup/leave-setup.page";
import { EmployeeWorkWeekPage } from "./employee/employee-work-week/employee-work-week.page";
import { NgOtpInputModule } from "ng-otp-input";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NameImgPageModule } from "./share/components/name-img/name-img.module";

@NgModule({
  declarations: [
    AppComponent,
    LeaveSetupPage,
    EmployeeWorkWeekPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FileSaverModule,
    HttpClientModule,
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgOtpInputModule,
    NameImgPageModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    AuthGuard,
    DatePipe,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
