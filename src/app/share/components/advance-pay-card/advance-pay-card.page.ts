import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ICreditLogsResponse } from 'src/app/interfaces/request/IPayrollSetup';

@Component({
  selector: 'advance-pay-card',
  templateUrl: './advance-pay-card.page.html',
  styleUrls: ['./advance-pay-card.page.scss'],
})
export class AdvancePayCardPage implements OnInit {
  @Input() advancePayDetail!: ICreditLogsResponse;
  @Output() editAdvance: EventEmitter<ICreditLogsResponse> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  update(){
    this.editAdvance.emit(this.advancePayDetail);
  }

  getDate(){
    return this.advancePayDetail ? new Date(this.advancePayDetail.payslipDate) : new Date()
  }

}
