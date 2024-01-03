import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeavesPage } from './leaves.page';
import { EmployeeLeavesPage } from 'src/app/employee/employee-leaves/employee-leaves.page';
import { AdminLeavesPage } from 'src/app/admin/admin-leaves/admin-leaves.page';
import { LeaveApplyFormPage } from '../leave-apply-form/leave-apply-form.page';
import { ReadMorePageModule } from '../components/read-more/read-more.module';

@NgModule({
    exports: [LeavesPage, EmployeeLeavesPage, AdminLeavesPage, LeaveApplyFormPage],
    declarations: [LeavesPage, EmployeeLeavesPage, AdminLeavesPage, LeaveApplyFormPage],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ReactiveFormsModule,
        ReadMorePageModule,
    ]
})
export class LeavesPageModule {}
