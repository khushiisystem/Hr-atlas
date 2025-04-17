import { AfterContentInit, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-name-img',
  templateUrl: './name-img.page.html',
  styleUrls: ['./name-img.page.scss'],
})
export class NameImgPage implements OnInit, AfterContentInit {
  @Input() name: string = "";
  @Input() classes: string = "";
  @Input('bgcolor') bgColor: string = "";
  @Input('textcolor') textColor: string = "";

  constructor() { }

  ngOnInit() {
  }

  ngAfterContentInit(): void {
    // Generate a random hex color if bgColor is not provided
    if (!this.bgColor) {
      this.bgColor = this.getRandomHexColor();
    }

    // Ensure bgColor is in rgba format
    if (!this.isRgbaFormat(this.bgColor)) {
      this.bgColor = this.hexToRgba(this.bgColor);
    }

    this.textColor = this.calculateTextColor(this.bgColor);
  }

  private isRgbaFormat(color: string): boolean {
    return color.toLowerCase().startsWith("rgba");
  }

  private hexToRgba(hexColor: string): string {
    // Convert hex to RGB
    const bigint = parseInt(hexColor.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    // Convert RGB to RGBA
    const rgbaColor = `rgba(${r}, ${g}, ${b}, 1)`;
    return rgbaColor;
  }

  private getRandomHexColor(): string {
    // Generate a random hex color code
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

  private calculateTextColor(backgroundColor: string): string {
    // Implement your logic to determine text color based on background color brightness
    // This is a simple example, adjust it based on your needs
    const brightness = this.calculateBrightness(backgroundColor);
    const lightTextColor = "rgb(255, 255, 255)";
    const darkTextColor = "rgb(0, 0, 0)";

    return brightness > 128 ? darkTextColor : lightTextColor;
  }

  private calculateBrightness(color: string): number {
    // Extract RGB values from rgba string
    const rgbValues = color.match(/\d+/g);
    if (rgbValues) {
      const [r, g, b] = rgbValues.map(Number);
      // Calculate brightness using the formula
      return (r * 299 + g * 587 + b * 114) / 1000;
    }

    // Default to a mid-range brightness if extraction fails
    return 128;
  }

}
