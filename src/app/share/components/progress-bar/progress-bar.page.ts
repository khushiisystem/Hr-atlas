import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'circular-progress-bar',
  templateUrl: './progress-bar.page.html',
  styleUrls: ['./progress-bar.page.scss'],
})
export class ProgressBarPage implements OnInit {
  @Input() value: number = 0;
  @Input() maxValue: number = 100;
  @Input() color: string = '#007bff';

  constructor() { }
  
  ngOnInit() {
  }
  
  calculatePercentage(): number {
    return (this.value / this.maxValue) * 100;
  }
  calculateAngle(): string {
    return `${(this.value/this.maxValue)*360}deg`;
  }
  calculateArcPath(value: number, maxValue: number): string {
    const radius = 120;
    const cx = 125;
    const cy = 125;
    const startAngle = -Math.PI / 2; // Start from the top
    const endAngle = startAngle + (value / maxValue) * (2 * Math.PI); // Convert value to radians
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArcFlag = value / maxValue > 0.5 ? 1 : 0; // Whether the arc is greater than 180 degrees
    const path = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${x2} ${y2}`;

    return path;
  }
}
