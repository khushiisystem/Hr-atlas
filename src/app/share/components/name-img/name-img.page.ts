import { AfterContentInit, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-name-img',
  templateUrl: './name-img.page.html',
  styleUrls: ['./name-img.page.scss'],
})
export class NameImgPage implements OnInit, AfterContentInit {
  @Input() name: string = "";
  @Input() classes: string = "";
  bgColor: string = "";
  textColor: string = "";
  alphaChar: string = "";

  constructor() { }

  ngOnInit() {
  }

  ngAfterContentInit(): void {
    this.alphaChar = this.name.slice(0, 1);
    this.bgColor = localStorage.getItem("bgColor") || '';
    this.textColor = localStorage.getItem("textColor") || '';

    if(this.bgColor.trim() === '' || this.textColor.trim() === ''){
      let r = Math.floor((Math.random() * 256) - 1);
      let g = Math.floor((Math.random() * 256) - 1);
      let b = Math.floor((Math.random() * 256) - 1);
      // Calculate brightness of randomized colour
      let brightness = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      // Calculate brightness of white and black text
      let lightText = ((255 * 299) + (255 * 587) + (255 * 114)) / 1000;
      let darkText = ((0 * 299) + (0 * 587) + (0 * 114)) / 1000;

      this.bgColor = `rgb(${r}, ${g}, ${b})`;
      if(Math.abs(brightness - lightText) > Math.abs(brightness - darkText)){
        this.textColor = "rgb(255, 255, 255)";
      } else {
        this.textColor = "rgb(0, 0, 0)";
      }
      
      localStorage.setItem("bgColor", this.bgColor);
      localStorage.setItem("textColor", this.textColor);
    }
  }

}
